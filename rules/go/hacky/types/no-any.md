---
severity: major
detect: ast
ast:
    rule:
        any:
            - kind: type_identifier
              regex: '^any$'
            - kind: interface_type
              regex: '^interface\s*\{\s*\}$'
        not:
            any:
                - inside:
                      kind: type_constraint
                - inside:
                      kind: variadic_parameter_declaration
                - inside:
                      kind: map_type
                      regex: '^map\[(string|any|interface\{\})\]'
---

## Why

A parameter, field, or return typed `any` pushes every use to a runtime assertion and hides the real shape from the compiler and the reader. Prefer a concrete type, then a type parameter with a constraint, then a small interface; `any` is the last resort for genuinely dynamic data. Type constraints (`[T any]`) and printf-style `...any` variadics are not flagged; maps of `any` are covered by their own rules.

## Message

any erases the type; use a concrete type, a type parameter, or a small interface

## Bad

```go
// BAD: any erases the type and every caller pays with assertions
func Process(data any) any {
	return data
}
```

```go
type Event struct {
	// BAD: payload has no shape the compiler can check
	Payload interface{}
}
```

## Good

```go
type Sizer interface {
	Size() int
}

func Largest[T Sizer](items []T) (T, bool) {
	var zero T
	if len(items) == 0 {
		return zero, false
	}

	return items[0], true
}
```

```go
type Event struct {
	Payload Payload
}

func Logf(format string, args ...any) {
	slog.Info(fmt.Sprintf(format, args...))
}
```
