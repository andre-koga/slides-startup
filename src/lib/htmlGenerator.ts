import type { Slide, SlideElement } from "./types";
import { ElementType } from "./types";
import { ESC_CHAR } from "./constants";

import { math } from "mathlifier";

export const generateHTML = (slide : Slide) => {
    const html = `
        <div class="slide">
            ${slide.contents.map((element) => {
                return elementToHtml(element);
            }).join('\n')}
        </div>
    `
    return processEscapeChars(html);
}

const elementToHtml = (element : SlideElement) : string => {
    if (element.type === ElementType.HEADER) {
        return `<h${element.data}>${element.value}</h${element.data}>`
    } else if (element.type === ElementType.LIST_ELEMENT) {
        return `<li>${element.value}</li>`
    } else if (element.type === ElementType.RESOURCE) {
        if (element.data && element.data.url && element.data.alt) {
            return `<img src="${element.data.url}" alt=${element.data.alt} />`
        } else if (element.data && element.data.url) {
            return `<img src="${element.data.url}" />`
        } else {
            return ''
        }
    }
    else if (element.type === ElementType.COMMENT || element.type == ElementType.EMPTY) {
        return '';
    }
    else {
        return `<p>${element.value}</p>`
    }
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