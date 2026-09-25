# Worker Pool

A bounded number of workers drain a task channel; a producer goroutine feeds it and closes it when done or when the context is cancelled.

```go
func (s *Service) ProcessBatch(ctx context.Context, items []Item) error {
	const concurrency = 10
	taskCh := make(chan Item, concurrency*2)
	var wg sync.WaitGroup

	// Start workers
	for i := 0; i < concurrency; i++ {
		wg.Go(func() {
			for item := range taskCh {
				if err := s.process(ctx, item); err != nil {
					s.logger.Error("process failed", "error", err)
				}
			}
		})
	}

	// Send work
	go func() {
		defer close(taskCh)
		for _, item := range items {
			select {
			case <-ctx.Done():
				return
			case taskCh <- item:
			}
		}
	}()

	wg.Wait()

	return ctx.Err()
}
```

Note: individual item errors are logged, not returned. For operations where errors must be collected, prefer `errgroup` or aggregate into a slice.
