# Parallel Operations

## Example

```ts
// Parallel fetch
async function fetchUserData(userId: string) {
	const [user, posts, followers] = await Promise.all([
		getUser(userId),
		getUserPosts(userId),
		getUserFollowers(userId),
	]);

	return { user, posts, followers };
}

// Per-operation error handling
async function fetchUserDataSafe(userId: string) {
	const results = await Promise.allSettled([getUser(userId), getUserPosts(userId), getUserFollowers(userId)]);

	const [userResult, postsResult, followersResult] = results;

	return {
		user: userResult.status === 'fulfilled' ? userResult.value : null,
		posts: postsResult.status === 'fulfilled' ? postsResult.value : [],
		followers: followersResult.status === 'fulfilled' ? followersResult.value : [],
	};
}
```
