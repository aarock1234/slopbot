# Interface Composition

Keep interfaces small and compose them where a consumer needs more than one capability.

```go
type Reader interface {
	Read(ctx context.Context, id string) ([]byte, error)
}

type Writer interface {
	Write(ctx context.Context, id string, data []byte) error
}

// Compose interfaces
type ReadWriter interface {
	Reader
	Writer
}

type Storage struct {
	rw ReadWriter // accepts composed interface
}
```
