import type { Slideshow, Slide, SlideElement, Pair, Decorator } from "./types";
import { DecoratorType, SpanType } from "./types";
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
    const slideIndices : number[] = [];
    let inMetadata = true;
    lines.forEach((line, i) => {
        const isNewSlide = SLIDE_REGEX.exec(line);
        if (isNewSlide) {
            inMetadata = false;
            slideTemplates.push(isNewSlide[2]);
            slideNames.push(isNewSlide[2]);
            slideLines.push([]);
            slideIndices.push(i);
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
        let slide = parseSlide(slideLines, slideNames[i], slideTemplates[i], slideIndices[i]);

        // step 3: deal with intra-line elements like bold and italics
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
 * @param {number} slideIndex: index of the starting line of the slide
 * @returns {Slide}: map of metadata key-value pairs
 */
const parseSlide = (slideLines : string[], slideName : string, slideTemplate : string, slideIndex : number) => {
    const elements : SlideElement[] = [];
    slideLines.forEach((line, i) => {
        ELEMENT_PARSERS.some((parser) => {
            const elem = parser.parse(line, slideIndex + i + 1);
            if (elem) {
                elements.push(elem);
                return true;
            }
        })
    })
    return {
        title: slideName,
        contents: elements,
        template: slideTemplate,
        index: slideIndex
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
    const DECORATORS = [
        {
            identifier: '$',
            type: DecoratorType.MATH,
            blocking: true
        },
        {
            identifier: '_',
            type: DecoratorType.ITALICS,
        },
        {
            identifier: '**',
            type: DecoratorType.BOLD,
        },
        {
            identifier: '*',
            type: DecoratorType.ITALICS,
        },
        {
            identifier: '`',
            type: DecoratorType.CODE,
        }
    ]
    
    const BLOCKING_REGIONS : Pair[] = []

    // one pass for each type of span
    for (const dec of DECORATORS) {
        let currDecorator : Decorator | null = null;
        for (const span of element.spans) {
            if (span.type !== SpanType.CONTENT) {
                continue;
            }
            for (let i = span.start; i < span.end - dec.identifier.length; i++) {
                if (element.source[i] === "\\") {
                    console.log("SKIP")
                    i += 1;    
                }
                if (isBlocked(i, BLOCKING_REGIONS)) {
                    continue;
                }
                const curr = element.source.slice(i, i + dec.identifier.length);
                if (curr !== dec.identifier) {
                    continue;
                }

                // at this point, we are at an unblocked region and have found a potential decorator
                if (currDecorator === null) { // new opening
                    currDecorator = {
                        type: dec.type,
                        start: i,
                        end: -1
                    } as Decorator
                } else { // we've found a decorator pair
                    currDecorator.end = i + dec.identifier.length;
                    if (dec.blocking) {
                        BLOCKING_REGIONS.push(
                            {
                                start: currDecorator.start,
                                end: currDecorator.end
                            } as Pair
                        )
                    } else {
                        BLOCKING_REGIONS.push( { start: currDecorator.start, end: currDecorator.start + dec.identifier.length } as Pair )
                        BLOCKING_REGIONS.push( { start: currDecorator.end, end: currDecorator.end + dec.identifier.length } as Pair )
                    }
                    element.decorators.push(currDecorator);
                    currDecorator = null;
                }
                i += dec.identifier.length;
            }
        }
    }

    return element;
}

const isBlocked = (index : number, blockingRegions : Pair[]) => {
    for (const region of blockingRegions) {
        if (index >= region.start && index < region.end) {
            return true;
        }
    }
    return false;
}