import test from 'ava';
import pDefer from 'p-defer';
import createDeferredAsyncIterator from './index.js';

function createDeferredCallback() {
	const callbacks = new Set();

	return {
		nextValue(value) {
			for (const callback of callbacks) {
				callback(value);
			}
		},
		onValue(callback) {
			callbacks.add(callback);
		},
	};
}

function toAsyncIterable(iterator) {
	return {
		[Symbol.asyncIterator]() {
			return iterator;
		},
	};
}

test('main', async t => {
	const {nextValue, onValue} = createDeferredCallback();

	const {next, complete, onCleanup, iterator} = createDeferredAsyncIterator();

	onValue(next);

	nextValue(1);
	nextValue(2);

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
	const {nextValue, onValue} = createDeferredCallback();

	const {next, complete, iterator} = createDeferredAsyncIterator();

	onValue(next);

	setImmediate(() => {
		nextValue(1);
		nextValue(2);
		complete();
	});

	const values = [];

	for await (const value of toAsyncIterable(iterator)) {
		values.push(value);
	}

	t.deepEqual(values, [1, 2]);
});

test('for await...of syntax with breaking', async t => {
	const {nextValue, onValue} = createDeferredCallback();

	const {next, iterator} = createDeferredAsyncIterator();

	onValue(next);

	setImmediate(() => {
		nextValue(1);
		nextValue(2);
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
