export function findUser(users: User[], id: string): User | undefined {
	return users.find(user => user.id === id);
}
