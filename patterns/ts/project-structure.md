# Project Structure

Guidelines:

- No `index.ts` barrel files; import directly from source
- No `types.ts` files; co-locate types with the code that uses them
- Zod schemas live where they're used
- Export inline at the declaration site

## API/Server

```
src/
├── routes/
├── services/
├── repositories/
├── middleware/
├── lib/
├── config.ts
└── main.ts
```

## Library/Package

```
src/
├── core/
├── utils/
├── lib.ts
└── main.ts
```

## CLI Tool

```
src/
├── commands/
├── utils/
├── config.ts
└── main.ts
```

## Worker/Job Processor

```
src/
├── jobs/
├── processors/
├── queues/
├── lib/
└── main.ts
```
