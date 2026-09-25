import { execFile } from 'node:child_process';
import { matchesGlob } from 'node:path';
import { promisify } from 'node:util';

import { detectLang } from './lang.js';
import type { Lang } from './lang.js';
import { mapConcurrent } from './shared/concurrency.js';
import { GitError } from './shared/errors.js';

const execFileAsync = promisify(execFile);

const GIT_MAX_BUFFER = 64 * 1024 * 1024;

export type Range = {
	base: string;
	head: string;
};

// a changed file at `head`: its full source plus the 1-based lines this range added or modified.
// scoredLines is the count of changed lines that are not blank; it normalizes the score.
export type Change = {
	path: string;
	lang: Lang;
	source: string;
	changedLines: ReadonlySet<number>;
	scoredLines: number;
};

export async function readChanges(repo: string, range: Range, ignore: readonly string[]): Promise<Change[]> {
	const diff = await git(repo, [
		'diff',
		'--unified=0',
		'--no-color',
		'--diff-filter=AMR',
		'--find-renames',
		`${range.base}...${range.head}`,
	]);

	const files = parseDiff(diff).filter(file => detectLang(file.path) !== undefined && !isIgnored(file.path, ignore));

	return mapConcurrent(files, async file => {
		const source = await git(repo, ['show', `${range.head}:${file.path}`]);

		return toChange(file, source);
	});
}

export function isIgnored(path: string, globs: readonly string[]): boolean {
	return globs.some(glob => matchesGlob(path, glob));
}

export type DiffFile = {
	path: string;
	addedLines: readonly number[];
};

const NEW_FILE_HEADER = '+++ b/';
const DELETED_FILE_HEADER = '+++ /dev/null';
const HUNK_HEADER_PATTERN = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/;

// reads a zero-context unified diff. with no context lines every hunk's `+` side is exactly the added
// or modified lines, so the header alone tells us which new-file lines changed.
export function parseDiff(diff: string): DiffFile[] {
	const files: DiffFile[] = [];
	let current: { path: string; addedLines: number[] } | undefined;

	for (const line of diff.split('\n')) {
		if (line.startsWith(DELETED_FILE_HEADER)) {
			current = undefined;

			continue;
		}

		if (line.startsWith(NEW_FILE_HEADER)) {
			current = { path: line.slice(NEW_FILE_HEADER.length).trim(), addedLines: [] };
			files.push(current);

			continue;
		}

		const hunk = HUNK_HEADER_PATTERN.exec(line);

		if (hunk === null || current === undefined) {
			continue;
		}

		const start = Number(hunk[1]);
		const count = hunk[2] === undefined ? 1 : Number(hunk[2]);

		for (let offset = 0; offset < count; offset += 1) {
			current.addedLines.push(start + offset);
		}
	}

	return files;
}

function toChange(file: DiffFile, source: string): Change {
	const lang = detectLang(file.path);

	if (lang === undefined) {
		throw new Error(`no language for ${file.path}`);
	}

	const lines = source.split('\n');
	const changedLines = new Set(file.addedLines);
	const scoredLines = [...changedLines].filter(line => lines[line - 1]?.trim()).length;

	return {
		path: file.path,
		lang,
		source,
		changedLines,
		scoredLines,
	};
}

async function git(repo: string, args: readonly string[]): Promise<string> {
	try {
		const { stdout } = await execFileAsync('git', [...args], {
			cwd: repo,
			encoding: 'utf-8',
			maxBuffer: GIT_MAX_BUFFER,
		});

		return stdout;
	} catch (error) {
		const stderr = error instanceof Error && 'stderr' in error ? String(error.stderr).trim() : '';

		throw new GitError(`git ${args[0] ?? ''} failed${stderr ? `: ${stderr}` : ''}`, { cause: error });
	}
}
