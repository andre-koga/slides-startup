import type { SlideElement } from "./types"
import { ElementType } from "./types"

type ElementParser = {
    parse: (line: string) => SlideElement | null
}

const HeaderParser : ElementParser = {
    parse: (line) => {
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

const TextParser : ElementParser = {
    parse: (line) => {
        return {
            type: ElementType.TEXT,
            value: line
        } as SlideElement
    }
}

export const ELEMENT_PARSERS = [HeaderParser, TextParser]