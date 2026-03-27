import type { AssignmentType } from '@/shared/types';

export type AssignmentPersona = 'employee' | 'manager';
export type AssignmentFilter = 'all' | AssignmentType;

export function patchSearchParams(
  searchParams: URLSearchParams,
  patch: Record<string, string | null | undefined>,
) {
  const nextParams = new URLSearchParams(searchParams);

  Object.entries(patch).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      nextParams.delete(key);
      return;
    }

    nextParams.set(key, value);
  });

  return nextParams;
}

export function toSearchString(searchParams: URLSearchParams) {
  const serialized = searchParams.toString();
  return serialized ? `?${serialized}` : '';
}

export function buildPathWithSearch(
  pathname: string,
  searchParams: URLSearchParams,
  patch?: Record<string, string | null | undefined>,
) {
  const nextParams = patch ? patchSearchParams(searchParams, patch) : new URLSearchParams(searchParams);
  return `${pathname}${toSearchString(nextParams)}`;
}

export function getCycleParam(searchParams: URLSearchParams) {
  return searchParams.get('cycle');
}

export function getAssignmentUrlState(searchParams: URLSearchParams) {
  const persona = searchParams.get('persona') === 'manager' ? 'manager' : 'employee';
  const type = searchParams.get('type');
  const assignmentFilter =
    type === 'self_review' || type === 'manager_review' ? type : 'all';

  return {
    persona: persona as AssignmentPersona,
    assignmentFilter: assignmentFilter as AssignmentFilter,
    search: searchParams.get('search') ?? '',
  };
}

export function getPersonaForAssignmentType(assignmentType: AssignmentType): AssignmentPersona {
  return assignmentType === 'manager_review' ? 'manager' : 'employee';
}