import Queue from 'yocto-queue';
import pDefer from 'p-defer';

export default function createDeferredAsyncIterator() {
	const values = new Queue();
	const onNextCallbacks = new Queue();
	const cleanupCallbacks = new Set();

	function cleanup() {
		for (const callback of cleanupCallbacks) {
			callback();
		}

		cleanupCallbacks.clear();
	}

	function sendNextValue(value) {
		if (onNextCallbacks.size > 0) {
			onNextCallbacks.dequeue()(value);
		} else {
			values.enqueue(value);
		}
	}

	return {
		next(value) {
			sendNextValue({
				done: false,
				value,
			});
		},
		complete() {
			cleanup();

			sendNextValue({
				done: true,
			});
		},
		onCleanup(callback) {
			cleanupCallbacks.add(callback);
		},
		iterator: {
			async next() {
				if (values.size > 0) {
					return values.dequeue();
				}

				const {promise, resolve} = pDefer();
				onNextCallbacks.enqueue(resolve);

				return promise;
			},
			async return(value) {
				cleanup();

				return {
					done: true,
					value,
				};
			},
		},
	};
}
