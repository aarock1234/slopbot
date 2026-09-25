import { extname } from 'node:path';

export const Lang = {
	TS: 'ts',
	GO: 'go',
} as const;

export type Lang = (typeof Lang)[keyof typeof Lang];

export const langValues = Object.values(Lang) as [Lang, ...Lang[]];

// a rule targets one language or both
export const RuleLang = {
	...Lang,
	ANY: 'any',
} as const;

export type RuleLang = (typeof RuleLang)[keyof typeof RuleLang];

export const ruleLangValues = Object.values(RuleLang) as [RuleLang, ...RuleLang[]];

const EXTENSION_LANGS: Readonly<Record<string, Lang>> = {
	'.ts': Lang.TS,
	'.tsx': Lang.TS,
	'.mts': Lang.TS,
	'.cts': Lang.TS,
	'.go': Lang.GO,
};

const FENCE_LANGS: Readonly<Record<string, Lang>> = {
	ts: Lang.TS,
	tsx: Lang.TS,
	typescript: Lang.TS,
	go: Lang.GO,
	golang: Lang.GO,
};

export function detectLang(path: string): Lang | undefined {
	return EXTENSION_LANGS[extname(path)];
}

// maps a markdown fence info string (```ts, ```go) to a language
export function fenceLang(info: string): Lang | undefined {
	return FENCE_LANGS[info.trim().toLowerCase()];
}

export function ruleAppliesTo(ruleLang: RuleLang, lang: Lang): boolean {
	return ruleLang === RuleLang.ANY || ruleLang === lang;
}
