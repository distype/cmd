/**
 * Cleanses a string from markdown formatting, adding back slashes to do so.
 * @param str The string to cleanse.
 * @returns The cleansed string.
 */
export function cleanseMarkdown (str: string): string {
    return str
        .replace(/`/g, `\\\``)
        .replace(/~/g, `\\~`)
        .replace(/\*/g, `\\*`)
        .replace(/_/g, `\\_`)
        .replace(/\|/g, `\\|`);
}
