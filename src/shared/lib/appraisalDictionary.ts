import type {
  ApiEnvelope,
  AppraisalCriterion,
  AppraisalCriterionContext,
  AppraisalDictionaryItem,
  AppraisalDictionaryPayload,
  AppraisalDictionaryResponse,
  AppraisalDictionaryMeta,
  BilingualText,
  Lang,
  LegacyAppraisalDictionaryPayload,
  LegacyAppraisalDictionaryResponse,
  LegacyAppraisalItem,
} from '@/shared/types';

function isEnvelope(value: unknown): value is ApiEnvelope<AppraisalDictionaryPayload, AppraisalDictionaryMeta> {
  return typeof value === 'object' && value !== null && 'statusCode' in value && 'message' in value && 'data' in value;
}

function isV3Item(value: unknown): value is AppraisalDictionaryItem {
  return typeof value === 'object' && value !== null && 'uuid' in value && 'criteria' in value;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function toBilingualText(id: string, en?: string): BilingualText {
  return {
    id,
    en: en ?? id,
  };
}

function getRoleName(roleCode: string) {
  if (roleCode === 'qa') return 'QA';
  if (roleCode === 'frontend') return 'Frontend';
  if (roleCode === 'backend') return 'Backend';

  return roleCode
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getLevelName(levelCode: string) {
  return levelCode.charAt(0).toUpperCase() + levelCode.slice(1);
}

function getLevelRank(levelCode: string) {
  if (levelCode === 'junior') return 1;
  if (levelCode === 'middle') return 2;
  if (levelCode === 'senior') return 3;
  if (levelCode === 'lead') return 4;
  return 999;
}

function buildGoalIdentity(item: LegacyAppraisalItem) {
  if (!item.poinGroup) {
    return {
      uuid: `goal_${slugify(item.goal.code)}`,
      code: item.goal.code,
      name: toBilingualText(item.goal.label),
    };
  }

  return {
    uuid: `goal_${slugify(item.goal.code)}__${slugify(item.poinGroup.code)}`,
    code: `${item.goal.code}__${item.poinGroup.code}`,
    name: toBilingualText(`${item.goal.label} - ${item.poinGroup.label}`),
  };
}

function convertLegacyItems(items: LegacyAppraisalItem[]): AppraisalDictionaryItem[] {
  const itemMap = new Map<string, AppraisalDictionaryItem>();

  for (const item of items) {
    const goalIdentity = buildGoalIdentity(item);
    const itemKey = `${item.category.code}::${goalIdentity.code}`;
    const criterionUuid = `crt_${slugify(goalIdentity.code)}_r${item.rating}`;

    const contexts: AppraisalCriterionContext[] = Object.entries(item.examples).flatMap(([roleCode, levelExamples]) =>
      Object.entries(levelExamples).map(([levelCode, detail]) => ({
        uuid: `ctx_${slugify(goalIdentity.code)}_r${item.rating}_${slugify(roleCode)}_${slugify(levelCode)}`,
        division: {
          uuid: 'div_it',
          code: 'it',
          name: 'IT',
        },
        role: {
          uuid: `role_it_${slugify(roleCode)}`,
          code: roleCode,
          name: getRoleName(roleCode),
        },
        level: {
          uuid: `lvl_it_${slugify(roleCode)}_${slugify(levelCode)}`,
          code: levelCode,
          name: getLevelName(levelCode),
          normalizedRank: getLevelRank(levelCode),
        },
        expectation: {
          info: toBilingualText(detail.info),
          examples: detail.example.map((example, index) => ({
            uuid: `exp_${slugify(goalIdentity.code)}_r${item.rating}_${slugify(roleCode)}_${slugify(levelCode)}_${String(index + 1).padStart(2, '0')}`,
            text: toBilingualText(example),
            sortOrder: (index + 1) * 10,
          })),
        },
      })),
    );

    const criterion: AppraisalCriterion = {
      uuid: criterionUuid,
      rating: item.rating,
      name: item.criteria,
      contexts,
    };

    const existingItem = itemMap.get(itemKey);

    if (existingItem) {
      existingItem.criteria.push(criterion);
      continue;
    }

    itemMap.set(itemKey, {
      uuid: goalIdentity.uuid,
      category: {
        uuid: `cat_${slugify(item.category.code)}`,
        code: item.category.code,
        name: toBilingualText(item.category.label),
      },
      goal: goalIdentity,
      criteria: [criterion],
    });
  }

  return Array.from(itemMap.values())
    .map((item) => ({
      ...item,
      criteria: item.criteria.slice().sort((left, right) => left.rating - right.rating),
    }))
    .sort((left, right) => {
      const categoryCompare = left.category.name.en.localeCompare(right.category.name.en);
      if (categoryCompare !== 0) return categoryCompare;
      return left.goal.name.en.localeCompare(right.goal.name.en);
    });
}

function convertLegacyResponse(value: LegacyAppraisalDictionaryPayload | LegacyAppraisalDictionaryResponse): AppraisalDictionaryResponse {
  const meta = value.meta;
  const legacyItems = 'data' in value ? value.data.items : value.items;
  const notes = [...(meta.notes ?? [])];

  if (!notes.includes('legacy flat items were normalized into v3 criteria and contexts for dictionary consumers')) {
    notes.push('legacy flat items were normalized into v3 criteria and contexts for dictionary consumers');
  }

  const normalizedItems = convertLegacyItems(legacyItems);

  return {
    statusCode: isEnvelope(value) ? value.statusCode : 200,
    message: isEnvelope(value) ? value.message : 'Appraisal dictionary loaded successfully.',
    meta: {
      ...meta,
      schema: 'performance-appraisal.v3',
      version: 3,
      totalItems: normalizedItems.length,
      notes,
    },
    data: {
      items: normalizedItems,
    },
  };
}

export function normalizeAppraisalDictionaryResponse(
  value: AppraisalDictionaryResponse | LegacyAppraisalDictionaryPayload | LegacyAppraisalDictionaryResponse,
): AppraisalDictionaryResponse {
  if (isEnvelope(value)) {
    const items = Array.isArray(value.data?.items) ? value.data.items : [];

    if (items.length === 0 || isV3Item(items[0])) {
      return value;
    }

    return convertLegacyResponse({
      statusCode: value.statusCode,
      message: value.message,
      meta: value.meta,
      data: {
        items: value.data.items as unknown as LegacyAppraisalItem[],
      },
    });
  }

  return convertLegacyResponse(value);
}

export function getLocalizedText(value: BilingualText, lang: Lang) {
  return value[lang] || value.id || value.en;
}

function humanizeCodeSegment(value: string) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getDictionaryGoalPresentation(goal: AppraisalDictionaryItem['goal'], lang: Lang) {
  const localizedName = getLocalizedText(goal.name, lang);
  const [primaryCode, secondaryCode] = goal.code.split('__');

  if (!secondaryCode) {
    return {
      title: localizedName,
      subtitle: null,
      combinedLabel: localizedName,
      parentLabel: localizedName,
      childLabel: localizedName,
      breadcrumbItems: [localizedName],
    };
  }

  const title = humanizeCodeSegment(primaryCode);
  const subtitle = humanizeCodeSegment(secondaryCode);

  return {
    title,
    subtitle,
    combinedLabel: `${title} / ${subtitle}`,
    parentLabel: title,
    childLabel: subtitle,
    breadcrumbItems: [title, subtitle],
  };
}

export function getDictionaryContextCount(criteria: AppraisalCriterion[]) {
  return criteria.reduce((total, criterion) => total + criterion.contexts.length, 0);
}

function sortCriterionContexts(contexts: AppraisalCriterionContext[]) {
  return contexts
    .slice()
    .sort((left, right) => {
      const divisionCompare = left.division.name.localeCompare(right.division.name);
      if (divisionCompare !== 0) return divisionCompare;

      const roleCompare = left.role.name.localeCompare(right.role.name);
      if (roleCompare !== 0) return roleCompare;

      return left.level.normalizedRank - right.level.normalizedRank;
    });
}

export function groupCriterionContextsByDivision(contexts: AppraisalCriterionContext[]) {
  const divisions = new Map<
    string,
    {
      key: string;
      label: string;
      roles: Array<{
        key: string;
        label: string;
        contexts: AppraisalCriterionContext[];
      }>;
    }
  >();

  for (const context of sortCriterionContexts(contexts)) {
    const divisionKey = context.division.code;
    const roleKey = `${context.division.code}::${context.role.code}`;
    const existingDivision = divisions.get(divisionKey);

    if (!existingDivision) {
      divisions.set(divisionKey, {
        key: divisionKey,
        label: context.division.name,
        roles: [
          {
            key: roleKey,
            label: context.role.name,
            contexts: [context],
          },
        ],
      });
      continue;
    }

    const existingRole = existingDivision.roles.find((role) => role.key === roleKey);

    if (existingRole) {
      existingRole.contexts.push(context);
      continue;
    }

    existingDivision.roles.push({
      key: roleKey,
      label: context.role.name,
      contexts: [context],
    });
  }

  return Array.from(divisions.values()).map((division) => ({
    ...division,
    roles: division.roles.map((role) => ({
      ...role,
      contexts: role.contexts.slice().sort((left, right) => left.level.normalizedRank - right.level.normalizedRank),
    })),
  }));
}

export function groupCriterionContexts(contexts: AppraisalCriterionContext[]) {
  const groups = new Map<
    string,
    {
      key: string;
      label: string;
      contexts: AppraisalCriterionContext[];
    }
  >();

  const sortedContexts = sortCriterionContexts(contexts);

  for (const context of sortedContexts) {
    const key = `${context.division.code}::${context.role.code}`;
    const existing = groups.get(key);

    if (existing) {
      existing.contexts.push(context);
      continue;
    }

    groups.set(key, {
      key,
      label: `${context.role.name} · ${context.division.name}`,
      contexts: [context],
    });
  }

  return Array.from(groups.values()).map((group) => ({
    ...group,
    contexts: group.contexts.slice().sort((left, right) => left.level.normalizedRank - right.level.normalizedRank),
  }));
}