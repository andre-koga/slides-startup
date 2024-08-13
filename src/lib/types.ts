export type Slideshow = {
    metadata: Map<string, string>,
    slides: Slide[]
}

export type Slide = {
    title: string
    template: string
    contents: SlideElement[]
    idx: number
}

export type SlideElement = {
    type: ElementType
    value: string
    idx: number
    children?: SlideElement[]
    data?: unknown
    flags?: FlagType[]
}

export enum ElementType {
    HEADER = 'header',
    MULTILINE_CODE = 'multilineCode',
    LIST_ELEMENT = 'listElement',
    COMMENT = 'comment',
    EMPTY = 'empty',
    TEXT = 'text',
    RESOURCE = 'resource'
}

export enum FlagType {
    MULTILINE_CODE_START = 'multilineCodeStart',
    MULTILINE_CODE_END = 'multilineCodeEnd'
}