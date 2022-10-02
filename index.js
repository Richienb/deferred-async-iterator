import Queue from 'yocto-queue';

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

	async function enqueueValue(value) {
		if (onNextCallbacks.size > 0) {
			onNextCallbacks.dequeue()(value);

			return;
		}

		return new Promise(resolve => {
			values.enqueue({value, resolve});
		});
	}

	return {
		async next(value) {
			return enqueueValue({
				done: false,
				value,
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
				if (values.size > 0) {
					const {value, resolve} = values.dequeue();

					resolve();

					return value;
				}

				return new Promise(resolve => {
					onNextCallbacks.enqueue(resolve);
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
