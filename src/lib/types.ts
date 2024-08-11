export type Slideshow = {
    metadata: Map<string, string>,
    slides: Slide[]
}

export type Slide = {
    title: string
    contents: Element[]
}

export type Element = {
    type: ElementType
    value: string
}

export enum ElementType {
    HEADER = 'header',
    TEXT = 'text'
}