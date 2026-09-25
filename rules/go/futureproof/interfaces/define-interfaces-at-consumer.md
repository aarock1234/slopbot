---
severity: minor
detect: judge
falsePositives:
    - an interface a package exports for plugin authors to implement, where the package is the consumer
    - a widely shared interface in the style of io.Reader
    - a package that both defines and consumes the interface
---

## Why

An interface declared next to its implementation is shaped by what the implementation offers, not by what a caller needs, so it grows with the implementation and every consumer depends on the implementing package to use it. Declare the interface in the package that calls it, with only the methods that package uses; the implementing package exports a concrete type and satisfies the interface implicitly.

## Message

interface declared beside its implementation; define it where it is consumed

## Bad

```go
package postgres

// BAD: the implementation dictates the interface, so every consumer imports postgres
type Repository interface {
	Get(ctx context.Context, id string) (*Item, error)
	Save(ctx context.Context, item *Item) error
}

type Repo struct {
	db *sql.DB
}
```

## Good

```go
package service

type Repository interface {
	Get(ctx context.Context, id string) (*Item, error)
	Save(ctx context.Context, item *Item) error
}

type Service struct {
	repo Repository
}
```
