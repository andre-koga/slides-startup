import type { Slide, SlideElement } from "./types";
import { ElementType, FlagType } from "./types";
import { ESC_CHAR } from "./constants";

import { math, display } from "mathlifier";

let accumulator = "";

export const generateHTML = (slide : Slide) => {
    accumulator = "";
    const html = `
        <div class="slide">
            ${slide.contents.map((element, i) => {
                return elementToHtml(element, i === 0 ? null : slide.contents[i - 1]);
            }).join('')}
        </div>
    `
    return processEscapeChars(html);
}


// TODO: comment this function
const elementToHtml = (element : SlideElement, previous : SlideElement | null) : string => {
    let out : string = "";
    
    // add closing list tags
    if (previous && previous.type === ElementType.LIST_ELEMENT) {
        if (element.type !== ElementType.LIST_ELEMENT || element.data !== previous.data) {
            out += `</${previous.data}>\n`
        }
    }

    if (element.type === ElementType.HEADER) {
        out = `<h${element.data}>${element.value}</h${element.data}>\n`
    }
    else if (element.type === ElementType.LIST_ELEMENT) {
        const listType : string = element.data as string
        if (!previous || previous.data !== listType) {
            out += `<${listType}>`
        }
        out += `<li>${element.value}</li>\n`
    }
    else if (element.type === ElementType.RESOURCE) {
        if (element.data && element.data.url && element.data.alt) {
            out = `<img src="${element.data.url}" alt=${element.data.alt} />\n`
        } else if (element.data && element.data.url) {
            out = `<img src="${element.data.url}" />\n`
        } else {
            out = ''
        }
    }
    else if (element.type === ElementType.COMMENT) {
        out = '';
    }
    else if (element.type === ElementType.EMPTY) {
        out = '<br />\n'
    }
    else if (element.type === ElementType.MULTILINE_CODE) {
        if (element.flags && element.flags.includes(FlagType.MULTILINE_CODE_START)) {
            out += '<pre><code>';
        }
        out += element.value + '\n';
        if (element.flags && element.flags.includes(FlagType.MULTILINE_CODE_END)) {
            out += '</code></pre>';
        }
    }
    else if (element.type === ElementType.MULTILINE_MATH) {
        accumulator += element.value + '\n';
        if (element.flags && element.flags.includes(FlagType.MULTILINE_MATH_END)) {
            out = display(accumulator, { output: 'mathml', overflowAuto: false });
            accumulator = "";
        }
    }
    else {
        out = `<p>${element.value}</p>\n`
    }

    previous = element;
    return out;
}

const MATH_START = 'a';
const MATH_END = 'b';
const ESCAPE_CHAR_MAP = new Map<string, string>();
ESCAPE_CHAR_MAP.set('c', '<u>');
ESCAPE_CHAR_MAP.set('d', '</u>');
ESCAPE_CHAR_MAP.set('e', '<strong>');
ESCAPE_CHAR_MAP.set('f', '</strong>');
ESCAPE_CHAR_MAP.set('g', '<em>');
ESCAPE_CHAR_MAP.set('h', '</em>');
ESCAPE_CHAR_MAP.set('i', '<code>');
ESCAPE_CHAR_MAP.set('j', '</code>');

/**
 * Checks for the special escape character and replaces it with the appropriate HTML
 * @param html raw HTML string
 * @returns html string with escape characters replaced
 */
const processEscapeChars = (html : string) => {
    let out = '';

    // math is a special case, we need the entire math string
    let mathStartIdx = null;
    for (let i = 0; i < html.length; i++) {
        const char = html[i];
        if (char === ESC_CHAR) {
            i++; // look at the next character (which escape sequence is it?)
            if (html[i] === MATH_START) { // math is special case
                mathStartIdx = out.length;
            } else if (html[i] === MATH_END && mathStartIdx !== null) {
                // once we've found a full math string, use mathlified to convert it to mathml
                const mathString = out.slice(mathStartIdx, out.length);
                out = out.slice(0, mathStartIdx);
                out += math(mathString, { output: 'mathml'});
                mathStartIdx = null;
            } 
            else { // normal case, just check the map
                out += ESCAPE_CHAR_MAP.get(html[i]) || html[i];
            }
        } else {
            out += char;
        }
    }
    return out;
}