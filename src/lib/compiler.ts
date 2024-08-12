import { type Slideshow, type Slide, type SlideElement, ElementType } from "./types";
import { ELEMENT_PARSERS } from "./elementParsers";

// match any lines in the form '---{SLIDEINFO}'
const SLIDE_REGEX = /^---(.*)$/

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
        } else if (inMetadata) {
            metadataLines.push(line);
        } else {
            slideLines[slideLines.length - 1].push(line);
        }
    })

    // step 1: parse metadata
    const metadata = parseMetadata(metadataLines);

    // step 2: parse slides
    const slides = slideLines.map((slide, i) => {
        return parseSlide(slide, slideNames[i]);
    });

    // step 3: deal with multi-line elements like lists and code blocks
    const slidesWithMultline : Slide[] = [];
    for (let i = 0; i < slides.length; i++) {
        slidesWithMultline.push(postProcesSlide(slides[i], slideLines[i]));
    }

    return {
        metadata: metadata,
        slides: slidesWithMultline
    } as Slideshow;
}

/**
 * @param {string} markup: string containing the raw markup
 * @returns {string}: the preprocessed markup
 */
const preprocessMarkup = (markup : string) => {
    // standardize line endings
    markup = markup.replace(/\r\n/g, '\n');
    markup = markup.replace(/\r/g, '\n');

    // replace special characters
    markup = markup.replace(/&/g, '&amp;');
    markup = markup.replace(/</g, '&lt;');
    markup = markup.replace(/>/g, '&gt;');

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
 * @returns {Slide}: map of metadata key-value pairs
 */
const parseSlide = (slideLines : string[], slideName : string) => {
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
        contents: elements
    } as Slide;
}

/**
 * @param {Slide} slide: the slide to post-process
 * @param {string[]} slideLines: the lines in the slide (in case original formatting is needed)
 * @returns {Slide}: the post-processed slide
 */
const postProcesSlide = (slide : Slide, slideLines : string[]) => {
    const out : SlideElement[] = [];

    // handle lists
    let currList : SlideElement | null = null;
    let currListType : string | null = null;
    slide.contents.forEach((element) => {
        const type = element.data;

        // if we've reached the end of this list, push it to the output
        if (currList && type !== currListType) {
            out.push(currList);
            currList = null;
        }

        if (element.type === ElementType.LIST_ELEMENT && typeof type === 'string') {
            if (currList && currList.children && type === currListType) {
                // if we're already in a list, add this element to it
                currList.children.push(element);
            } else {
                // otherwise, start a new list
                currList = {
                    type: ElementType.LIST,
                    value: '',
                    children: [element],
                    data: type
                } as SlideElement
                currListType = type;
            }
        } else {
            // by default keep the element as is
            out.push(element);
        }
    })

    if (currList) {
        out.push(currList);
    }

    return {
        title: slide.title,
        contents: out
    } as Slide;
}