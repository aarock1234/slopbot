import { describe, expect, it } from 'vitest';

import type { Change } from '../change.js';
import { chunkChange } from './judge-chunks.js';

function change(lineCount: number, changedLines: number[], head = ''): Change {
	const body = Array.from({ length: lineCount }, (_, index) => `line ${index + 1}`);
	const source = head ? `${head}\n${body.slice(head.split('\n').length).join('\n')}` : body.join('\n');

	return {
		path: 'src/a.ts',
		lang: 'ts',
		source,
		changedLines: new Set(changedLines),
		scoredLines: changedLines.length,
	};
}

describe('chunkChange', () => {
	it('renders changed lines with a + gutter and context around them', () => {
		const [chunk] = chunkChange(change(100, [50]), 6000);

		expect(chunk?.regions).toEqual([{ start: 35, end: 65 }]);
		expect(chunk?.text).toContain('+   50  line 50');
		expect(chunk?.text).toContain('    49  line 49');
		expect(chunk?.text).not.toContain('line 34\n');
	});

	it('merges regions that are close and separates distant ones', () => {
		const [chunk] = chunkChange(change(300, [50, 60, 200]), 6000);

		expect(chunk?.regions).toEqual([
			{ start: 35, end: 75 },
			{ start: 185, end: 215 },
		]);
		expect(chunk?.text).toContain('...');
	});

	it('includes the leading import block as its own region', () => {
		const head = "import { a } from './a.js';\nimport type { B } from './b.js';";
		const [chunk] = chunkChange(change(200, [150], head), 6000);

		expect(chunk?.regions[0]).toEqual({ start: 1, end: 2 });
		expect(chunk?.text).toContain("     1  import { a } from './a.js';");
	});

	it('splits into several chunks when the budget is small', () => {
		const chunks = chunkChange(change(400, [50, 200, 350]), 60);

		expect(chunks.length).toBe(3);
		expect(chunks.every(chunk => chunk.text.startsWith('file: src/a.ts (ts)'))).toBe(true);
	});

	it('clamps regions to the file bounds', () => {
		const [chunk] = chunkChange(change(10, [1, 10]), 6000);

		expect(chunk?.regions).toEqual([{ start: 1, end: 10 }]);
	});
});
