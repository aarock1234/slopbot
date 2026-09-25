import { z } from 'zod';

// one violation of one rule at one place. `quote` is verbatim source so a reader can find it and so judge
// findings can be checked against the file. `symbol` is a judge nomination for a confirm predicate.
export const findingSchema = z.object({
	ruleId: z.string(),
	path: z.string(),
	line: z.number().int().positive(),
	endLine: z.number().int().positive(),
	quote: z.string(),
	message: z.string(),
	confidence: z.number().min(0).max(1),
	symbol: z.string().optional(),
});

export type Finding = z.infer<typeof findingSchema>;

// a stable order for reports and snapshots: by file, then line, then rule
export function compareFindings(a: Finding, b: Finding): number {
	return a.path.localeCompare(b.path) || a.line - b.line || a.ruleId.localeCompare(b.ruleId);
}
