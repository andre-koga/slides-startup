import { type Slideshow, type Slide, type SlideElement, ElementType } from './types';
import { SINGLELINE_ELEMENT_PARSERS } from './singleLineElementParsers';
import { MULTILINE_ELEMENT_PARSERS } from './multiLineElementParsers';
import { ESC_CHAR } from './constants';

// match any lines in the form '---{SLIDEINFO}'
const SLIDE_REGEX = /^---([a-zA-Z0-9_.]*)\s(.*)$/;

// match lines in form 'key = value', where key and value are alphanumeric
const METADATA_REGEX = /^([a-zA-Z0-9_.]+)\s*=\s*([a-zA-Z0-9_.]+)$/;

// match all newlines (after standardization)
const LINE_SEP_REGEX = /\n/;

/**
 * @param {string} markup: string containing the raw markup
 * @returns {Slideshow}: the compiled slideshow
 */
export const processMarkup = (markup: string) => {
	markup = preprocessMarkup(markup);

	const lines = markup.split(LINE_SEP_REGEX);

	// below code splits up the markdown into metadata lines and slide lines
	const { metadataLines, slidesLines, slideInfo } = splitMarkup(lines);

	const metadata = parseMetadata(metadataLines);

	const slides = slidesLines.map((slideLines, i) => {
		// start with 'largest' elements: multi-line code blocks and math blocks
		const part1 = parseMultilineElements(slideLines, slideInfo[i][2]);

		// next do line level elements like headers and quotes
		const part2 = parseSingleLineElements(part1, slideInfo[i][2]);

		// finally add decorators like italics and bold to the elements
		const part3 = addDecorators(part2);

		return generateSlide(part3, slideInfo[i]);
	});

	return {
		metadata: metadata,
		slides: slides
	} as Slideshow;
};

/**
 * @param {string} markup: string containing the raw markup
 * @returns {string}: the preprocessed markup
 */
const preprocessMarkup = (markup: string) => {
	// standardize line endings
	markup = markup.replaceAll(/\r\n/g, '\n');
	markup = markup.replaceAll(/\r/g, '\n');

	// todo: special characters for replacement
	/*
    markup = markup.replaceAll(/&/g, '&amp;');
    markup = markup.replaceAll(/</g, '&lt;');
    markup = markup.replaceAll(/>/g, '&gt;');
    */

	// escape special characters
	markup = markup.replaceAll(ESC_CHAR, `${ESC_CHAR}${ESC_CHAR}`);

	return markup;
};

function splitMarkup(lines: string[]) {
	const metadataLines: string[] = [];
	const slidesLines: string[][] = [];
	const slideInfo: [string, string, number][] = []; // name, template, line idx
	let inMetadata = true;
	lines.forEach((line, i) => {
		const isNewSlide = SLIDE_REGEX.exec(line);
		if (isNewSlide) {
			inMetadata = false;
			slideInfo.push([isNewSlide[1], isNewSlide[2], i]);
			slidesLines.push([]);
		} else if (inMetadata) {
			metadataLines.push(line);
		} else {
			slidesLines[slidesLines.length - 1].push(line);
		}
	});
	return { metadataLines, slidesLines, slideInfo };
}

/**
 * @param {string[]} metadataLines: array of metadata lines
 * @returns {Map<string, string>}: map of metadata key-value pairs
 */
const parseMetadata = (metadataLines: string[]) => {
	const metadata = new Map<string, string>();
	metadataLines.forEach((line) => {
		const res = METADATA_REGEX.exec(line);
		if (res) {
			metadata.set(res[1], res[2]);
		}
	});
	return metadata;
};

/**
 * @param {string[]} lines array of the strings representing the lines in a slide
 * @param {number} lineNumber: the line number of the first line in the slide
 * @returns {(string | SlideElement)[]}: the given array with mutliline elements replaced with SlideElements
 */
const parseMultilineElements = (
	lines: (string | SlideElement)[],
	lineNumber: number
): (string | SlideElement)[] => {
	for (const parser of MULTILINE_ELEMENT_PARSERS) {
		lines = parser.parse(lines, lineNumber);
	}

	return lines;
};

