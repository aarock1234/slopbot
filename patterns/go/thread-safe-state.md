# Thread-Safe State

Guard mutable state with a mutex declared next to the fields it protects. Generic containers keep the element type without `any`.

```go
type Cycle[T any] struct {
	items []T
	index int
	mu    sync.Mutex
}

func (c *Cycle[T]) Next() (T, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()

	if len(c.items) == 0 {
		var zero T
		return zero, false
	}

	item := c.items[c.index]
	c.index = (c.index + 1) % len(c.items)

	return item, true
}
```
