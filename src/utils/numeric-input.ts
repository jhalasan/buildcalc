const MAX_LENGTH = 12;

/**
 * Cleans a numeric text entry so every calculator receives a parseable number.
 * - Whole-number fields keep digits only.
 * - A decimal comma (common on some keyboards and locales) becomes a point.
 * - Pasted thousands separators ("1,500" or "1,234,567.5") are removed.
 * - Anything that is not a digit or the first decimal point is dropped.
 */
export function sanitizeNumeric(text: string, wholeOnly = false): string {
  const trimmed = text.replace(/\s/g, '');
  if (wholeOnly) return trimmed.replace(/[^0-9]/g, '').slice(0, MAX_LENGTH);

  let value = trimmed;
  if (/^\d{1,3}(,\d{3})+(\.\d*)?$/.test(value)) {
    value = value.replace(/,/g, '');
  } else if (value.includes(',') && value.includes('.')) {
    value = value.replace(/,/g, '');
  } else {
    value = value.replace(',', '.');
  }

  value = value.replace(/[^0-9.]/g, '');
  const firstPoint = value.indexOf('.');
  if (firstPoint !== -1) {
    value = value.slice(0, firstPoint + 1) + value.slice(firstPoint + 1).replace(/\./g, '');
  }
  return value.slice(0, MAX_LENGTH);
}
