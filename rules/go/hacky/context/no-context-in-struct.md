---
severity: major
detect: ast
ast:
    rule:
        kind: field_declaration
        has:
            field: type
            regex: '^context\.Context$'
---

## Why

A context stored in a struct is captured once at construction and then reused by every method call, so cancellation and deadlines belong to the wrong request and the value never expires. Contexts are per call: pass `ctx` as the first parameter of each method that needs it.

## Message

context stored in a struct outlives the request it belongs to; pass ctx per call

## Bad

```go
type Service struct {
	// BAD: captured once, reused by every call
	ctx  context.Context
	repo Repository
}

func (s *Service) Get(id string) (*Item, error) {
	return s.repo.Get(s.ctx, id)
}
```

## Good

```go
type Service struct {
	repo Repository
}

func (s *Service) Get(ctx context.Context, id string) (*Item, error) {
	return s.repo.Get(ctx, id)
}
```
