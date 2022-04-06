import {expectType} from 'tsd';
import createDeferredAsyncIterator from './index.js';

const {next, iterator, complete, onCleanup} = createDeferredAsyncIterator<number>();

expectType<Promise<void>>(next(1));
onCleanup(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
expectType<Promise<void>>(complete());

expectType<IteratorResult<number, number>>(await iterator.next());
