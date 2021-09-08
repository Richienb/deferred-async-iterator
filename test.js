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
	complete();

	t.deepEqual(await iterator.next(), {
		done: true,
	});
	await cleanupPromise;
});
