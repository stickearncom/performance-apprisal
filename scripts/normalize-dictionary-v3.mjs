import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dictionaryPath = path.resolve(__dirname, '../public/mock-api/appraisal.json');

const source = JSON.parse(fs.readFileSync(dictionaryPath, 'utf8'));
const sourceItems = source?.data?.items ?? [];

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
const toBilingual = (id, en = id) => ({ id, en });
const roleName = (code) => ({ qa: 'QA', frontend: 'Frontend', backend: 'Backend' }[code] || code);
const levelName = (code) => code.charAt(0).toUpperCase() + code.slice(1);
const levelRank = (code) => ({ junior: 1, middle: 2, senior: 3, lead: 4 }[code] ?? 999);
const humanizeCodeSegment = (value) => value.split('-').filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');

const ratingSignals = {
  1: {
    id: 'masih membutuhkan arahan intensif dan belum menunjukkan konsistensi yang memadai',
    en: 'still requires intensive guidance and does not yet show sufficient consistency',
  },
  2: {
    id: 'mulai menunjukkan dasar yang relevan tetapi penerapannya belum stabil',
    en: 'shows some relevant fundamentals but applies them inconsistently',
  },
  3: {
    id: 'sudah memenuhi ekspektasi dasar dan cukup bisa diandalkan untuk situasi rutin',
    en: 'meets the baseline expectation and is dependable in routine situations',
  },
  4: {
    id: 'terlihat kuat, konsisten, dan membantu menjaga kualitas keputusan kerja',
    en: 'is strong, consistent, and helps maintain the quality of work decisions',
  },
  5: {
    id: 'memberikan pengaruh positif yang jelas terhadap mutu kolaborasi dan hasil kerja',
    en: 'has a clear positive influence on collaboration quality and work outcomes',
  },
  6: {
    id: 'menjadi contoh yang membentuk standar tinggi bagi cara kerja tim',
    en: 'sets a high standard that meaningfully shapes how the team operates',
  },
};

const impactSignals = {
  1: {
    id: 'sering terlambat terlihat dan masih memerlukan koreksi dari pihak lain',
    en: 'often becomes visible too late and still requires correction from others',
  },
  2: {
    id: 'sudah mulai terlihat tetapi belum cukup konsisten untuk dijadikan andalan',
    en: 'is starting to become visible but is not yet consistent enough to be relied on',
  },
  3: {
    id: 'cukup stabil untuk mendukung ritme kerja sehari-hari',
    en: 'is stable enough to support day-to-day operating rhythm',
  },
  4: {
    id: 'membantu tim bergerak lebih rapi dan lebih minim rework',
    en: 'helps the team move with better structure and less rework',
  },
  5: {
    id: 'mendorong kejelasan lintas fungsi dan memperkuat kualitas eksekusi',
    en: 'drives cross-functional clarity and strengthens execution quality',
  },
  6: {
    id: 'terasa luas, proaktif, dan meningkatkan standar pengambilan keputusan',
    en: 'is broad, proactive, and raises the standard of decision-making',
  },
};

