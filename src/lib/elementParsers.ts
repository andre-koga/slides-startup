import type { SlideElement } from "./types"
import { ElementType, FlagType } from "./types"

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
        // match empty lines
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
        // match comments starting with '//'
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

const ResourceParser : ElementParser = {
    parse: (line) => {
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
                }
            } as SlideElement
        } else if (res2) {
            return {
                type: ElementType.RESOURCE,
                value: "",
                data: {
                    url: res2[1]
                }
            } as SlideElement
        } else {
            return null
        }
    }
}

const TextParser : ElementParser = {
    parse: (line) => {
        const multilineCodeStart = /^```.*$/.test(line);
        const multilineCodeEnd = /^.*```$/.test(line);
        const flags = [];
        if (multilineCodeStart) {
            flags.push(FlagType.MULTILINE_CODE_START);
        }
        if (multilineCodeEnd) {
            flags.push(FlagType.MULTILINE_CODE_END);
        }
        
        // fallthrough case, return a text element
        return {
            type: ElementType.TEXT,
            value: line,
            flags: flags
        } as SlideElement
    }
}

export const ELEMENT_PARSERS = [HeaderParser, OLParser, ULParser, EmptyParser, CommentParser, ResourceParser, TextParser]