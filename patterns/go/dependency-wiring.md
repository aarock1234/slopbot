# Dependency Wiring

Prefer manual wiring. Keep it explicit in `main.go`. Extract the body into a `run()` function that returns an error so that `defer` statements execute on all exit paths. Reserve `os.Exit` for the top-level `main()`.

```go
func main() {
	if err := run(); err != nil {
		slog.Error("fatal error", "error", err)
		os.Exit(1)
	}
}

func run() error {
	logger := slog.Default()

	db, err := sql.Open("postgres", os.Getenv("DATABASE_URL"))
	if err != nil {
		return fmt.Errorf("open database: %w", err)
	}
	defer func() { _ = db.Close() }()

	repo := repository.New(db, logger)
	service := service.New(repo, logger)
	handler := handler.New(service, logger)

	mux := http.NewServeMux()
	mux.HandleFunc("GET /items/{id}", handler.Get)
	mux.HandleFunc("POST /items", handler.Create)

	server := &http.Server{
		Addr:         ":8080",
		Handler:      mux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	logger.Info("server starting", "port", "8080")
	if err := server.ListenAndServe(); err != nil {
		return fmt.Errorf("server: %w", err)
	}

	return nil
}
```
