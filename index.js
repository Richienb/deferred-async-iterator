import Queue from 'yocto-queue';
import pDefer from 'p-defer';

export default function createDeferredAsyncIterator() {
	const valueQueue = new Queue();
	const nextQueue = new Queue();
	const {promise: onCleanup, resolve: cleanup} = pDefer();
	let isDone = false;

	return {
		async next(value) {
			if (isDone) {
				return;
			}

			value = {
				done: false,
				value,
			};

			if (nextQueue.size > 0) {
				const {resolve} = nextQueue.dequeue();

				resolve(value);

				return;
			}

			return new Promise(resolve => {
				valueQueue.enqueue({value, resolve});
			});
		},
		async nextError(error) {
			if (isDone) {
				return;
			}

			if (nextQueue.size > 0) {
				const {reject} = nextQueue.dequeue();

				reject(error);

				return;
			}

			return new Promise(resolve => {
				valueQueue.enqueue({value: error, isError: true, resolve});
			});
		},
		async complete() {
			if (isDone) {
				return;
			}

			cleanup();

			isDone = true;

			while (nextQueue.size > 0) {
				const {resolve} = nextQueue.dequeue();

				resolve({
					done: true,
				});
			}
		},
		onCleanup,
		iterator: {
			async next() {
				if (valueQueue.size > 0) {
					const {value, isError, resolve} = valueQueue.dequeue();

					resolve();

					if (isError) {
						throw value;
					}

					return value;
				}

				if (isDone) {
					return {
						done: true,
					};
				}

				return new Promise((resolve, reject) => {
					nextQueue.enqueue({resolve, reject});
				});
			},
			async return(value) {
				cleanup();

				return {
					done: valueQueue.size === 0,
					value,
				};
			},
		},
	};
}
