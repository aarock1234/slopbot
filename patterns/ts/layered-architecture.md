# Layered Architecture

**Repository Layer** (Data access)

**Service Layer** (Business logic)

**Controller/Handler Layer** (HTTP/transport)

## Example

```ts
type UserRepository = {
	findById(id: string): Promise<User | null>;
	save(user: User): Promise<void>;
};

// In production, add proper error handling
function createUserRepository(db: Database): UserRepository {
	return {
		async findById(id) {
			return db.user.findUnique({
				where: {
					id,
				},
			});
		},
		async save(user) {
			await db.user.upsert({
				where: {
					id: user.id,
				},
				create: user,
				update: user,
			});
		},
	};
}
```

```ts
class UserService {
	constructor(
		private readonly repo: UserRepository,
		private readonly logger: Logger
	) {}

	async getUser(id: string): Promise<User> {
		const user = await this.repo.findById(id);

		if (!user) {
			throw new NotFoundError(`user ${id}`);
		}

		return user;
	}
}
```

```ts
class UserController {
	constructor(
		private readonly service: UserService,
		private readonly logger: Logger
	) {}

	async getUser(req: Request, res: Response) {
		try {
			const user = await this.service.getUser(req.params.id);
			res.json(user);
		} catch (error: unknown) {
			if (error instanceof NotFoundError) {
				res.status(404).json({ error: 'not found' });
				return;
			}

			this.logger.error('get user failed', { error });
			res.status(500).json({ error: 'internal error' });
		}
	}
}
```
