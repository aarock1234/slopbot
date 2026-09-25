# Functional Options

For complex configuration, expose an `Option` closure type and a variadic constructor. Callers only override what they need; the constructor sets sensible defaults first.

```go
type Option func(*Service)

func WithTimeout(d time.Duration) Option {
	return func(s *Service) { s.timeout = d }
}

func New(repo Repository, opts ...Option) *Service {
	s := &Service{
		repo:    repo,
		timeout: 10 * time.Second,
	}
	for _, opt := range opts {
		opt(s)
	}

	return s
}

// Usage
svc := New(repo, WithTimeout(5*time.Second))
```
