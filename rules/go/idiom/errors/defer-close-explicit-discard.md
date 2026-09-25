---
severity: minor
detect: ast
ast:
    rule:
        kind: defer_statement
        has:
            kind: call_expression
            has:
                field: function
                regex: '\.Close$'
---

## Why

A bare `defer f.Close()` drops the returned error without saying so, which is also what `errcheck` flags. For read-only resources the error is not actionable, so discard it explicitly with `_ =` to record that decision; for anything that was written to, check the error, because a failed close can mean the data never reached disk.

## Message

bare defer Close ignores its error silently; discard it with _ = or check it

## Bad

```go
func fetch(url string) error {
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	// BAD: close error dropped without saying so
	defer resp.Body.Close()

	return nil
}
```

## Good

```go
func fetch(url string) error {
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer func() { _ = resp.Body.Close() }()

	return nil
}
```

```go
func write(path string) error {
	f, err := os.Create(path)
	if err != nil {
		return err
	}
	defer func() {
		if err := f.Close(); err != nil {
			slog.Error("closing output file", "error", err)
		}
	}()

	return nil
}
```
