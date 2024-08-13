export type Slideshow = {
    metadata: Map<string, string>,
    slides: Slide[]
}

export type Slide = {
    title: string
    template: string
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
    LIST_ELEMENT = 'listElement',
    COMMENT = 'comment',
    EMPTY = 'empty',
    TEXT = 'text',
    RESOURCE = 'resource'
}