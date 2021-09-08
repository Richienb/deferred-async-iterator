# deferred-async-iterator

Create a deferred async iterator.

## Install

```sh
npm install deferred-async-iterator
```

## Usage

```js
import createDeferredAsyncIterator from 'deferred-async-iterator';

const {next, iterator} = createDeferredAsyncIterator();

callbackFunction(next);

for await (const value of iterator) {
	console.log(value);
}
```

## API

### createDeferredAsyncIterator()

#### Return value

##### iterator

Type: `AsyncIterator`

##### next()

Provide the next value to the iterator.

##### complete()

Stop any further iterations of the iterator. Any callback that was provided to `onCleanup` will be called.

##### onCleanup(callback)

Provide a `callback` that will be called when `.complete()` or `.return()` is called, or when `break` is called within a [`for await...of`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) loop.

##### onError(callback)

Provide a `callback` that will be called with an error as its first argument before it is thrown. If a callback returns `false`, the error will not be thrown.
