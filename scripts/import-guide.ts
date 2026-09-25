// splits a STYLE.md guide into draft rule files for review. every `###` section becomes one draft under
// drafts/<lang>/<category>/<slug>.md with the prose as Why and its GOOD/BAD blocks as examples. the
// frontmatter is a stub: pick the axis, severity, and detection by hand, then move the file under rules/.
// recipes and tooling sections come out as drafts too; delete them or move them to patterns/.
//
//   pnpm script scripts/import-guide.ts --lang ts --guide path/to/STYLE.md [--out drafts]

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

import { langValues } from '../src/lang.js';
import { logger } from '../src/shared/log.js';

const { values } = parseArgs({
	options: {
		lang: { type: 'string' },
		guide: { type: 'string' },
		out: { type: 'string', default: 'drafts' },
	},
	strict: true,
});

type Section = {
	category: string;
	title: string;
	body: string;
};

type Draft = {
	slug: string;
	category: string;
	why: string;
	good: string[];
	bad: string[];
};

const MARKER_PATTERN = /^\s*\/\/\s*(GOOD|BAD)\b/;
const FENCE_PATTERN = /^```(\w*)\s*$/;

async function main(): Promise<void> {
	if (!values.lang || !(langValues as readonly string[]).includes(values.lang) || !values.guide) {
		throw new Error(`usage: --lang <${langValues.join('|')}> --guide <STYLE.md>`);
	}

	const guide = await readFile(values.guide, 'utf-8');
	const drafts = splitSections(guide).map(toDraft);
	const outDir = join(values.out, values.lang);

	for (const draft of drafts) {
		const dir = join(outDir, draft.category);
		await mkdir(dir, { recursive: true });
		await writeFile(join(dir, `${draft.slug}.md`), renderDraft(draft, values.lang));
	}

	logger.info({ drafts: drafts.length, out: outDir }, 'wrote drafts');
}

// `##` headings name the category; each `###` under them is a candidate rule
function splitSections(guide: string): Section[] {
	const sections: Section[] = [];
	let category = 'general';
	let current: Section | undefined;
	let inFence = false;

	for (const line of guide.split('\n')) {
		if (line.startsWith('```')) {
			inFence = !inFence;
		}

		if (!inFence && line.startsWith('## ')) {
			category = slugify(line.slice(3));
			current = undefined;

			continue;
		}

		if (!inFence && line.startsWith('### ')) {
			current = { category, title: line.slice(4).trim(), body: '' };
			sections.push(current);

			continue;
		}

		if (current !== undefined) {
			current.body += `${line}\n`;
		}
	}

	return sections;
}

function toDraft(section: Section): Draft {
	const good: string[] = [];
	const bad: string[] = [];
	const prose: string[] = [];
	let block: { info: string; lines: string[] } | undefined;

	for (const line of section.body.split('\n')) {
		const fence = FENCE_PATTERN.exec(line);

		if (block === undefined) {
			if (fence?.[1] !== undefined) {
				block = { info: fence[1], lines: [] };
			} else {
				prose.push(line);
			}

			continue;
		}

		if (line.startsWith('```')) {
			for (const segment of splitByMarker(block.lines)) {
				const target = segment.kind === 'BAD' ? bad : good;
				target.push(`\`\`\`${block.info}\n${segment.lines.join('\n')}\n\`\`\``);
			}

			block = undefined;

			continue;
		}

		block.lines.push(line);
	}

	return {
		slug: slugify(section.title),
		category: section.category,
		why: prose
			.join('\n')
			.replace(/\*\*Why:\*\*\s*/g, '')
			.trim(),
		good,
		bad,
	};
}

// one guide block often holds several GOOD/BAD segments; each becomes its own example
function splitByMarker(lines: readonly string[]): { kind: 'GOOD' | 'BAD'; lines: string[] }[] {
	const segments: { kind: 'GOOD' | 'BAD'; lines: string[] }[] = [];
	let current: { kind: 'GOOD' | 'BAD'; lines: string[] } = { kind: 'GOOD', lines: [] };

	for (const line of lines) {
		const marker = MARKER_PATTERN.exec(line);

		if (marker !== null) {
			if (current.lines.some(item => item.trim())) {
				segments.push(current);
			}

			current = { kind: marker[1] === 'BAD' ? 'BAD' : 'GOOD', lines: [line.replace(/\b(GOOD|BAD)\b/, '$1:')] };

			continue;
		}

		current.lines.push(line);
	}

	if (current.lines.some(item => item.trim())) {
		segments.push(current);
	}

	return segments.map(segment => ({ ...segment, lines: trimBlank(segment.lines) }));
}

function renderDraft(draft: Draft, lang: string): string {
	const fence = lang;
	const good = draft.good.length > 0 ? draft.good : [`\`\`\`${fence}\n// GOOD: fill in\n\`\`\``];
	const bad = draft.bad.length > 0 ? draft.bad : [`\`\`\`${fence}\n// BAD: fill in\n\`\`\``];

	return [
		'---',
		'# DRAFT: choose axis (move under rules/<lang>/<axis>/<category>/), severity, and detection',
		'severity: minor',
		'detect: ast',
		'ast:',
		'  rule:',
		"    pattern: 'TODO'",
		'---',
		'',
		'## Why',
		'',
		draft.why || 'TODO',
		'',
		'## Bad',
		'',
		bad.join('\n\n'),
		'',
		'## Good',
		'',
		good.join('\n\n'),
		'',
	].join('\n');
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/`/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

function trimBlank(lines: readonly string[]): string[] {
	let start = 0;
	let end = lines.length;

	while (start < end && !lines[start]?.trim()) {
		start += 1;
	}

	while (end > start && !lines[end - 1]?.trim()) {
		end -= 1;
	}

	return lines.slice(start, end);
}

main().catch((error: unknown) => {
	logger.error({ err: error }, 'import-guide failed');
	process.exitCode = 1;
});
