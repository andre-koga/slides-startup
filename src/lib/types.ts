export type Slideshow = {
    metadata: Map<string, string>,
    slides: Slide[]
}

export type Slide = {
    title: string
    template: string
    contents: SlideElement[]
    index: number
}

export type SlideElement = {
    type: ElementType
    source: string
    sourceLine: number
    spans: Span[]
    decorators: Decorator[]
    data?: unknown
}

export type Span = {
    type: SpanType
    start: number
    end: number
}

export type Decorator = {
    type: DecoratorType
    start: number
    end: number
}

export enum SpanType {
    INDICATOR = 'indicator',
    CONTENT = 'content',
    OTHER = 'other'
}

export enum DecoratorType {
    ITALICS = 'italics',
    BOLD = 'bold',
    UNDERLINE = 'underline',
    CODE = 'code',
    STRIKETHROUGH = 'strikethrough',
    MATH = 'math'
}

export enum ElementType {
    HEADER = 'header',
    LIST = 'list',
    LIST_ELEMENT = 'listElement',
    COMMENT = 'comment',
    EMPTY = 'empty',
    TEXT = 'text',
    RESOURCE = 'resource'
}

export type Pair = {
    start: number
    end: number
}