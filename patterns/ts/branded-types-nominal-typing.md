# Branded Types Nominal Typing

Prevent mixing up values that share the same base type.

## Example

```ts
// Problem: all IDs are strings, easy to mix up
function getUser(userId: string): Promise<User>;
function getPost(postId: string): Promise<Post>;

getUser(postId); // no error! but semantically wrong

// Solution: branded types
type Brand<T, B> = T & { readonly __brand: B };

type UserId = Brand<string, 'UserId'>;
type PostId = Brand<string, 'PostId'>;
type OrderId = Brand<string, 'OrderId'>;

// Constructor functions
function UserId(id: string): UserId {
	return id as UserId;
}

function PostId(id: string): PostId {
	return id as PostId;
}

// Now the compiler catches mistakes
function getUser(userId: UserId): Promise<User>;
function getPost(postId: PostId): Promise<Post>;

const userId = UserId('user-123');
const postId = PostId('post-456');

getUser(userId); // ok
getUser(postId); // error: PostId not assignable to UserId

// Works with Zod too
const UserIdSchema = z.string().uuid().transform(UserId);
const PostIdSchema = z.string().uuid().transform(PostId);
```
