---
severity: minor
detect: ast
ast:
    rule:
        any:
            - pattern:
                  context: 'func f() { errors.New($MSG) }'
                  selector: call_expression
            - pattern:
                  context: 'func f() { fmt.Errorf($MSG, $$$ARGS) }'
                  selector: call_expression
    constraints:
        MSG:
            regex: '^"[A-Z]'
---

## Why

Error messages get wrapped: `reading config: opening file: permission denied`. A capitalized fragment in the middle of that chain reads wrong, and trailing punctuation doubles up. Error strings are lowercase fragments without a final period.

## Message

error strings are lowercase fragments so they read well when wrapped

## Bad

```go
func load(path string) error {
	// BAD: capitalized message
	return errors.New("Config file is missing")
}
```

```go
func load(path string) error {
	// BAD: capitalized wrapped message
	return fmt.Errorf("Reading %s: %w", path, err)
}
```

## Good

```go
func load(path string) error {
	return fmt.Errorf("reading %s: %w", path, err)
}
```

```go
var ErrMissingConfig = errors.New("config file is missing")
```
