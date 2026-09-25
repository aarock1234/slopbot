---
severity: minor
detect: ast
ast:
    ts:
        rule:
            kind: comment
            regex: '^(//|/\*+)[\s*]*(TODO|FIXME|HACK|XXX)\b'
    go:
        rule:
            kind: comment
            regex: '^(//|/\*+)[\s*]*(TODO|FIXME|HACK|XXX)\b'
---

## Why

A TODO in merged code is a known defect with no owner, no deadline, and no ticket, and it stays there until someone rediscovers the problem the hard way. Either do the work before merging, or open an issue and reference it so the gap is tracked where people actually look. A comment that explains a deliberate limitation and points at the issue is fine; a bare marker is not.

## Message

todo marker shipped in code; do the work or link the tracking issue

## Bad

```ts
export function parsePrice(raw: string): number {
	// BAD: known gap with no owner
	// TODO: handle currencies other than USD
	return Number(raw.replace('$', ''));
}
```

```go
func ParsePrice(raw string) (int, error) {
	// BAD: known shortcut with no owner
	// FIXME: this breaks on prices over 1000
	return strconv.Atoi(strings.TrimPrefix(raw, "$"))
}
```

## Good

```ts
// only USD is supported; other currencies are rejected upstream by the validator (see #482)
export function parsePrice(raw: string): number {
	return Number(raw.replace('$', ''));
}
```

```go
// ParsePrice accepts USD only; other currencies are rejected by the validator (see #482).
func ParsePrice(raw string) (int, error) {
	return strconv.Atoi(strings.TrimPrefix(raw, "$"))
}
```
