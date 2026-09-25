# Conditional Types And Infer

Extract types within conditional type expressions.

## Example

```ts
// Extract array element type
type ArrayElement<T> = T extends (infer U)[] ? U : never;
type Item = ArrayElement<string[]>; // string

// Extract promise result type
type Unwrap<T> = T extends Promise<infer U> ? U : T;
type Result = Unwrap<Promise<User>>; // User

// Extract function return type (how ReturnType works)
type Return<T> = T extends (...args: any[]) => infer R ? R : never;

// Extract first argument type
type FirstArg<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;
type Arg = FirstArg<(name: string, age: number) => void>; // string

// Extract object value types
type ValueOf<T> = T extends Record<string, infer V> ? V : never;
type Values = ValueOf<{ a: string; b: number }>; // string | number

// Practical: extract props from React component
type PropsOf<T> = T extends (props: infer P) => any ? P : never;
```
