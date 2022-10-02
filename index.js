import Queue from 'yocto-queue';
import pDefer from 'p-defer';

export default function createDeferredAsyncIterator() {
	const valueQueue = new Queue();
	const nextQueue = new Queue();
	const {promise: onCleanup, resolve: cleanup} = pDefer();

	async function enqueueValue(value) {
		if (nextQueue.size > 0) {
			const {resolve} = nextQueue.dequeue();

			resolve(value);

			return;
		}

		return new Promise(resolve => {
			valueQueue.enqueue({value, resolve});
		});
	}

	return {
		async next(value) {
			return enqueueValue({
				done: false,
				value,
			});
		},
		async nextError(error) {
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
			cleanup();

			return enqueueValue({
				done: true,
			});
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

				return new Promise((resolve, reject) => {
					nextQueue.enqueue({resolve, reject});
				});
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
