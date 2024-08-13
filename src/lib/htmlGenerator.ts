import type { Slide, SlideElement } from "./types";
import { ElementType } from "./types";
import { ESC_CHAR } from "./constants";

import { math } from "mathlifier";

export const generateHTML = (slide : Slide) => {
    const html = `
        <div class="slide">
            ${slide.contents.map((element, i) => {
                return elementToHtml(element, i === 0 ? null : slide.contents[i - 1]);
            }).join('\n')}
        </div>
    `
    return processEscapeChars(html);
}

const elementToHtml = (element : SlideElement, previous : SlideElement | null) : string => {
    let out = "";
    
    // add closing list tags
    if (previous && previous.type === ElementType.LIST_ELEMENT) {
        if (element.type !== ElementType.LIST_ELEMENT || element.data !== previous.data) {
            out += `</${previous.data}>`
        }
    }

    if (element.type === ElementType.HEADER) {
        out = `<h${element.data}>${element.value}</h${element.data}>`
    } else if (element.type === ElementType.LIST_ELEMENT) {
        const listType : string = element.data as string
        if (!previous || previous.data !== listType) {
            out += `<${listType}>`
        }
        out += `<li>${element.value}</li>`
    } else if (element.type === ElementType.RESOURCE) {
        if (element.data && element.data.url && element.data.alt) {
            out = `<img src="${element.data.url}" alt=${element.data.alt} />`
        } else if (element.data && element.data.url) {
            out = `<img src="${element.data.url}" />`
        } else {
            out = ''
        }
    }
    else if (element.type === ElementType.COMMENT) {
        out = '';
    } else if (element.type === ElementType.EMPTY) {
        out = '<br />'
    }
    else {
        out = `<p>${element.value}</p>`
    }

    previous = element;
    return out
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

const processEscapeChars = (html : string) => {
    let out = '';

    let mathStartIdx = null;
    for (let i = 0; i < html.length; i++) {
        const char = html[i];
        if (char === ESC_CHAR) {
            i++;
            if (html[i] === MATH_START) {
                mathStartIdx = out.length;
            } else if (html[i] === MATH_END && mathStartIdx !== null) {
                const mathString = out.slice(mathStartIdx, out.length);
                out = out.slice(0, mathStartIdx);
                out += math(mathString, { output: 'mathml'});
                mathStartIdx = null;
            } 
            else {
                out += ESCAPE_CHAR_MAP.get(html[i]) || html[i];
            }
        } else {
            out += char;
        }
    }
    return out;
}