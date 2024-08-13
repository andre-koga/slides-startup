import type { Slide, SlideElement } from "./types";
import { ElementType, SpanType } from "./types";
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
    return html
}

const elementToHtml = (element : SlideElement) : string => {
    if (element.type === ElementType.HEADER) {
        let content = ""
        for (const span of element.spans) {
            if (span.type === SpanType.CONTENT) {
                content += element.source.slice(span.start, span.end);
            }
        }
        return `<h${element.data}>${content}</h${element.data}>`
    }
    else {
        let content = ""
        for (const span of element.spans) {
            if (span.type === SpanType.CONTENT) {
                content += element.source.slice(span.start, span.end);
            }
        }
        return `<p>${content}</p>`
    }
}