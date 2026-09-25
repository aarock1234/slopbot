import { isIgnored } from './change.js';
import type { Change } from './change.js';
import { compareFindings } from './finding.js';
import type { Finding } from './finding.js';
import { ruleAppliesTo } from './lang.js';
import type { Rule } from './rule.js';
import { mapConcurrent } from './shared/concurrency.js';

// the one contract every detection strategy implements: given a changed file and the rules that apply to it,
// return findings. the ast analyzer and the judge are the two implementations.
export type Analyzer = (change: Change, rules: readonly Rule[]) => Promise<Finding[]>;

export async function collectFindings(
	changes: readonly Change[],
	rules: readonly Rule[],
	analyzers: readonly Analyzer[]
): Promise<Finding[]> {
	const perChange = await mapConcurrent(changes, async change => {
		const applicable = rules.filter(
			rule => ruleAppliesTo(rule.lang, change.lang) && !isIgnored(change.path, rule.ignore)
		);
		const results = await Promise.all(analyzers.map(analyzer => analyzer(change, applicable)));

		return results.flat();
	});

	return perChange.flat().sort(compareFindings);
}
