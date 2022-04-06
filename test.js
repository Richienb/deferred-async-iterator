import {test} from 'uvu';
import {equal, is} from 'uvu/assert'; // eslint-disable-line node/file-extension-in-import
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

test('main', async () => {
	const {next, complete, onCleanup, iterator} = createDeferredAsyncIterator();

	next(1);
	next(2);

	equal(await iterator.next(), {
		done: false,
		value: 1,
	});
	equal(await iterator.next(), {
		done: false,
		value: 2,
	});

	const {promise: cleanupPromise, resolve} = pDefer();

	onCleanup(resolve);

	setImmediate(() => {
		complete();
	});

	equal(await iterator.next(), {
		done: true,
	});

	await cleanupPromise;
});

test('for await...of syntax with .complete()', async () => {
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

	equal(values, [1, 2]);
});

test('for await...of syntax with breaking', async () => {
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

	equal(values, [1, 2]);
});

test('Promise resolves when value is consumed', async () => {
	const {next, iterator} = createDeferredAsyncIterator();
	const promise = next(1);

	is(await promiseState(promise), 'pending');

	const {value} = await iterator.next();

	is(value, 1);

	await promise;
});

test.run();
