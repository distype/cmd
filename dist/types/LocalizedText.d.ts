import { LocalizationMap } from 'discord-api-types/v10';
/**
 * Localized text.
 */
export interface LocalizedText<D extends string, L extends LocalizationMap> {
    /**
     * The default text.
     */
    default: D;
    /**
     * Localized variations of the text.
     */
    localization: L;
}
