import test from 'ava';
import pDefer from 'p-defer';
import {promiseStateAsync as promiseState} from 'p-state';
import createDeferredAsyncIterator from './index.js';

function toAsyncIterable(iterator) {
	return {
		[Symbol.asyncIterator]() {
			return iterator;
		},
	};
}

test('main', async t => {
	const {next, complete, onCleanup, iterator} = createDeferredAsyncIterator();

	next(1);
	next(2);

	t.deepEqual(await iterator.next(), {
		done: false,
		value: 1,
	});
	t.deepEqual(await iterator.next(), {
		done: false,
		value: 2,
	});

	const {promise: cleanupPromise, resolve} = pDefer();

	onCleanup(resolve);

	setImmediate(() => {
		complete();
	});

	t.deepEqual(await iterator.next(), {
		done: true,
	});

	await cleanupPromise;
});

test('for await...of syntax with .complete()', async t => {
	const {next, complete, iterator} = createDeferredAsyncIterator();

	setImmediate(() => {
		next(1);
		next(2);
		complete();
	});

	const values = [];

	for await (const value of toAsyncIterable(iterator)) {
		values.push(value);
	}

	t.deepEqual(values, [1, 2]);
});

test('for await...of syntax with breaking', async t => {
	const {next, iterator} = createDeferredAsyncIterator();

	setImmediate(() => {
		next(1);
		next(2);
	});

	const values = [];

	for await (const value of toAsyncIterable(iterator)) {
		values.push(value);

		if (values.length === 2) {
			break;
		}
	}

	t.deepEqual(values, [1, 2]);
});

test('Promise resolves when value is consumed', async t => {
	const {next, iterator} = createDeferredAsyncIterator();
	const promise = next(1);

	t.is(await promiseState(promise), 'pending');

	const {value} = await iterator.next();

	t.is(value, 1);

	await promise;
});

test('nextError', async t => {
	const {nextError, iterator} = createDeferredAsyncIterator();

	nextError(new Error('foo'));

	await t.throwsAsync(iterator.next, {
		instanceOf: Error,
		message: 'foo',
	});
});
