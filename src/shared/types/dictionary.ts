export interface BilingualText {
  en: string;
  id: string;
}

export interface CategoryInfo {
  code: string;
  label: string;
}

export interface PoinGroupInfo {
  code: string;
  label: string;
}

export interface GoalInfo {
  code: string;
  label: string;
}

export interface DictionaryNamedInfo {
  uuid: string;
  code: string;
  name: string;
}

export interface DictionaryNamedBilingualInfo {
  uuid: string;
  code: string;
  name: BilingualText;
}

export interface ApiEnvelope<TData, TMeta = Record<string, unknown>> {
  statusCode: number;
  message: string;
  meta: TMeta;
  data: TData;
}

export type RoleLevel = 'junior' | 'middle' | 'senior' | 'lead';
export type Role = 'qa' | 'frontend' | 'backend';

export interface ExampleDetail {
  info: string;
  example: string[];
}

export type RoleExamples = Record<RoleLevel, ExampleDetail>;
export type Examples = Record<Role, RoleExamples>;

export interface LegacyAppraisalItem {
  id: string;
  category: CategoryInfo;
  poinGroup: PoinGroupInfo | null;
  goal: GoalInfo;
  criteria: BilingualText;
  rating: number;
  examples: Examples;
}

export interface AppraisalLevelInfo extends DictionaryNamedInfo {
  normalizedRank: number;
}

export interface AppraisalExpectationExample {
  uuid: string;
  text: BilingualText;
  sortOrder: number;
}

export interface AppraisalCriterionContext {
  uuid: string;
  division: DictionaryNamedInfo;
  role: DictionaryNamedInfo;
  level: AppraisalLevelInfo;
  expectation: {
    info: BilingualText;
    examples: AppraisalExpectationExample[];
  };
}

export interface AppraisalCriterion {
  uuid: string;
  rating: number;
  name: BilingualText;
  contexts: AppraisalCriterionContext[];
}

export interface AppraisalDictionaryItem {
  uuid: string;
  category: DictionaryNamedBilingualInfo;
  goal: DictionaryNamedBilingualInfo;
  criteria: AppraisalCriterion[];
}

export interface AppraisalDictionaryMeta {
  schema: string;
  version: number;
  sourceFile: string;
  generatedAt?: string;
  totalItems?: number;
  notes: string[];
}

export interface AppraisalDictionaryPayload {
  items: AppraisalDictionaryItem[];
}

export type AppraisalDictionaryResponse = ApiEnvelope<AppraisalDictionaryPayload, AppraisalDictionaryMeta>;

export type LegacyAppraisalDictionaryResponse = ApiEnvelope<{ items: LegacyAppraisalItem[] }, AppraisalDictionaryMeta>;

export interface LegacyAppraisalDictionaryPayload {
  meta: AppraisalDictionaryResponse['meta'];
  items: LegacyAppraisalItem[];
}

export type Lang = 'id' | 'en';

export interface FilterState {
  search: string;
  category: string;
  goal: string;
  poinGroup: string;
  rating: number | null;
  lang: Lang;
}
