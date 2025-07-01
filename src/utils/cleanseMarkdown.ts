/**
 * Cleanses a string from markdown formatting, adding back slashes to do so.
 * @param str The string to cleanse.
 * @returns The cleansed string.
 */
export function cleanseMarkdown(str: string): string {
  return str
    .replaceAll(`\``, `\\\``)
    .replaceAll(`~`, `\\~`)
    .replaceAll(`*`, `\\*`)
    .replaceAll(`_`, `\\_`)
    .replaceAll(`|`, `\\|`);
}
