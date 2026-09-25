# Layered Architecture

Three layers, each depending only on the one below it through a small interface.

## Repository layer (data access)

```go
type Repository interface {
	Get(ctx context.Context, id string) (*Item, error)
	Save(ctx context.Context, item *Item) error
}

type PgRepo struct {
	db     *sql.DB
	logger *slog.Logger
}

func New(db *sql.DB, logger *slog.Logger) *PgRepo {
	return &PgRepo{
		db:     db,
		logger: logger,
	}
}
```

## Service layer (business logic)

```go
type Service struct {
	repo   Repository
	logger *slog.Logger
}

func New(repo Repository, logger *slog.Logger) *Service {
	return &Service{
		repo:   repo,
		logger: logger,
	}
}

func (s *Service) Process(ctx context.Context, id string) error {
	item, err := s.repo.Get(ctx, id)
	if err != nil {
		return fmt.Errorf("get item: %w", err)
	}

	// business logic here

	return s.repo.Save(ctx, item)
}
```

## Handler layer (HTTP/transport)

```go
type Handler struct {
	service *Service
	logger  *slog.Logger
}

func New(service *Service, logger *slog.Logger) *Handler {
	return &Handler{
		service: service,
		logger:  logger,
	}
}

func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	item, err := h.service.Get(r.Context(), id)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			http.Error(w, "not found", http.StatusNotFound)
			return
		}
		h.logger.Error("get failed", "error", err)
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(item); err != nil {
		h.logger.Error("encode response", "error", err)
	}
}
```
