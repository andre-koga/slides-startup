export type Slideshow = {
    metadata: Map<string, string>,
    slides: Slide[]
}

export type Slide = {
    title: string
    contents: SlideElement[]
}

export type SlideElement = {
    type: ElementType
    value: string
    children?: SlideElement[]
    data?: unknown
}

export enum ElementType {
    HEADER = 'header',
    TEXT = 'text'
}