const divisionProfiles = [
  {
    division: { uuid: 'div_finance', code: 'finance', name: 'Finance' },
    role: { code: 'finance_analyst', name: 'Finance Analyst' },
    levels: {
      1: { code: 'associate', name: 'Associate' },
      2: { code: 'senior_associate', name: 'Senior Associate' },
      3: { code: 'senior_analyst', name: 'Senior Analyst' },
      4: { code: 'manager', name: 'Manager' },
    },
    focus: {
      id: 'rekonsiliasi, analisis varians, dan pelaporan keuangan',
      en: 'reconciliation, variance analysis, and financial reporting',
    },
    stakeholder: {
      id: 'pemilik budget dan pimpinan fungsi',
      en: 'budget owners and functional leaders',
    },
    output: {
      id: 'ketepatan analisis dan kualitas keputusan finansial',
      en: 'analysis accuracy and the quality of financial decisions',
    },
  },
  {
    division: { uuid: 'div_sales', code: 'sales', name: 'Sales' },
    role: { code: 'account_executive', name: 'Account Executive' },
    levels: {
      1: { code: 'associate', name: 'Associate' },
      2: { code: 'executive', name: 'Executive' },
      3: { code: 'senior_executive', name: 'Senior Executive' },
      4: { code: 'manager', name: 'Manager' },
    },
    focus: {
      id: 'manajemen pipeline, koordinasi deal, dan transisi handoff ke delivery',
      en: 'pipeline management, deal coordination, and handoff into delivery',
    },
    stakeholder: {
      id: 'prospek, klien aktif, dan pemangku kepentingan internal',
      en: 'prospects, active clients, and internal stakeholders',
    },
    output: {
      id: 'kualitas komitmen komersial dan kelancaran eksekusi account',
      en: 'commercial commitment quality and the smooth execution of accounts',
    },
  },
  {
    division: { uuid: 'div_operations', code: 'operations', name: 'Operations' },
    role: { code: 'operations_analyst', name: 'Operations Analyst' },
    levels: {
      1: { code: 'associate', name: 'Associate' },
      2: { code: 'specialist', name: 'Specialist' },
      3: { code: 'senior_specialist', name: 'Senior Specialist' },
      4: { code: 'team_lead', name: 'Team Lead' },
    },
    focus: {
      id: 'monitoring SLA, koordinasi proses, dan penyelesaian exception operasional',
      en: 'SLA monitoring, process coordination, and operational exception handling',
    },
    stakeholder: {
      id: 'tim lintas fungsi dan pemilik proses',
      en: 'cross-functional teams and process owners',
    },
    output: {
      id: 'kelancaran proses dan stabilitas eksekusi harian',
      en: 'process flow and day-to-day execution stability',
    },
  },
  {
    division: { uuid: 'div_people', code: 'people', name: 'People' },
    role: { code: 'people_partner', name: 'People Partner' },
    levels: {
      1: { code: 'associate', name: 'Associate' },
      2: { code: 'partner', name: 'Partner' },
      3: { code: 'senior_partner', name: 'Senior Partner' },
      4: { code: 'lead', name: 'Lead' },
    },
    focus: {
      id: 'dukungan employee lifecycle, koordinasi kebijakan, dan advisory ke manajer',
      en: 'employee lifecycle support, policy coordination, and manager advisory',
    },
    stakeholder: {
      id: 'karyawan, manajer, dan pemilik kebijakan',
      en: 'employees, managers, and policy owners',
    },
    output: {
      id: 'kejelasan proses people dan kualitas keputusan manajerial',
      en: 'people process clarity and the quality of managerial decisions',
    },
  },
];

function getGoalDisplayLabel(goalCode, fallbackName) {
  const [primaryCode, secondaryCode] = goalCode.split('__');

  if (!secondaryCode) {
    return fallbackName;
  }

  return `${humanizeCodeSegment(primaryCode)} / ${humanizeCodeSegment(secondaryCode)}`;
}

function hashString(value) {
  let hash = 0;

  for (const char of value) {
    hash = ((hash << 5) - hash) + char.charCodeAt(0);
    hash |= 0;
  }

  return Math.abs(hash);
}

function sortContexts(contexts) {
  return contexts.slice().sort((left, right) => {
    const divisionCompare = left.division.name.localeCompare(right.division.name);
    if (divisionCompare !== 0) return divisionCompare;

    const roleCompare = left.role.name.localeCompare(right.role.name);
    if (roleCompare !== 0) return roleCompare;

    return left.level.normalizedRank - right.level.normalizedRank;
  });
}

