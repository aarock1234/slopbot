# Utility Types

Built-in utility types for transforming existing types.

## Example

```ts
type User = {
	id: string;
	name: string;
	email: string;
	role: 'admin' | 'user';
	createdAt: Date;
};

// Property modifiers
type UserUpdate = Partial<User>; // all properties optional
type RequiredUser = Required<Partial<User>>; // all properties required
type ImmutableUser = Readonly<User>; // all properties readonly

// Property selection
type UserPreview = Pick<User, 'id' | 'name'>; // select specific properties
type CreateUser = Omit<User, 'id' | 'createdAt'>; // exclude specific properties

// Object construction
type UserMap = Record<string, User>; // object with keys K and values V
type RolePermissions = Record<User['role'], string[]>;

// Union manipulation
type StringOrNumber = string | number | boolean;
type OnlyStrNum = Extract<StringOrNumber, string | number>; // extract types assignable to U
type NotBoolean = Exclude<StringOrNumber, boolean>; // remove types assignable to U
type MaybeUser = User | null | undefined;
type DefiniteUser = NonNullable<MaybeUser>; // remove null and undefined

// Function introspection
function createUser(name: string): User {
	return { id: '1', name, email: '', role: 'user', createdAt: new Date() };
}
type CreatedUser = ReturnType<typeof createUser>; // get return type of function
type CreateUserParams = Parameters<typeof createUser>; // get parameter types as tuple

// Promise unwrapping
type UserPromise = Promise<User>;
type ResolvedUser = Awaited<UserPromise>; // unwrap Promise type
```
