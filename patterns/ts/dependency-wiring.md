# Dependency Wiring

Keep it explicit in the entrypoint.

## Example

```ts
import { createLogger } from './lib/logger';
import { createDatabase } from './lib/database';
import { createUserRepository } from './modules/users/user.repository';
import { UserService } from './modules/users/user.service';
import { UserController } from './modules/users/user.controller';

async function main() {
	const logger = createLogger();
	const db = await createDatabase();

	const userRepo = createUserRepository(db);
	const userService = new UserService(userRepo, logger);
	const userController = new UserController(userService, logger);

	const app = createApp();
	app.get('/users/:id', (req, res) => userController.getUser(req, res));
	app.post('/users', (req, res) => userController.createUser(req, res));

	app.listen(3000, () => {
		logger.info('server started', { port: 3000 });
	});
}

main().catch(error => {
	console.error(error);
	process.exit(1);
});
```
