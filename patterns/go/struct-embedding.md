# Struct Embedding

For shared behavior across implementations, embed a base struct so its methods are promoted onto the outer type.

```go
type BaseProcessor struct {
	logger *slog.Logger
	config Config
}

func (b *BaseProcessor) Validate(input Input) error {
	if input.ID == "" {
		return errors.New("input id required")
	}

	return nil
}

type PDFProcessor struct {
	BaseProcessor // promotes Validate method
	pdfConfig     PDFConfig
}

func (p *PDFProcessor) Process(input Input) error {
	if err := p.Validate(input); err != nil {
		return err
	}
	// PDF-specific logic

	return nil
}
```

Note: if `PDFProcessor` later defines its own `Validate` method, it silently shadows `BaseProcessor.Validate`.
