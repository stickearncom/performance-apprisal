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

export type RoleLevel = 'junior' | 'middle' | 'senior' | 'lead';
export type Role = 'qa' | 'frontend' | 'backend';

export interface ExampleDetail {
  info: string;
  example: string[];
}

export type RoleExamples = Record<RoleLevel, ExampleDetail>;
export type Examples = Record<Role, RoleExamples>;

export interface AppraisalItem {
  id: string;
  category: CategoryInfo;
  poinGroup: PoinGroupInfo | null;
  goal: GoalInfo;
  criteria: BilingualText;
  rating: number;
  examples: Examples;
}

export type Lang = 'id' | 'en';

export interface FilterState {
  search: string;
  category: string;
  poinGroup: string;
  rating: number | null;
  lang: Lang;
}
