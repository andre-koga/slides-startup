import type { Slide, SlideElement } from "./types";
import { ElementType } from "./types";

export const generateHTML = (slide : Slide) => {
    return `
        <div class="slide">
            ${slide.contents.map((element) => {
                return elementToHtml(element);
            }).join('\n')}
        </div>
    `
}

const elementToHtml = (element : SlideElement) => {
    if (element.type === ElementType.HEADER) {
        return `<h${element.data}>${element.value}</h${element.data}>`
    } else {
        return `<p>${element.value}</p>`
    }
}