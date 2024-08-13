import type { SlideElement } from "./types"
import { ElementType } from "./types"

type ElementParser = {
    parse: (line: string, lineNumber: number) => SlideElement | null
}

const HeaderParser : ElementParser = {
    parse: (line, lineNumber) => {
        // match 1-6 '#' characters at the beginning of the line
        const res = /^(#{1,6})(.*$)/.exec(line)
        if (!res) {
            return null
        }
        return {
            type: ElementType.HEADER,
            value: res[2],
            data: res[1].length,
            lineNumber: lineNumber,
            length: 1
        }  as SlideElement
    }
}

const QuoteParser : ElementParser = {
    parse: (line, lineNumber) => {
        // match a line starting with a '>' character, then a space (optional starting whitespace)
        const res = /^>\s{1}(.*)$/.exec(line)
        if (!res) {
            return null
        }
        return {
            type: ElementType.QUOTE,
            value: res[1],
            lineNumber: lineNumber,
            length: 1
        } as SlideElement
    }
}

const ULParser : ElementParser = {
    parse: (line, lineNumber) => {
        // match a line starting with a '-' or * character, then a space (optional starting whitespace)
        const res = /^\s?[-*]\s{1}(.*)$/.exec(line)
        if (!res) {
            return null
        }
        return {
            type: ElementType.LIST_ELEMENT,
            value: res[1],
            data: 'ul',
            lineNumber: lineNumber,
            length: 1
        } as SlideElement
    }
}

const OLParser : ElementParser = {
    parse: (line, lineNumber) => {
        // match a line starting with a 'NUMBER. ' sequence (optional whitespace)
        const res = /^\s?[0-9]+\.\s{1}(.*)$/.exec(line)
        if (!res) {
            return null
        }
        return {
            type: ElementType.LIST_ELEMENT,
            value: res[1],
            data: 'ol',
            lineNumber: lineNumber,
            length: 1
        } as SlideElement
    }
}

const EmptyParser : ElementParser = {
    parse: (line, lineNumber) => {
        // match empty lines
        const res = /^\s*$/.exec(line)
        if (!res) {
            return null
        }
        return {
            type: ElementType.EMPTY,
            value: "",
            lineNumber: lineNumber,
            length: 1
        } as SlideElement
    }
}

const CommentParser : ElementParser = {
    parse: (line, lineNumber) => {
        // match comments starting with '//'
        const res = /^\/\/(.*)$/.exec(line)
        if (!res) {
            return null
        }
        return {
            type: ElementType.COMMENT,
            value: res[1],
            lineNumber: lineNumber,
            length: 1
        } as SlideElement
    }
}

const ResourceParser : ElementParser = {
    parse: (line, lineNumber) => {
        // match resource in the form of ![alt text](url)
        const res1 = /^!\[(.*)\]\((.*)\).*$/.exec(line)

        // match resource in the form of !(url)
        const res2 = /^!\((.*)\).*$/.exec(line)
        if (res1) {
            return {
                type: ElementType.RESOURCE,
                value: "",
                data: {
                    alt: res1[1],
                    url: res1[2]
                },
                lineNumber: lineNumber,
                length: 1
            } as SlideElement
        } else if (res2) {
            return {
                type: ElementType.RESOURCE,
                value: "",
                data: {
                    url: res2[1]
                },
                lineNumber: lineNumber,
                length: 1
            } as SlideElement
        } else {
            return null
        }
    }
}

const TextParser : ElementParser = {
    parse: (line, lineNumber) => {
        // fallthrough case, return a text element
        return {
            type: ElementType.TEXT,
            value: line,
            lineNumber: lineNumber,
            length: 1
        } as SlideElement
    }
}

export const SINGLELINE_ELEMENT_PARSERS = [HeaderParser, QuoteParser, OLParser, ULParser, EmptyParser, CommentParser, ResourceParser, TextParser]