# Template Literal Types

Type-safe string patterns.

## Example

```ts
// Type-safe event names
type EventName = `on${Capitalize<'click' | 'focus' | 'blur'>}`;
// "onClick" | "onFocus" | "onBlur"

// Type-safe CSS properties
type CssUnit = 'px' | 'rem' | 'em' | '%';
type CssValue = `${number}${CssUnit}`;
// "10px", "1.5rem", etc.

// Type-safe route params
type RouteParam<T extends string> = T extends `${string}:${infer Param}/${infer Rest}`
	? Param | RouteParam<Rest>
	: T extends `${string}:${infer Param}`
		? Param
		: never;

type UserRouteParams = RouteParam<'/users/:userId/posts/:postId'>;
// "userId" | "postId"

// Type-safe object paths
type PathKeys<T, Prefix extends string = ''> = T extends object
	? {
			[K in keyof T & string]: T[K] extends object ? PathKeys<T[K], `${Prefix}${K}.`> : `${Prefix}${K}`;
		}[keyof T & string]
	: never;

type User = {
	name: string;
	address: {
		city: string;
		zip: string;
	};
};
type UserPaths = PathKeys<User>; // "name" | "address.city" | "address.zip"
```
