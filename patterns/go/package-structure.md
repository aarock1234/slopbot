# Package Structure

`pkg/` is the default for all project packages. Only use `internal/` when the module is published for external consumers; this will be explicitly communicated.

```
project/
├── cmd/
│   └── server/
│       └── main.go        # entrypoint
└── pkg/
    ├── handler/            # HTTP handlers
    ├── service/            # business logic
    ├── repository/         # data access
    ├── model/              # shared types
    └── log/                # side-effect init
```
