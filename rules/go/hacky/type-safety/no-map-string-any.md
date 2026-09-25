---
severity: major
detect: ast
ignore:
    - "**/*_test.go"
ast:
    rule:
        any:
            - pattern: map[string]any
            - pattern: map[string]interface{}
---

## Why

A `map[string]any` pushes every field access to runtime with a type assertion and a nil check, and the compiler can no longer tell you when a field is renamed. Decode JSON and config into a struct. Tests are excluded: decoding a payload into a map to inspect it is the honest way to assert on wire format. If the shape is genuinely open, a generic constrained by an interface still beats a bag of `any`.

## Message

map[string]any defers every field to runtime; decode into a struct

## Bad

```go
func parse(raw []byte) error {
	// BAD: every access is an assertion waiting to fail
	var payload map[string]any

	return json.Unmarshal(raw, &payload)
}
```

## Good

```go
type Payload struct {
	UserID string `json:"user_id"`
	Amount int    `json:"amount"`
}

func parse(raw []byte) (Payload, error) {
	var payload Payload

	if err := json.Unmarshal(raw, &payload); err != nil {
		return Payload{}, fmt.Errorf("decoding payload: %w", err)
	}

	return payload, nil
}
```
