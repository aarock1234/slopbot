import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { PROMPTS_DIR } from './paths.js';

const DIRECTIVE_PATTERN = /\{\{([A-Z][A-Z0-9_]*)\}\}/g;

type PromptVars = Record<string, string>;

const templateCache = new Map<string, string>();

function readTemplate(name: string): string {
	const cached = templateCache.get(name);

	if (cached !== undefined) {
		return cached;
	}

	const content = readFileSync(join(PROMPTS_DIR, `${name}.md`), 'utf-8');
	templateCache.set(name, content);

	return content;
}

// loads prompts/{name}.md and resolves {{DIRECTIVE}} placeholders.
// throws on unresolved directives and on unused variables so drift is caught at the call site.
export function loadPrompt(name: string, vars: PromptVars = {}): string {
	const template = readTemplate(name);
	const usedVars = new Set<string>();

	const content = template.replace(DIRECTIVE_PATTERN, (_match, key: string) => {
		const value = vars[key];

		if (value === undefined) {
			throw new Error(`unresolved directive {{${key}}} in prompt "${name}"`);
		}

		usedVars.add(key);

		return value;
	});

	const unusedVars = Object.keys(vars).filter(key => !usedVars.has(key));

	if (unusedVars.length > 0) {
		throw new Error(`unused vars passed to prompt "${name}": ${unusedVars.join(', ')}`);
	}

	return content;
}
