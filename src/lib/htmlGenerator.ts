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