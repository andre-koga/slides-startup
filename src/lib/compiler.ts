// match any lines in the form '---{SLIDEINFO}'
const SLIDE_REGEX = /^---.*$/m

/**
 * @param {string} markup: string containing the raw markup
 * @returns {string[]}: list of the text in each slide
 */
export const processMarkup = (markup : string) => {
    return markup.split(SLIDE_REGEX);
}