function createSyntheticExpectation(goalLabel, criterionName, rating, profile, levelNameValue) {
  const ratingSignal = ratingSignals[rating] ?? ratingSignals[3];
  const impactSignal = impactSignals[rating] ?? impactSignals[3];

  return {
    info: toBilingual(
      `Dalam konteks ${profile.focus.id}, kontribusi pada level ${levelNameValue} untuk goal ${goalLabel} ${ratingSignal.id}.`,
      `In the context of ${profile.focus.en}, contribution at the ${levelNameValue} level for the goal ${goalLabel} ${ratingSignal.en}.`,
    ),
    examples: [
      {
        text: toBilingual(
          `Cara menerjemahkan kebutuhan ${profile.stakeholder.id} ke keputusan kerja untuk kriteria "${criterionName.id}" ${ratingSignal.id}.`,
          `How stakeholder needs from ${profile.stakeholder.en} are translated into work decisions for the criterion "${criterionName.en}" ${ratingSignal.en}.`,
        ),
      },
      {
        text: toBilingual(
          `Dampaknya ke ${profile.output.id} ${impactSignal.id}.`,
          `Its impact on ${profile.output.en} ${impactSignal.en}.`,
        ),
      },
    ],
  };
}

function createSyntheticContexts(goalCode, criterion) {
  const divisions = new Set(criterion.contexts.map((context) => context.division.code));

  if (criterion.contexts.length === 0 || divisions.size > 1 || !divisions.has('it')) {
    return criterion.contexts;
  }

  const profile = divisionProfiles[hashString(`${goalCode}:${criterion.rating}`) % divisionProfiles.length];
  const representativeContextsByRank = new Map();

  for (const context of sortContexts(criterion.contexts)) {
    if (!representativeContextsByRank.has(context.level.normalizedRank)) {
      representativeContextsByRank.set(context.level.normalizedRank, context);
    }
  }

  const syntheticContexts = Array.from(representativeContextsByRank.values()).map((context) => {
    const profileLevel = profile.levels[context.level.normalizedRank] ?? {
      code: `level_${context.level.normalizedRank}`,
      name: `Level ${context.level.normalizedRank}`,
    };
    const expectation = createSyntheticExpectation(
      getGoalDisplayLabel(goalCode, goalCode),
      criterion.name,
      criterion.rating,
      profile,
      profileLevel.name,
    );

    return {
      uuid: `ctx_${slugify(goalCode)}_r${criterion.rating}_${slugify(profile.role.code)}_${slugify(profileLevel.code)}`,
      division: profile.division,
      role: {
        uuid: `role_${profile.division.code}_${slugify(profile.role.code)}`,
        code: profile.role.code,
        name: profile.role.name,
      },
      level: {
        uuid: `lvl_${profile.division.code}_${slugify(profile.role.code)}_${slugify(profileLevel.code)}`,
        code: profileLevel.code,
        name: profileLevel.name,
        normalizedRank: context.level.normalizedRank,
      },
      expectation: {
        info: expectation.info,
        examples: expectation.examples.map((example, index) => ({
          uuid: `exp_${slugify(goalCode)}_r${criterion.rating}_${slugify(profile.role.code)}_${slugify(profileLevel.code)}_${String(index + 1).padStart(2, '0')}`,
          text: example.text,
          sortOrder: (index + 1) * 10,
        })),
      },
    };
  });

  return sortContexts([...criterion.contexts, ...syntheticContexts]);
}

function buildGoalIdentity(item) {
  if (!item.poinGroup) {
    return {
      uuid: `goal_${slugify(item.goal.code)}`,
      code: item.goal.code,
      name: toBilingual(item.goal.label),
    };
  }

  return {
    uuid: `goal_${slugify(item.goal.code)}__${slugify(item.poinGroup.code)}`,
    code: `${item.goal.code}__${item.poinGroup.code}`,
    name: toBilingual(getGoalDisplayLabel(`${item.goal.code}__${item.poinGroup.code}`, `${item.goal.label} / ${item.poinGroup.label}`)),
  };
}

const isV3 =
  Array.isArray(sourceItems)
  && sourceItems.length > 0
  && sourceItems[0]
  && typeof sourceItems[0] === 'object'
  && 'uuid' in sourceItems[0]
  && Array.isArray(sourceItems[0].criteria);

