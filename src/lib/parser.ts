import { type Slideshow, type Slide, type SlideElement, FlagType, ElementType } from "./types";
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
    const { metadataLines, slideLines, slideInfo } = splitMarkup(lines);

    // step 1: parse metadata
    const metadata = parseMetadata(metadataLines);

    const slides = slideLines.map((slideLines, i) => {
        // step 2: parse slides
        let slide = parseSlide(slideLines, slideInfo[i]);

        // step 3: deal with multi-line elements like lists and code blocks
        slide = addMultilineElements(slide, lines);

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

function splitMarkup(lines: string[]) {
    const metadataLines: string[] = [];
    const slideLines: string[][] = [];
    const slideInfo : [string, string, number][] = []; // name, template, line idx
    let inMetadata = true;
    lines.forEach((line, i) => {
        const isNewSlide = SLIDE_REGEX.exec(line);
        if (isNewSlide) {
            inMetadata = false;
            slideInfo.push([isNewSlide[1], isNewSlide[2], i]);
            slideLines.push([]);
        } else if (inMetadata) {
            metadataLines.push(line);
        } else {
            slideLines[slideLines.length - 1].push(line);
        }
    });
    return { metadataLines, slideLines, slideInfo };
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
 * @param {[string, string, number]} slideInfo: [name, template, line idx] of the slide
 * @returns {Slide}: map of metadata key-value pairs
 */
const parseSlide = (slideLines : string[], slideInfo : [string, string, number]) => {
    const elements : SlideElement[] = [];
    slideLines.forEach((line, i) => {
        ELEMENT_PARSERS.some((parser) => {
            const elem = parser.parse(line, i + slideInfo[2] + 1);
            if (elem) {
                elements.push(elem);
                return true;
            }
        })
    })
    return {
        title: slideInfo[0],
        contents: elements,
        template: slideInfo[1],
        idx: slideInfo[2]
    } as Slide;
}

const addMultilineElements = (slide : Slide, lines : string[]) => {
    slide = addMultilineElement(slide, lines, FlagType.MULTILINE_CODE_START, FlagType.MULTILINE_CODE_END, ElementType.MULTILINE_CODE, '```', '```');
    slide = addMultilineElement(slide, lines, FlagType.MULTILINE_MATH_START, FlagType.MULTILINE_MATH_END, ElementType.MULTILINE_MATH, '$$', '$$');

    return slide;
}

const addMultilineElement = (slide : Slide, lines : string[], startFlag : FlagType, endFlag : FlagType, elemType : ElementType, startText : string, endText : string) => {
    let multilineStart : number | null = null;
    for (let i = 0; i < slide.contents.length; i++) {
        const element = slide.contents[i];
        if (!element.flags) {
            continue;
        }
        if (multilineStart === null && element.flags.includes(startFlag)) {
            multilineStart = i;
        }
        if (multilineStart !== null && element.flags.includes(endFlag)) {
            // catches the edge case of, for instance, a line with only '```'
            if (i === multilineStart && slide.contents[i].value.length < startText.length + endText.length) {
                continue;
            }
            // replace each element of the code blocks with the appropriate element
            for (let j = multilineStart; j <= i; j++) {
                // deal with cases like a header in the middle of a block
                // without this, the '##' would be missing
                slide.contents[j].value = lines[slide.contents[j].idx];
                let flags = [];
                if (j === multilineStart) {
                    // remove the starting ```
                    flags.push(startFlag)
                    slide.contents[j].value = slide.contents[j].value.slice(startText.length);
                }
                if (j === i) {
                    // remove the ending ```
                    flags.push(endFlag)
                    slide.contents[j].value = slide.contents[j].value.slice(0, -endText.length);
                }
                slide.contents[j].flags = flags;
                slide.contents[j].type = elemType;
                multilineStart = null;
            }
        }
    }

    return slide;
}

const addSpans = (slide : Slide) => {
    slide.contents = slide.contents.map((element) => {
        return addSpansToElement(element);
    });
    return slide;
}

const NON_SPAN_ELEMENTS = [ElementType.MULTILINE_CODE, ElementType.RESOURCE];

type Span = {
    identifier: string,
    escStart: string,
    escEnd: string,
    blocking?: boolean
}

const addSpansToElement = (element : SlideElement) => {
    if (NON_SPAN_ELEMENTS.includes(element.type)) {
        return element;
    }

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
        },
        {
            identifier: '~',
            escStart: 'k',
            escEnd: 'l',
        }
    ]

    const BLOCKING_INDICES : [number, number][] = [];

    // one pass for each type of span
    for (const span of SPANS) {
        addSpanToElement(element, span, BLOCKING_INDICES);
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

function addSpanToElement(element: SlideElement, span : Span, BLOCKING_INDICES: [number, number][]) {
    let lastSeen = null;
    for (let i = 0; i <= element.value.length - span.identifier.length; i++) {
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
                    BLOCKING_INDICES.push([lastSeen, i + span.identifier.length]);
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

const blocked = (index : number, blockedIndices : [number, number][]) => {
    for (const pair of blockedIndices) {
        if (pair[0] <= index && index < pair[1]) {
            return true;
        }
    }
    return false;
}