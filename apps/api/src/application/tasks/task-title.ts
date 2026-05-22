const MULTIPLE_WHITESPACES = /\s+/g;

export function sanitizeTaskTitle(title: string): string {
  return title.trim().replace(MULTIPLE_WHITESPACES, " ");
}

export function normalizeTaskTitle(title: string): string {
  return sanitizeTaskTitle(title).toLowerCase();
}

export function normalizeSearchTerm(search: string): string {
  return search.trim().replace(MULTIPLE_WHITESPACES, " ").toLowerCase();
}
