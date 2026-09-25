import type { Change } from '../change.js';

// how many untouched lines to show around each changed line, and how close two regions must be to merge
const CONTEXT_LINES = 15;
const MERGE_GAP = 40;
const GUTTER_WIDTH = 5;
const CHARS_PER_TOKEN = 4;

export type Region = {
	start: number;
	end: number;
};

// one prompt's worth of a file: the regions it covers and the rendered text the model sees
export type Chunk = {
	path: string;
	regions: readonly Region[];
	text: string;
	estimatedTokens: number;
};

// splits a change into chunks that each fit the token budget. regions are changed lines widened by context and
// merged when close; the file's leading import block rides along so symbols have a home.
export function chunkChange(change: Change, budgetTokens: number): Chunk[] {
	const lineCount = change.source.split('\n').length;
	const regions = mergeRegions([...importRegion(change.source), ...changedRegions(change, lineCount)]);
	const budgetChars = budgetTokens * CHARS_PER_TOKEN;

	const chunks: Chunk[] = [];
	let pending: Region[] = [];
	let pendingChars = 0;

	for (const region of regions) {
		const chars = renderRegion(change, region).length;

		if (pending.length > 0 && pendingChars + chars > budgetChars) {
			chunks.push(toChunk(change, pending));
			pending = [];
			pendingChars = 0;
		}

		pending.push(region);
		pendingChars += chars;
	}

	if (pending.length > 0) {
		chunks.push(toChunk(change, pending));
	}

	return chunks;
}

export function estimateTokens(text: string): number {
	return Math.ceil(text.length / CHARS_PER_TOKEN);
}

function changedRegions(change: Change, lineCount: number): Region[] {
	return [...change.changedLines]
		.sort((a, b) => a - b)
		.map(line => ({
			start: Math.max(1, line - CONTEXT_LINES),
			end: Math.min(lineCount, line + CONTEXT_LINES),
		}));
}

const IMPORT_LINE = /^(import\b|\)$|\t"|\s+"[^"]+"$)/;
const IMPORT_SCAN_LIMIT = 80;

// lines 1..N covering the file's import statements, or nothing when the file has none
function importRegion(source: string): Region[] {
	const lines = source.split('\n', IMPORT_SCAN_LIMIT);
	let end = 0;

	lines.forEach((line, index) => {
		if (IMPORT_LINE.test(line)) {
			end = index + 1;
		}
	});

	return end === 0 ? [] : [{ start: 1, end }];
}

function mergeRegions(regions: readonly Region[]): Region[] {
	const sorted = [...regions].sort((a, b) => a.start - b.start);
	const merged: Region[] = [];

	for (const region of sorted) {
		const last = merged.at(-1);

		if (last !== undefined && region.start - last.end <= MERGE_GAP) {
			last.end = Math.max(last.end, region.end);

			continue;
		}

		merged.push({ ...region });
	}

	return merged;
}

function toChunk(change: Change, regions: Region[]): Chunk {
	const header = `file: ${change.path} (${change.lang})\n\n`;
	const body = regions.map(region => renderRegion(change, region)).join(`\n${' '.repeat(GUTTER_WIDTH + 1)}...\n\n`);
	const text = `${header}${body}`;

	return {
		path: change.path,
		regions,
		text,
		estimatedTokens: estimateTokens(text),
	};
}

function renderRegion(change: Change, region: Region): string {
	const lines = change.source.split('\n');
	const rendered: string[] = [];

	for (let line = region.start; line <= region.end; line += 1) {
		const marker = change.changedLines.has(line) ? '+' : ' ';
		rendered.push(`${marker}${String(line).padStart(GUTTER_WIDTH)}  ${lines[line - 1] ?? ''}`);
	}

	return rendered.join('\n');
}
