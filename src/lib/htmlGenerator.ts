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
    } else if (element.type === ElementType.LIST) {
        if (!element.children) {
            return '';
        }
        return `
            <${element.data}>
                ${element.children.map((child) => {
                    return elementToHtml(child) as string;
                }).join('\n')}
            </${element.data}>
        `
    } else if (element.type === ElementType.LIST_ELEMENT) {
        return `<li>${element.value}</li>`
    }
    else {
        return `<p>${element.value}</p>`
    }
}

const ESCAPE_CHAR_MAP = new Map<string, string>();
ESCAPE_CHAR_MAP.set('a', '<u>');
ESCAPE_CHAR_MAP.set('b', '</u>');
const MATH_START = 'c';
const MATH_END = 'd';

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