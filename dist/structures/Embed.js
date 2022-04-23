"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Embed = void 0;
const DistypeCmdError_1 = require("../errors/DistypeCmdError");
const distype_1 = require("distype");
/**
 * A message embed; specifically, a rich embed.
 * When setting properties of the embed, this class automatically checks their length against [Discord's maximum lengths](https://discord.com/developers/docs/resources/channel#embed-limits) for embed properties.
 *
 * @example
 * ```ts
 * new Embed()
 *     .setTitle(`A title`)
 *     .setDescription(`Some description`)
 *     .setColor(0x5865F2);
 * ```
 * @see [Discord API Reference](https://discord.com/developers/docs/resources/channel#embed-object)
 */
class Embed {
    /**
     * The raw embed.
     */
    _raw;
    /**
     * Create a message embed.
     * @param base An embed to use as a base.
     */
    constructor(base = {}) {
        this._raw = base;
    }
    /**
     * Set the embed's title.
     * @param title The title to use.
     */
    setTitle(title) {
        if (title.length > distype_1.DiscordConstants.MESSAGE_EMBED_LIMITS.TITLE)
            throw new DistypeCmdError_1.DistypeCmdError(`Specified title is longer than maximum length ${distype_1.DiscordConstants.MESSAGE_EMBED_LIMITS.TITLE}`, DistypeCmdError_1.DistypeCmdErrorType.INVALID_EMBED_VALUE);
        this._raw.title = title;
        return this;
    }
    /**
     * Set the embed's description.
     * @param description The description to use.
     */
    setDescription(description) {
        if (description.length > distype_1.DiscordConstants.MESSAGE_EMBED_LIMITS.DESCRIPTION)
            throw new DistypeCmdError_1.DistypeCmdError(`Specified description is longer than maximum length ${distype_1.DiscordConstants.MESSAGE_EMBED_LIMITS.DESCRIPTION}`, DistypeCmdError_1.DistypeCmdErrorType.INVALID_EMBED_VALUE);
        this._raw.description = description;
        return this;
    }
    /**
     * Set the embed's URL (makes the title clickable).
     * @param url The URL to use.
     */
    setURL(url) {
        this._raw.url = url;
        return this;
    }
    /**
     * Set the embed's timestamp.
     * @param time The time to use. Can be a unix millisecond timestamp as a number, and ISO8601 string, or a date.
     */
    setTimestamp(time = new Date()) {
        this._raw.timestamp = typeof time === `string` ? time : (time instanceof Date ? time : new Date(time)).toISOString();
        return this;
    }
    /**
     * Set the embed's color.
     * @param color The color to use.
     */
    setColor(color) {
        this._raw.color = color;
        return this;
    }
    /**
     * Set the embed's footer.
     * @param footer The footer to use. Can be either a string (adapted to `{ name: footer }`), or the footer object.
     */
    setFooter(footer) {
        const embedFooter = typeof footer === `string` ? { text: footer } : footer;
        if (embedFooter.text.length > distype_1.DiscordConstants.MESSAGE_EMBED_LIMITS.FOOTER_TEXT)
            throw new DistypeCmdError_1.DistypeCmdError(`Specified footer text is longer than maximum length ${distype_1.DiscordConstants.MESSAGE_EMBED_LIMITS.FOOTER_TEXT}`, DistypeCmdError_1.DistypeCmdErrorType.INVALID_EMBED_VALUE);
        this._raw.footer = embedFooter;
        return this;
    }
    /**
     * Set the embed's image.
     * @param image The image to use. Can be either a string (adapted to `{ url: image }`), or the image object.
     */
    setImage(image) {
        this._raw.image = typeof image === `string` ? { url: image } : image;
        return this;
    }
    /**
     * Set the embed's thumbnail.
     * @param thumbnail The thumbnail to use. Can be either a string (adapted to `{ url: thumbnail }`), or the thumbnail object.
     */
    setThumbnail(thumbnail) {
        this._raw.thumbnail = typeof thumbnail === `string` ? { url: thumbnail } : thumbnail;
        return this;
    }
    /**
     * Set the embed's author.
     * @param author The author to use. Can be either a string (adapted to `{ name: author }`), or the author object.
     */
    setAuthor(author) {
        const embedAuthor = typeof author === `string` ? { name: author } : author;
        if (embedAuthor.name.length > distype_1.DiscordConstants.MESSAGE_EMBED_LIMITS.AUTHOR_NAME)
            throw new DistypeCmdError_1.DistypeCmdError(`Specified author name is longer than maximum length ${distype_1.DiscordConstants.MESSAGE_EMBED_LIMITS.AUTHOR_NAME}`, DistypeCmdError_1.DistypeCmdErrorType.INVALID_EMBED_VALUE);
        this._raw.author = embedAuthor;
        return this;
    }
    /**
     * Set's the embed's fields.
     * Note that this method will overwrite any previously defined fields.
     * @param fields The fields to use.
     */
    setFields(...fields) {
        if (fields.length > distype_1.DiscordConstants.MESSAGE_EMBED_LIMITS.FIELDS)
            throw new DistypeCmdError_1.DistypeCmdError(`Specified fields surpass maximum ${distype_1.DiscordConstants.MESSAGE_EMBED_LIMITS.FIELDS} total fields`, DistypeCmdError_1.DistypeCmdErrorType.INVALID_EMBED_VALUE);
        fields.forEach((field, i) => {
            if (field.name.length > distype_1.DiscordConstants.MESSAGE_EMBED_LIMITS.FIELD.NAME)
                throw new DistypeCmdError_1.DistypeCmdError(`Specified field ${i} name is longer than maximum length ${distype_1.DiscordConstants.MESSAGE_EMBED_LIMITS.FIELD.NAME}`, DistypeCmdError_1.DistypeCmdErrorType.INVALID_EMBED_VALUE);
            if (field.value.length > distype_1.DiscordConstants.MESSAGE_EMBED_LIMITS.FIELD.VALUE)
                throw new DistypeCmdError_1.DistypeCmdError(`Specified field ${i} value is longer than maximum length ${distype_1.DiscordConstants.MESSAGE_EMBED_LIMITS.FIELD.VALUE}`, DistypeCmdError_1.DistypeCmdErrorType.INVALID_EMBED_VALUE);
        });
        this._raw.fields = fields;
        return this;
    }
    /**
     * Get the raw embed.
     * Note that the returned embed is immutable.
     */
    getRaw() {
        const surpassed = this.getSize() > distype_1.DiscordConstants.MESSAGE_EMBED_LIMITS.MAX_TOTAL_IN_MESSAGE;
        if (surpassed)
            throw new DistypeCmdError_1.DistypeCmdError(`Embed surpassed maximum total size of ${distype_1.DiscordConstants.MESSAGE_EMBED_LIMITS.MAX_TOTAL_IN_MESSAGE}`, DistypeCmdError_1.DistypeCmdErrorType.INVALID_EMBED_PARAMETERS_FOR_RAW);
        return { ...this._raw };
    }
    /**
     * The number of characters in the embed that have properties in [Discord's maximum embed lengths](https://discord.com/developers/docs/resources/channel#embed-limits) list.
     */
    getSize() {
        return [this._raw.title, this._raw.description, this._raw.footer?.text, this._raw.author?.name, ...[this._raw.fields?.reduce((p, c) => `${p}${c.name}${c.value}`, ``) ?? []]].map((v) => v?.length ?? 0).reduce((p, c) => p + c, 0);
    }
}
exports.Embed = Embed;
