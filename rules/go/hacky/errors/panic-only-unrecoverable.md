---
severity: major
detect: ast
ast:
    rule:
        kind: call_expression
        has:
            field: function
            regex: '^panic$'
        not:
            any:
                - inside:
                      kind: function_declaration
                      stopBy: end
                      has:
                          field: name
                          regex: '^(main|init|Must\w*)$'
                - inside:
                      kind: default_case
                      stopBy: end
ignore:
    - '**/*_test.go'
---

## Why

A panic in library code turns an operational failure such as a missing row or a bad input into a process crash that the caller cannot handle. Panics belong to genuinely unrecoverable situations: `init` setup that cannot proceed, `Must` helpers that document the contract in their name, and impossible states after exhaustive handling. Everything else returns an error.

## Message

panic in library code; return an error and let the caller decide

## Bad

```go
func (s *Store) Get(id string) *Item {
	item, ok := s.items[id]
	if !ok {
		// BAD: a missing row is an operational error, not a violated invariant
		panic("item not found")
	}

	return item
}
```

## Good

```go
func (s *Store) Get(id string) (*Item, error) {
	item, ok := s.items[id]
	if !ok {
		return nil, fmt.Errorf("item %s: %w", id, ErrNotFound)
	}

	return item, nil
}
```

```go
func init() {
	if err := setupTransport(); err != nil {
		panic(fmt.Sprintf("transport initialization failed: %v", err))
	}
}
```

```go
func label(status Status) string {
	switch status {
	case StatusActive, StatusPending:
		return string(status)
	default:
		panic(fmt.Sprintf("unhandled status: %v", status))
	}
}
```