/**
 * @param {(string | SlideElement)[]} slideLines: array of lines in a slide
 * @param {number} lineNumber: the line number of the first line in the slide
 * @returns {SlideElement[]}: array of lines with strings replaced with SlideElements
 */
const parseSingleLineElements = (
	slideLines: (string | SlideElement)[],
	lineNumber: number
): SlideElement[] => {
	let currLine = lineNumber;
	const out: SlideElement[] = [];
	slideLines.forEach((line) => {
		if (typeof line !== 'string') {
			// already parsed element (multiline)
			currLine += line.length;
			out.push(line);
			return;
		}
		currLine += 1;
		for (const parser of SINGLELINE_ELEMENT_PARSERS) {
			const elem = parser.parse(line, currLine);
			if (elem) {
				out.push(elem);
				break;
			}
		}
	});
	return out;
};

const generateSlide = (elements: SlideElement[], slideInfo: [string, string, number]): Slide => {
	const [name, template, lineNumber] = slideInfo;
	return {
		title: name,
		template: template,
		contents: elements,
		lineNumber: lineNumber
	} as Slide;
};

type Decorator = {
	identifier: string;
	escStart: string;
	escEnd: string;
	blocking?: boolean;
};

const addDecorators = (slideLines: SlideElement[]) => {
	return slideLines.map((element) => {
		if (element.noDecorators) {
			return element;
		}
		return addDecoratorsToElement(element);
	});
};

const addDecoratorsToElement = (element: SlideElement) => {
	const BACKSLASH_CHARS = ['_', '$', '*', '**', '`', '\\'];

	const SPANS = [
		{
			identifier: '$',
			escStart: 'a',
			escEnd: 'b',
			blocking: true
		},
		{
			identifier: '_',
			escStart: 'c',
			escEnd: 'd'
		},
		{
			identifier: '**',
			escStart: 'e',
			escEnd: 'f'
		},
		{
			identifier: '*',
			escStart: 'g',
			escEnd: 'h'
		},
		{
			identifier: '`',
			escStart: 'i',
			escEnd: 'j'
		},
		{
			identifier: '~',
			escStart: 'k',
			escEnd: 'l'
		}
	];

	const BLOCKING_INDICES: [number, number][] = [];

	// one pass for each type of span
	for (const span of SPANS) {
		addDecoratorToElement(element, span, BLOCKING_INDICES);
	}

	// finally, remove backslashes when they escape a special character
	let out = '';
	for (let i = 0; i < element.value.length; i++) {
		if (
			element.value[i] === '\\' &&
			i + 1 < element.value.length &&
			BACKSLASH_CHARS.includes(element.value[i + 1])
		) {
			i++;
		}
		out += element.value[i];
	}
	element.value = out;

	return element;
};

function addDecoratorToElement(
	element: SlideElement,
	span: Decorator,
	BLOCKING_INDICES: [number, number][]
) {
	let lastSeen = null;
	for (let i = 0; i <= element.value.length - span.identifier.length; i++) {
		if (blocked(i, BLOCKING_INDICES)) {
			continue;
		}
		const val = element.value.slice(i, i + span.identifier.length);
		if (element.value[i] === '\\') {
			i++;
		} else if (val === span.identifier) {
			if (lastSeen === null) {
				lastSeen = i;
			} else if (i === lastSeen + 1) {
				// empty span (maybe switch to lastSeen + identifier.length?)
				lastSeen = i;
			} else {
				if (span.blocking) {
					BLOCKING_INDICES.push([lastSeen, i + span.identifier.length]);
				}
				// replace start and end of span with escape characters
				const start = element.value.slice(0, lastSeen);
				const middle = element.value.slice(lastSeen + span.identifier.length, i);
				const end = element.value.slice(i + span.identifier.length);
				element.value = `${start}${ESC_CHAR}${span.escStart}${middle}${ESC_CHAR}${span.escEnd}${end}`;
				lastSeen = null;
			}
			i += span.identifier.length - 1;
		}
	}
}

const blocked = (index: number, blockedIndices: [number, number][]) => {
	for (const pair of blockedIndices) {
		if (pair[0] <= index && index < pair[1]) {
			return true;
		}
	}
	return false;
};
