import Queue from 'yocto-queue';
import pDefer from 'p-defer';
import onetime from 'onetime';

export default function createDeferredAsyncIterator() {
	const values = new Queue();
	const onNextCallbacks = new Queue();
	const cleanupCallbacks = new Set();
	const errorCallbacks = new Set();

	const cleanup = onetime(() => {
		for (const callback of cleanupCallbacks) {
			callback();
		}
	});

	return {
		next(value) {
			const result = {
				done: false,
				value,
			};

			if (onNextCallbacks.size > 0) {
				onNextCallbacks.dequeue()(result);
			} else {
				values.enqueue(result);
			}
		},
		complete() {
			cleanup();

			values.enqueue({
				done: true,
			});
		},
		onCleanup(callback) {
			cleanupCallbacks.add(callback);
		},
		onError(error) {
			errorCallbacks.add(error);
		},
		iterator: {
			async next() {
				if (values.size > 0) {
					return values.dequeue();
				}

				const {promise: nextValue, resolve} = pDefer();
				onNextCallbacks.enqueue(resolve);

				return nextValue;
			},
			return(value) {
				cleanup();

				return value;
			},
			throw(error) {
				if (!errorCallbacks.some(callback => callback(error) === false)) {
					throw error;
				}
			},
		},
	};
}
