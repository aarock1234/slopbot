export function findUser(users: User[], id: string): User | undefined {
	return users.find(user => user.id === id);
}

// ----------------------------------------
export default function loadUser(raw: any): string {
	const user = findUser(parse(raw), raw.id)!;
	const label = user.count === 0 ? 'none' : user.count === 1 ? 'one' : 'many';
	try {
		save(user);
	} catch {}
	return label;
}
