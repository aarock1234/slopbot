---
severity: minor
detect: ast
ast:
    rule:
        any:
            - kind: function_declaration
              has:
                  field: name
                  regex: '^[A-Z]'
            - kind: method_declaration
              has:
                  field: name
                  regex: '^[A-Z]'
            - kind: type_declaration
              inside:
                  kind: source_file
              has:
                  kind: type_spec
                  has:
                      field: name
                      regex: '^[A-Z]'
        not:
            follows:
                kind: comment
ignore:
    - '**/*_test.go'
    - '**/*.pb.go'
    - '**/*_gen.go'
---

## Why

An exported name is the package's contract, and its doc comment is what `go doc` and every editor show at the call site. Without one the reader opens the source to learn what the function promises, and the omission tends to spread to the next export. One sentence starting with the name is enough.

## Message

exported declaration has no doc comment

## Bad

```go
// BAD: exported function with no doc comment
func Process(ctx context.Context, item Item) error {
	return nil
}
```

```go
// BAD: exported type with no doc comment
type Service struct {
	repo Repository
}
```

```go
// BAD: exported method with no doc comment
func (s *Service) Process(ctx context.Context, item Item) error {
	return nil
}
```

## Good

```go
// Process validates and persists item.
func Process(ctx context.Context, item Item) error {
	return nil
}
```

```go
// Service processes items according to business rules.
type Service struct {
	repo Repository
}

func (s *Service) process(ctx context.Context, item Item) error {
	return nil
}
```
