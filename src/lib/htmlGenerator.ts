import type { Slide, Element } from "./types";

export const generateHTML = (slide : Slide) => {
    return `
        <div class="slide">
            ${slide.contents.map((element) => {
                return elementToHtml(element);
            }).join('\n')}
        </div>
    `
}

const elementToHtml = (element : Element) => {
    if (element.type === 'header') {
        return `<h1>${element.value}</h1>`
    } else {
        return `<p>${element.value}</p>`
    }
}