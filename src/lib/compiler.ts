import { type Slideshow, type Slide, type Element, ElementType } from "./types";

// match any lines in the form '---{SLIDEINFO}'
const SLIDE_REGEX = /^---(.*)$/

// match lines in form 'key = value', where key and value are alphanumeric
const METADATA_REGEX = /^([a-zA-Z0-9_.]+)\s*=\s*([a-zA-Z0-9_.]+)$/

// match lines in form '# {HEADER}'
const HEADER_REGEX = /^#\s*(.+)$/

// match all newlines (https://stackoverflow.com/questions/20056306/)
const LINE_SEP_REGEX = /\n/

/**
 * @param {string} markup: string containing the raw markup
 * @returns {Slideshow}: the compiled slideshow
 */
export const processMarkup = (markup : string) => {
    const lines = markup.split(LINE_SEP_REGEX)

    const metadataLines : string[] = [];
    const slideLines : string[][] = [];
    const slideNames : string[] = [];
    let inMetadata = true;
    lines.forEach((line) => {
        const isNewSlide = SLIDE_REGEX.exec(line);
        if (isNewSlide) {
            inMetadata = false;
            slideNames.push(isNewSlide[1]);
            slideLines.push([]);
        }
        if (inMetadata) {
            metadataLines.push(line);
        } else if (!isNewSlide) {
            slideLines[slideLines.length - 1].push(line);
        }
    })

    // step 1: parse metadata
    const metadata = parseMetadata(metadataLines);

    // step 2: parse slides
    const slides = slideLines.map((slide, i) => {
        return parseSlide(slide, slideNames[i]);
    });

    return {
        metadata,
        slides
    } as Slideshow;
}

/**
 * @param {string[]} metadataLines: array of metadata lines
 * @returns {Map<string, string>}: map of metadata key-value pairs
 */
const parseMetadata = (metadataLines : string[]) => {
    const metadata = new Map<string, string>();
    metadataLines.forEach((line) => {
        const res = METADATA_REGEX.exec(line);
        if (res) {
            metadata.set(res[1], res[2]);
        }
    })
    return metadata;
}

/**
 * @param {string[]} slideLines: array of lines in a slide
 * @param {string} slideName: name of the slide
 * @returns {Slide}: map of metadata key-value pairs
 */
const parseSlide = (slideLines : string[], slideName : string) => {
    const elements : Element[] = [];
    slideLines.forEach((line) => {
        const header = HEADER_REGEX.exec(line);
        if (header) {
            elements.push({
                type: ElementType.HEADER,
                value: header[1]
            });
        } else {
            elements.push({
                type: ElementType.TEXT,
                value: line
            });
        }
    })
    return {
        title: slideName,
        contents: elements
    } as Slide;
}