import { describe, expect, it } from 'vitest';

import { matchAst, parseSource } from './src/analyzers/ast.js';
import { Detect, loadRules } from './src/rule.js';
import type { AstRule, Example } from './src/rule.js';
import { RULES_DIR } from './src/shared/paths.js';

// every rule file is its own spec: bad examples must match, good examples must not.
const rules = await loadRules(RULES_DIR);
const astRules = rules.filter((rule): rule is AstRule => rule.detect === Detect.AST);

function matchLines(rule: AstRule, example: Example): number[] {
	const matcher = rule.ast[example.lang];

	if (matcher === undefined) {
		throw new Error(`${rule.id} has a ${example.lang} example but no ${example.lang} matcher`);
	}

	return matchAst(parseSource(example.lang, example.source), matcher).flatMap(match =>
		Array.from({ length: match.endLine - match.line + 1 }, (_, offset) => match.line + offset)
	);
}

describe('rules', () => {
	it('loads at least one rule', () => {
		expect(rules.length).toBeGreaterThan(0);
	});

	describe.each(astRules.map(rule => [rule.id, rule] as const))('%s', (_id, rule) => {
		it.each(rule.bad.map((example, index) => [index + 1, example] as const))(
			'bad example %i matches on the marked lines',
			(_index, example) => {
				const lines = matchLines(rule, example);

				expect(lines.length).toBeGreaterThan(0);

				for (const expected of example.expectLines) {
					expect(lines).toContain(expected);
				}
			}
		);

		it.each(rule.good.map((example, index) => [index + 1, example] as const))(
			'good example %i does not match',
			(_index, example) => {
				expect(matchLines(rule, example)).toEqual([]);
			}
		);
	});
});
