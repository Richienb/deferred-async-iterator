# deferred-async-iterator

Create a deferred async iterator.

## Install

```sh
npm install deferred-async-iterator
```

## Usage

```js
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

## API

### createDeferredAsyncIterator()

#### Return value

##### iterator

Type: `AsyncIterator`

##### onCleanup

A promise that resolves when `.complete()` or `.return()` is called, or when `break` is called within a [`for await...of`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) loop.

##### next(value)

Provide the next value to the iterator. Returns a promise that resolves when the value is consumed.

##### nextError(error)

Provide an error to the iterator. Returns a promise that resolves when the error is consumed.

##### complete()

Provide a "done" value to the iterator which causes a [`for await...of`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) loop to exit after all previous values have been iterated over. Any callback that was provided to `onCleanup` will be called. Returns a promise that resolves when all remaining values have been consumed.

