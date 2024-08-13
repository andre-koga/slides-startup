export type Slideshow = {
    metadata: Map<string, string>,
    slides: Slide[]
}

export type Slide = {
    title: string
    template: string
    contents: SlideElement[]
    lineNumber: number
}

export type SlideElement = {
    type: ElementType
    value: string
    lineNumber: number
    length: number
    data?: unknown
    noDecorators?: boolean
}

export enum ElementType {
    MULTILINE_CODE = 'multilineCode',
    MULTILINE_MATH = 'multilineMath',
    HEADER = 'header',
    LIST_ELEMENT = 'listElement',
    COMMENT = 'comment',
    EMPTY = 'empty',
    TEXT = 'text',
    RESOURCE = 'resource'
}