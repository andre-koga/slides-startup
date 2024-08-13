import { type Slideshow, type Slide, type SlideElement } from "./types";
import { ELEMENT_PARSERS } from "./elementParsers";
import { ESC_CHAR } from "./constants"; 

// match any lines in the form '---{SLIDEINFO}'
const SLIDE_REGEX = /^---([a-zA-Z0-9_.]*)\s(.*)$/

// match lines in form 'key = value', where key and value are alphanumeric
const METADATA_REGEX = /^([a-zA-Z0-9_.]+)\s*=\s*([a-zA-Z0-9_.]+)$/

// match all newlines (after standardization)
const LINE_SEP_REGEX = /\n/

/**
 * @param {string} markup: string containing the raw markup
 * @returns {Slideshow}: the compiled slideshow
 */
export const processMarkup = (markup : string) => {
    markup = preprocessMarkup(markup);

    const lines = markup.split(LINE_SEP_REGEX)

    // below code splits up the markdown into metadata lines and slide lines
    const metadataLines : string[] = [];
    const slideLines : string[][] = [];
    const slideTemplates : string[] = [];
    const slideNames : string[] = [];
    let inMetadata = true;
    lines.forEach((line) => {
        const isNewSlide = SLIDE_REGEX.exec(line);
        if (isNewSlide) {
            inMetadata = false;
            slideTemplates.push(isNewSlide[2]);
            slideNames.push(isNewSlide[2]);
            slideLines.push([]);
        } else if (inMetadata) {
            metadataLines.push(line);
        } else {
            slideLines[slideLines.length - 1].push(line);
        }
    })

    // step 1: parse metadata
    const metadata = parseMetadata(metadataLines);

    const slides = slideLines.map((slideLines, i) => {
        // step 2: parse slides
        let slide = parseSlide(slideLines, slideNames[i], slideTemplates[i]);

        // step 3: deal with multi-line elements like lists and code blocks
        // TODO

        // step 4: deal with intra-line elements like bold and italics
        slide = addSpans(slide);

        return slide;
    });


    return {
        metadata: metadata,
        slides: slides
    } as Slideshow;
}

/**
 * @param {string} markup: string containing the raw markup
 * @returns {string}: the preprocessed markup
 */
const preprocessMarkup = (markup : string) => {
    // standardize line endings
    markup = markup.replaceAll(/\r\n/g, '\n');
    markup = markup.replaceAll(/\r/g, '\n');

    // replace special characters
    markup = markup.replaceAll(/&/g, '&amp;');
    markup = markup.replaceAll(/</g, '&lt;');
    markup = markup.replaceAll(/>/g, '&gt;');

    // escape special characters
    markup = markup.replaceAll(ESC_CHAR, `${ESC_CHAR}${ESC_CHAR}`);

    return markup;
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
 * @param {string} slideTemplate: name of the slide template
 * @returns {Slide}: map of metadata key-value pairs
 */
const parseSlide = (slideLines : string[], slideName : string, slideTemplate : string) => {
    const elements : SlideElement[] = [];
    slideLines.forEach((line) => {
        ELEMENT_PARSERS.some((parser) => {
            const elem = parser.parse(line);
            if (elem) {
                elements.push(elem);
                return true;
            }
        })
    })
    return {
        title: slideName,
        contents: elements,
        template: slideTemplate
    } as Slide;
}

const addSpans = (slide : Slide) => {
    return {
        title: slide.title,
        contents: slide.contents.map((element) => {
            return addSpansToElement(element);
        })
    } as Slide;
}

const addSpansToElement = (element : SlideElement) => {
    const BACKSLASH_CHARS = ['_', '$', '*', '**', '`', '\\'];

    const SPANS = [
        {
            identifier: '$',
            escStart: 'a',
            escEnd: 'b',
            blocking: true
        },
        {
            identifier: '_',
            escStart: 'c',
            escEnd: 'd',
        },
        {
            identifier: '**',
            escStart: 'e',
            escEnd: 'f',
        },
        {
            identifier: '*',
            escStart: 'g',
            escEnd: 'h',
        },
        {
            identifier: '`',
            escStart: 'i',
            escEnd: 'j',
        }
    ]

    const BLOCKING_INDICES : [number, number][] = [];

    // one pass for each type of span
    for (const span of SPANS) {
        let lastSeen = null;
        for (let i = 0; i <= element.value.length - span.identifier.length; i++) {
            console.log(blocked(i, BLOCKING_INDICES))
            if (blocked(i, BLOCKING_INDICES)) {
                continue;
            }
            const val = element.value.slice(i, i + span.identifier.length);
            if (element.value[i] === '\\') {
                i++;
            }
            else if (val === span.identifier) {
                if (lastSeen === null) {
                    lastSeen = i;
                } else if (i === lastSeen + 1) { // empty span (maybe switch to lastSeen + identifier.length?)
                    lastSeen = i;
                }
                else {
                    if (span.blocking) {
                        BLOCKING_INDICES.push([lastSeen, i + span.identifier.length])
                    }
                    // replace start and end of span with escape characters
                    const start = element.value.slice(0, lastSeen);
                    const middle = element.value.slice(lastSeen + span.identifier.length, i);
                    const end = element.value.slice(i + span.identifier.length);
                    element.value = `${start}${ESC_CHAR}${span.escStart}${middle}${ESC_CHAR}${span.escEnd}${end}`;
                    lastSeen = null;
                }
                i += span.identifier.length - 1;
            }
        }
    }

    // finally, remove backslashes when they escape a special character
    let out = '';
    for (let i = 0; i < element.value.length; i++) {
        if (element.value[i] === '\\' && i + 1 < element.value.length && BACKSLASH_CHARS.includes(element.value[i + 1])) {
            i++;
        }
        out += element.value[i];
    }
    element.value = out;
    if (element.children) {
        element.children = element.children.map((child) => {
            return addSpansToElement(child);
        })
    }

    return element;
}

const blocked = (index : number, blockedIndices : [number, number][]) => {
    for (const pair of blockedIndices) {
        if (pair[0] <= index && index < pair[1]) {
            return true;
        }
    }
    return false;
}