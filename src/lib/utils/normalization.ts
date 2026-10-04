/**
 * Normalization utilities for student verification and deduplication
 */

export function normalizeDdNo(dd: string): string {
  if (!dd) return '';
  // Trim spaces and normalize to uppercase alphanumeric
  return dd.trim().replace(/\s+/g, '').toUpperCase();
}

export function normalizeName(name: string): string {
  if (!name) return '';
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function normalizeCourse(course: string): string {
  if (!course) return '';
  const c = course.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  // Standardize common abbreviations
  if (c === 'btech' || c === 'btechcse') return 'btech';
  if (c === 'bscds' || c === 'bscdatascience') return 'bscds';
  return c;
}

export function normalizeYear(year: string): string {
  if (!year) return '';
  const y = year.trim().toLowerCase();
  if (y === 'i' || y === '1' || y.includes('1st')) return '1';
  if (y === 'ii' || y === '2' || y.includes('2nd')) return '2';
  if (y === 'iii' || y === '3' || y.includes('3rd')) return '3';
  if (y === 'iv' || y === '4' || y.includes('4th')) return '4';
  const match = year.match(/\d+/);
  return match ? match[0] : y;
}

export function normalizeSection(section: string): string {
  if (!section) return '';
  return section.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Checks if two names match with reasonable tolerance for middle names / case
 */
export function namesMatch(a: string, b: string): boolean {
  const normA = normalizeName(a);
  const normB = normalizeName(b);
  if (normA === normB) return true;

  // Check if tokens overlap strongly (e.g. "Rahul Kumar" vs "Rahul")
  const tokensA = normA.split(' ');
  const tokensB = normB.split(' ');
  if (tokensA[0] && tokensB[0] && tokensA[0] === tokensB[0]) {
    // First names match, check last name if present
    if (tokensA.length > 1 && tokensB.length > 1) {
      return tokensA[tokensA.length - 1] === tokensB[tokensB.length - 1];
    }
    return true;
  }
  return false;
}
