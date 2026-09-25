// checks one or more rule files in isolation: parses them and runs their good and bad examples through the
// syntax matcher. use it while authoring, before the full suite.
//
//   pnpm script scripts/check-rule.ts rules/ts/hacky/type-safety/no-explicit-any.md [...more]

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import pc from 'picocolors';

import { matchAst, parseSource } from '../src/analyzers/ast.js';
import { Detect, parseRule } from '../src/rule.js';
import type { AstRule, Example } from '../src/rule.js';
import { RULES_DIR } from '../src/shared/paths.js';

type Problem = string;

async function main(paths: readonly string[]): Promise<void> {
	if (paths.length === 0) {
		throw new Error('give at least one rule file');
	}

	let failures = 0;

	for (const given of paths) {
		const path = resolve(given);
		const problems = await checkRule(path);

		if (problems.length === 0) {
			process.stdout.write(`${pc.green('ok')}   ${given}\n`);

			continue;
		}

		failures += 1;
		process.stdout.write(`${pc.red('fail')} ${given}\n${problems.map(problem => `     ${problem}`).join('\n')}\n`);
	}

	process.exitCode = failures === 0 ? 0 : 1;
}

async function checkRule(path: string): Promise<Problem[]> {
	let rule;

	try {
		rule = parseRule(RULES_DIR, path, await readFile(path, 'utf-8'));
	} catch (error) {
		return [error instanceof Error ? error.message : String(error)];
	}

	if (rule.detect !== Detect.AST) {
		return [];
	}

	return [
		...rule.bad.flatMap((example, index) => checkBad(rule, example, index + 1)),
		...rule.good.flatMap((example, index) => checkGood(rule, example, index + 1)),
	];
}

function checkBad(rule: AstRule, example: Example, index: number): Problem[] {
	const lines = matchedLines(rule, example);

	if (lines instanceof Error) {
		return [lines.message];
	}

	if (lines.length === 0) {
		return [`bad example ${index}: no match`];
	}

	return example.expectLines
		.filter(expected => !lines.includes(expected))
		.map(expected => `bad example ${index}: expected a match on line ${expected}, matched ${lines.join(', ')}`);
}

function checkGood(rule: AstRule, example: Example, index: number): Problem[] {
	const lines = matchedLines(rule, example);

	if (lines instanceof Error) {
		return [lines.message];
	}

	return lines.length === 0 ? [] : [`good example ${index}: matched on line ${lines.join(', ')}`];
}

function matchedLines(rule: AstRule, example: Example): number[] | Error {
	const matcher = rule.ast[example.lang];

	if (matcher === undefined) {
		return new Error(`${example.lang} example but no ${example.lang} matcher`);
	}

	try {
		return matchAst(parseSource(example.lang, example.source), matcher).flatMap(match =>
			Array.from({ length: match.endLine - match.line + 1 }, (_, offset) => match.line + offset)
		);
	} catch (error) {
		return new Error(`matcher failed: ${error instanceof Error ? error.message : String(error)}`);
	}
}

main(process.argv.slice(2)).catch((error: unknown) => {
	process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
	process.exitCode = 1;
});
