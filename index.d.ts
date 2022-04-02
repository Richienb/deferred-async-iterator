/**
Create a deferred async iterator.

@example
```
import createDeferredAsyncIterator from 'deferred-async-iterator';

const iterable = {
	[Symbol.asyncIterator]() {
		const {next, iterator} = createDeferredAsyncIterator();

		callbackFunction(next);

		return iterator;
	}
}

for await (const value of iterable) {
	console.log(value);
}
```
*/
export default function createDeferredAsyncIterator<NextValueType = unknown, ReturnValueType = NextValueType>(): {
	iterator: AsyncIterator<NextValueType, ReturnValueType, NextValueType>;

	/**
	Provide the next value to the iterator.
	*/
	next(value?: NextValueType): void;

	/**
	Provide a "done" value to the iterator which causes a [`for await...of`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) loop to exit after all previous values have been iterated over. Any callback that was provided to `onCleanup` will be called.
	*/
	complete(): void;

	/**
	Provide a `callback` that will be called when `.complete()` or `.return()` is called, or when `break` is called within a [`for await...of`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) loop.
	*/
	onCleanup(callback: () => unknown): void;
};
