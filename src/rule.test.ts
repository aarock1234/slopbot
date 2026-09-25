import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { RuleError } from './shared/errors.js';
import { Detect, parseRule } from './rule.js';

const RULES_DIR = join('repo', 'rules');

function rulePath(...segments: string[]): string {
	return join(RULES_DIR, ...segments);
}

const AST_RULE = `---
severity: major
detect: ast
ast:
  rule:
    kind: predefined_type
    regex: ^any$
---

## Why

\`any\` disables the type checker. Prefer \`unknown\` and narrow.

## Bad

\`\`\`ts
const config = load();
// BAD: any hides the shape
const value: any = config;
\`\`\`

## Good

\`\`\`ts
// GOOD: unknown forces narrowing
const value: unknown = load();
\`\`\`
`;

describe('parseRule', () => {
	it('derives identity from the path', () => {
		const rule = parseRule(RULES_DIR, rulePath('ts', 'hacky', 'type-safety', 'no-explicit-any.md'), AST_RULE);

		expect(rule).toMatchObject({
			id: 'ts.hacky.no-explicit-any',
			lang: 'ts',
			axis: 'hacky',
			category: 'type-safety',
			severity: 'major',
			detect: Detect.AST,
		});
	});

	it('wraps a single ast matcher under the rule language', () => {
		const rule = parseRule(RULES_DIR, rulePath('ts', 'hacky', 'type-safety', 'no-explicit-any.md'), AST_RULE);

		expect(rule.detect === Detect.AST && rule.ast.ts?.rule).toEqual({ kind: 'predefined_type', regex: '^any$' });
	});

	it('strips marker lines and records where bad code lands', () => {
		const rule = parseRule(RULES_DIR, rulePath('ts', 'hacky', 'type-safety', 'no-explicit-any.md'), AST_RULE);

		expect(rule.bad[0]).toEqual({
			lang: 'ts',
			source: 'const config = load();\nconst value: any = config;',
			expectLines: [2],
		});
		expect(rule.good[0]?.source).toBe('const value: unknown = load();');
		expect(rule.good[0]?.expectLines).toEqual([]);
	});

	it('falls back to the first sentence of why as the message', () => {
		const rule = parseRule(RULES_DIR, rulePath('ts', 'hacky', 'type-safety', 'no-explicit-any.md'), AST_RULE);

		expect(rule.message).toBe('`any` disables the type checker.');
	});

	it('prefers an explicit message section', () => {
		const content = AST_RULE.replace('## Bad', '## Message\n\nno any\n\n## Bad');
		const rule = parseRule(RULES_DIR, rulePath('ts', 'hacky', 'type-safety', 'no-explicit-any.md'), content);

		expect(rule.message).toBe('no any');
	});

	it('rejects unknown frontmatter keys', () => {
		const content = AST_RULE.replace('severity: major', 'severity: major\nweight: 2');

		expect(() => parseRule(RULES_DIR, rulePath('ts', 'hacky', 'type-safety', 'x.md'), content)).toThrow(RuleError);
	});

	it('rejects paths that do not follow lang/axis/category/slug', () => {
		expect(() => parseRule(RULES_DIR, rulePath('ts', 'hacky', 'x.md'), AST_RULE)).toThrow(/expected path/);
		expect(() => parseRule(RULES_DIR, rulePath('rust', 'hacky', 'c', 'x.md'), AST_RULE)).toThrow(
			/unknown language/
		);
		expect(() => parseRule(RULES_DIR, rulePath('ts', 'ugly', 'c', 'x.md'), AST_RULE)).toThrow(/unknown axis/);
	});

	it('requires lang-agnostic rules to give per-language matchers', () => {
		expect(() => parseRule(RULES_DIR, rulePath('any', 'idiom', 'comments', 'x.md'), AST_RULE)).toThrow(
			/ast.ts and\/or ast.go/
		);
	});

	it('rejects an example written in a language the rule does not target', () => {
		const content = AST_RULE.replace('```ts\n// GOOD', '```go\n// GOOD');

		expect(() => parseRule(RULES_DIR, rulePath('ts', 'hacky', 'c', 'x.md'), content)).toThrow(
			/go example in a ts rule/
		);
	});

	it('requires why, good, and bad', () => {
		const withoutGood = AST_RULE.slice(0, AST_RULE.indexOf('## Good'));

		expect(() => parseRule(RULES_DIR, rulePath('ts', 'hacky', 'c', 'x.md'), withoutGood)).toThrow(/## Good/);
	});

	it('parses judge rules with a confirm predicate', () => {
		const content = AST_RULE.replace(
			/detect: ast\nast:\n(?: {2}.*\n)+/,
			'detect: judge\nconfirm: callCount\nfalsePositives:\n  - entry points\n'
		);
		const rule = parseRule(RULES_DIR, rulePath('any', 'futureproof', 'abstraction', 'x.md'), content);

		expect(rule).toMatchObject({
			detect: Detect.JUDGE,
			confirm: 'callCount',
			falsePositives: ['entry points'],
		});
	});
});
