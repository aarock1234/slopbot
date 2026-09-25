---
severity: major
detect: ast
ast:
    rule:
        kind: call_expression
        all:
            - has:
                  field: function
                  regex: '^fmt\.Errorf$'
            - has:
                  field: arguments
                  all:
                      - has:
                            kind: interpreted_string_literal
                            regex: '%[vs]'
                            not:
                                regex: '%w'
                      - has:
                            regex: '^err(\.Error\(\))?$'
---

## Why

Formatting an error with `%v` or `%s` flattens it to text, so `errors.Is` and `errors.As` upstream can no longer see the sentinel or type underneath. The wrap looks identical at a glance and the breakage only appears when a caller starts matching on the cause. Use `%w` for the error argument so the chain survives.

## Message

fmt.Errorf with %v drops the error chain; wrap with %w

## Bad

```go
func load(path string) error {
	if err := read(path); err != nil {
		// BAD: %v flattens err so errors.Is stops working upstream
		return fmt.Errorf("reading %s: %v", path, err)
	}

	return nil
}
```

```go
func load(path string) error {
	if err := read(path); err != nil {
		// BAD: err.Error() flattens the chain to a string
		return fmt.Errorf("reading %s: %s", path, err.Error())
	}

	return nil
}
```

## Good

```go
func load(path string) error {
	if err := read(path); err != nil {
		return fmt.Errorf("reading %s: %w", path, err)
	}

	return nil
}
```

```go
func check(code int) error {
	return fmt.Errorf("unexpected status %d", code)
}
```
