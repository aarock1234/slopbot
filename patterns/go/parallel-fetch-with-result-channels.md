# Parallel Fetch With Result Channels

Two independent fetches run concurrently, each reporting on its own buffered channel; a `select` loop collects both.

```go
func (s *Service) FetchBoth(ctx context.Context, id string) (*Data, error) {
	type result struct {
		data *Response
		err  error
	}

	ch1 := make(chan result, 1)
	ch2 := make(chan result, 1)

	go func() {
		data, err := s.fetchOne(id)
		ch1 <- result{data, err}
	}()

	go func() {
		data, err := s.fetchTwo(id)
		ch2 <- result{data, err}
	}()

	var r1, r2 *Response
	for range 2 {
		select {
		case res := <-ch1:
			if res.err != nil {
				return nil, res.err
			}
			r1 = res.data
		case res := <-ch2:
			if res.err != nil {
				return nil, res.err
			}
			r2 = res.data
		}
	}

	return &Data{
		One: *r1,
		Two: *r2,
	}, nil
}
```

For simple parallel fetches like this, `errgroup` is often cleaner.