function normalizeExistingV3Items(items) {
  return items
    .map((item) => ({
      ...item,
      goal: {
        ...item.goal,
        name: toBilingual(getGoalDisplayLabel(item.goal.code, item.goal.name?.id || item.goal.name?.en || item.goal.code)),
      },
      criteria: item.criteria
        .map((criterion) => ({
          ...criterion,
          contexts: createSyntheticContexts(item.goal.code, criterion),
        }))
        .slice()
        .sort((left, right) => left.rating - right.rating),
    }))
    .sort((left, right) => {
      const categoryCompare = left.category.name.en.localeCompare(right.category.name.en);
      if (categoryCompare !== 0) return categoryCompare;
      return left.goal.name.en.localeCompare(right.goal.name.en);
    });
}

function convertLegacyItems(items) {
  const groupedItems = new Map();

  for (const item of items) {
    const goal = buildGoalIdentity(item);
    const key = `${item.category.code}::${goal.code}`;
    const criterion = {
      uuid: `crt_${slugify(goal.code)}_r${item.rating}`,
      rating: item.rating,
      name: item.criteria,
      contexts: Object.entries(item.examples).flatMap(([roleCode, levels]) =>
        Object.entries(levels).map(([levelCode, detail]) => ({
          uuid: `ctx_${slugify(goal.code)}_r${item.rating}_${slugify(roleCode)}_${slugify(levelCode)}`,
          division: {
            uuid: 'div_it',
            code: 'it',
            name: 'IT',
          },
          role: {
            uuid: `role_it_${slugify(roleCode)}`,
            code: roleCode,
            name: roleName(roleCode),
          },
          level: {
            uuid: `lvl_it_${slugify(roleCode)}_${slugify(levelCode)}`,
            code: levelCode,
            name: levelName(levelCode),
            normalizedRank: levelRank(levelCode),
          },
          expectation: {
            info: toBilingual(detail.info),
            examples: detail.example.map((example, index) => ({
              uuid: `exp_${slugify(goal.code)}_r${item.rating}_${slugify(roleCode)}_${slugify(levelCode)}_${String(index + 1).padStart(2, '0')}`,
              text: toBilingual(example),
              sortOrder: (index + 1) * 10,
            })),
          },
        })),
      ),
    };
    const enrichedCriterion = {
      ...criterion,
      contexts: createSyntheticContexts(goal.code, criterion),
    };

    if (groupedItems.has(key)) {
      groupedItems.get(key).criteria.push(enrichedCriterion);
      continue;
    }

    groupedItems.set(key, {
      uuid: goal.uuid,
      category: {
        uuid: `cat_${slugify(item.category.code)}`,
        code: item.category.code,
        name: toBilingual(item.category.label),
      },
      goal,
      criteria: [enrichedCriterion],
    });
  }

  return Array.from(groupedItems.values())
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

const items = isV3 ? normalizeExistingV3Items(sourceItems) : convertLegacyItems(sourceItems);

const next = {
  statusCode: 200,
  message: 'Appraisal dictionary v3 loaded successfully.',
  meta: {
    schema: 'performance-appraisal.v3',
    version: 3,
    sourceFile: source?.meta?.sourceFile || 'Performance Apprisal - Company - Sheet8 (2).api.json',
    generatedAt: '2026-03-27T00:00:00Z',
    totalItems: items.length,
    notes: [
      'v3 uses criterion contexts so division, role, and level are no longer hardcoded globally',
      'legacy flat items were migrated into grouped goal entries with per-rating criteria',
      'legacy poinGroup distinctions were preserved by encoding them into goal identity when needed',
      'composite goal labels are normalized into a human-readable primary goal and sub-focus format',
      'mock payload now includes synthesized non-IT contexts so dictionary screens can exercise multi-division states',
      'examples remain bilingual-compatible, but legacy example copy is currently mirrored from the original source text',
    ],
  },
  data: {
    items,
  },
};

fs.writeFileSync(dictionaryPath, `${JSON.stringify(next, null, 2)}\n`);

console.log(`Dictionary mock API normalized to v3 with ${items.length} grouped items.`);