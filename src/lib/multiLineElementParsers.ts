import { ElementType, type SlideElement } from "./types";

// todo: maybe switch to regex
const detectStartEndElement = (lines : (string | SlideElement)[], elemType : ElementType, startText : string, endText : string, startIdx : number, noDecorators : boolean) => {
    const startRegex = new RegExp(`^${startText}`);
    const endRegex = new RegExp(`${endText}$`);

    const out : (string | SlideElement)[] = [];
    let currLine = startIdx;

    let multilineStart : number | null = null;
    for (let i = 0; i < lines.length; i++) {
        out.push(lines[i]);

        const element = lines[i];

        if (typeof element !== 'string') {
            // no nested elements
            multilineStart = null;
            currLine += element.length;

            continue;
        }
        currLine += 1;

        const start = startRegex.test(element);
        const end = endRegex.test(element);

        if (!start && !end) {
            continue;
        }
        if (multilineStart === null && start) {
            multilineStart = i;
        }
        if (multilineStart !== null && end) {
            // catches the edge case of, for instance, a line with only '```'
            if (i === multilineStart && element.length < startText.length + endText.length) {
                continue;
            }
            const multilineContent = lines.slice(multilineStart, i + 1);
            
            // get rid of the start and end text
            if (typeof multilineContent[0] === 'string') {
                multilineContent[0] = multilineContent[0].slice(startText.length);
            }
            const last = multilineContent[multilineContent.length - 1] // stops ide from complaining
            if (typeof last === 'string') {
                multilineContent[multilineContent.length - 1] = last.slice(0, -endText.length);
            }

            out.splice(multilineStart)
            out.push({
                type: elemType,
                value: multilineContent.join('\n'),
                lineNumber: currLine,
                length: i - multilineStart + 1,
                noDecorators: noDecorators
            } as SlideElement)
            multilineStart = null;
        }
    }

    return out;
}

type MultilineElementParser = {
    parse: (slideLines: (string | SlideElement)[], startIdx : number) => (string | SlideElement)[];
}

const MutilineCodeParser : MultilineElementParser = {
    parse: (slideLines, startIdx) => {
        return detectStartEndElement(slideLines, ElementType.MULTILINE_CODE, '```', '```', startIdx, false);
    }
}

const MutilineMathParser : MultilineElementParser = {
    parse: (slideLines, startIdx) => {
        return detectStartEndElement(slideLines, ElementType.MULTILINE_MATH, '\\$\\$', '\\$\\$', startIdx, true);
    }
}

export const MULTILINE_ELEMENT_PARSERS = [MutilineCodeParser, MutilineMathParser]