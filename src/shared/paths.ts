import { resolve } from 'node:path';

// src/shared and dist/shared sit at the same depth, so the package root is two levels up either way.
export const PACKAGE_ROOT = resolve(import.meta.dirname, '..', '..');

export const RULES_DIR = resolve(PACKAGE_ROOT, 'rules');
export const PROMPTS_DIR = resolve(PACKAGE_ROOT, 'prompts');
