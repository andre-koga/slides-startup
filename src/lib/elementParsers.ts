import type { SlideElement } from "./types"
import { ElementType } from "./types"

type ElementParser = {
    parse: (line: string) => SlideElement | null
}

const HeaderParser : ElementParser = {
    parse: (line) => {
        // match 1-6 '#' characters at the beginning of the line
        const res = /^(#{1,6})(.*$)/.exec(line)
        if (!res) {
            return null
        }
        return {
            type: ElementType.HEADER,
            value: res[2],
            data: res[1].length
        } as SlideElement
    }
}

const ULParser : ElementParser = {
    parse: (line) => {
        // match a line starting with a '-' or * character, then a space (optional starting whitespace)
        const res = /^\s?[-*]\s{1}(.*)$/.exec(line)
        if (!res) {
            return null
        }
        return {
            type: ElementType.LIST_ELEMENT,
            value: res[1],
            data: 'ul'
        } as SlideElement
    }
}

const OLParser : ElementParser = {
    parse: (line) => {
        // match a line starting with a 'NUMBER. ' sequence (optional whitespace)
        const res = /^\s?[0-9]+\.\s{1}(.*)$/.exec(line)
        if (!res) {
            return null
        }
        return {
            type: ElementType.LIST_ELEMENT,
            value: res[1],
            data: 'ol'
        } as SlideElement
    }
}

const EmptyParser : ElementParser = {
    parse: (line) => {
        // fallthrough case, return a text element
        const res = /^\s*$/.exec(line)
        if (!res) {
            return null
        }
        return {
            type: ElementType.EMPTY,
            value: "",
        } as SlideElement
    }
}

const CommentParser : ElementParser = {
    parse: (line) => {
        // fallthrough case, return a text element
        const res = /^\/\/(.*)$/.exec(line)
        if (!res) {
            return null
        }
        return {
            type: ElementType.COMMENT,
            value: res[1],
        } as SlideElement
    }
}

const TextParser : ElementParser = {
    parse: (line) => {
        // fallthrough case, return a text element
        return {
            type: ElementType.TEXT,
            value: line
        } as SlideElement
    }
}

export const ELEMENT_PARSERS = [HeaderParser, OLParser, ULParser, EmptyParser, CommentParser, TextParser]