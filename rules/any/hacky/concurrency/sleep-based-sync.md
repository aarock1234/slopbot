---
severity: major
detect: ast
ast:
    ts:
        rule:
            kind: new_expression
            pattern: new Promise($$$ARGS)
            has:
                pattern: setTimeout($$$TIMER)
                stopBy: end
    go:
        rule:
            pattern:
                context: 'func f() { time.Sleep($D) }'
                selector: call_expression
ignore:
    - '**/*.test.ts'
    - '**/*.spec.ts'
    - '**/*_test.go'
    - '**/main.go'
    - '**/cmd/**'
    - '**/e2e/**'
---

## Why

A fixed delay is a guess about how long something else takes, and the guess is wrong on a slow CI runner, a loaded server, or a faster machine that now waits for nothing. The code passes locally and fails intermittently elsewhere, which is the most expensive kind of bug to chase. Wait on the actual signal: a promise, a channel, a readiness check, or a context-aware timer for a real backoff.

## Message

fixed sleep used as synchronization; wait on a promise, channel, or readiness signal instead

## Bad

```ts
async function startWorker(worker: Worker): Promise<void> {
	worker.start();
	// BAD: hoping startup is done after two seconds
	await new Promise(resolve => setTimeout(resolve, 2000));
	worker.send(job);
}
```

```go
func startWorker(w *Worker) {
	go w.Run()
	// BAD: hoping the goroutine is ready after a fixed delay
	time.Sleep(500 * time.Millisecond)
	w.Send(job)
}
```

## Good

```ts
async function startWorker(worker: Worker): Promise<void> {
	await worker.start();
	worker.send(job);
}
```

```ts
import { once } from 'node:events';

async function startWorker(worker: Worker): Promise<void> {
	worker.start();
	await once(worker, 'ready');
	worker.send(job);
}
```

```go
func startWorker(w *Worker) {
	go w.Run()
	<-w.Ready()
	w.Send(job)
}
```

```go
func retry(ctx context.Context, delay time.Duration, attempt func() error) error {
	for {
		if err := attempt(); err == nil {
			return nil
		}

		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(delay):
		}
	}
}
```
