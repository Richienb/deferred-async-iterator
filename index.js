import Queue from 'yocto-queue';

export default function createDeferredAsyncIterator() {
	const valueQueue = new Queue();
	const nextQueue = new Queue();
	const cleanupCallbacks = new Set();

	function cleanup() {
		for (const callback of cleanupCallbacks) {
			callback();
		}

		cleanupCallbacks.clear();
	}

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
		onCleanup(callback) {
			cleanupCallbacks.add(callback);
		},
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
