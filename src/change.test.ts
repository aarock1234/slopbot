import { describe, expect, it } from 'vitest';

import { isIgnored, parseDiff } from './change.js';

const DIFF = `diff --git a/src/a.ts b/src/a.ts
index 1111111..2222222 100644
--- a/src/a.ts
+++ b/src/a.ts
@@ -3 +3 @@ header text
-old
+new
@@ -10,0 +11,3 @@
+added one
+added two
+added three
@@ -20,2 +24,0 @@
-removed
-removed
diff --git a/old.go b/pkg/new.go
similarity index 90%
rename from old.go
rename to pkg/new.go
--- a/old.go
+++ b/pkg/new.go
@@ -1 +1 @@
-package old
+package pkg
diff --git a/gone.ts b/gone.ts
deleted file mode 100644
--- a/gone.ts
+++ /dev/null
@@ -1,2 +0,0 @@
-a
-b
`;

describe('parseDiff', () => {
	it('maps zero-context hunks to added lines in the new file', () => {
		const files = parseDiff(DIFF);

		expect(files).toEqual([
			{ path: 'src/a.ts', addedLines: [3, 11, 12, 13] },
			{ path: 'pkg/new.go', addedLines: [1] },
		]);
	});

	it('ignores pure deletions', () => {
		expect(parseDiff(DIFF).map(file => file.path)).not.toContain('gone.ts');
	});

	it('returns nothing for an empty diff', () => {
		expect(parseDiff('')).toEqual([]);
	});
});

describe('isIgnored', () => {
	it('matches nested paths against double-star globs', () => {
		expect(isIgnored('src/deep/a.test.ts', ['**/*.test.ts'])).toBe(true);
		expect(isIgnored('src/deep/a.ts', ['**/*.test.ts'])).toBe(false);
		expect(isIgnored('packages/x/dist/out.js', ['**/dist/**'])).toBe(true);
	});
});
