import { collectFindings } from './analyzer.js';
import type { Analyzer } from './analyzer.js';
import { astAnalyzer } from './analyzers/ast.js';
import type { Judge } from './analyzers/judge.js';
import { readChanges } from './change.js';
import type { Range } from './change.js';
import type { Config } from './config.js';
import { confirm } from './confirm.js';
import type { Finding } from './finding.js';
import type { Report } from './report.js';
import type { Rule } from './rule.js';
import { score } from './score.js';
import type { Scored } from './score.js';

export type ScanOptions = {
	repo: string;
	range: Range;
	config: Config;
	rules: readonly Rule[];
	// absent when running with --no-judge
	judge?: Judge;
	// an older ref to score as baseline..base, so the report can show the delta
	baseline?: string;
};

// the whole engine: read what changed, run every analyzer over it, confirm what needs confirming, score the rest.
export async function scan(options: ScanOptions): Promise<Report> {
	const { scored, rejected } = await scoreRange(options, options.range);

	const baseline =
		options.baseline === undefined
			? undefined
			: pickScore((await scoreRange(options, { base: options.baseline, head: options.range.base })).scored);

	return {
		...scored,
		...(baseline && { baseline }),
		...(options.judge && { judge: options.judge.summary() }),
		...(rejected.length > 0 && { rejected }),
	};
}

type RangeResult = {
	scored: Scored;
	rejected: Finding[];
};

async function scoreRange(options: ScanOptions, range: Range): Promise<RangeResult> {
	const enabled = options.rules.filter(rule => options.config.rules[rule.id] !== false);
	const analyzers: Analyzer[] = [astAnalyzer, ...(options.judge ? [options.judge.analyze] : [])];

	const changes = await readChanges(options.repo, range, options.config.ignore);
	const findings = await collectFindings(changes, enabled, analyzers);
	const { kept, rejected } = await confirm(findings, enabled, { repo: options.repo, ignore: options.config.ignore });

	return {
		scored: score(kept, changes, enabled, options.config.scoring),
		rejected,
	};
}

function pickScore({ overall, grade, axes }: Scored): Report['baseline'] {
	return { overall, grade, axes };
}
