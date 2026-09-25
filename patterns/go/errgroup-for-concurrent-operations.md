# Errgroup For Concurrent Operations

`errgroup` runs a set of goroutines, waits for all of them, returns the first error, and cancels the shared context when one fails.

```go
import "golang.org/x/sync/errgroup"

func (s *Service) ProcessAll(ctx context.Context, items []Item) error {
	g, ctx := errgroup.WithContext(ctx)
	for _, item := range items {
		g.Go(func() error {
			return s.process(ctx, item)
		})
	}

	return g.Wait()
}
```
