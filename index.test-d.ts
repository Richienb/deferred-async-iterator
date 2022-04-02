import {expectType} from 'tsd';
import createDeferredAsyncIterator from './index.js';

const iterator = createDeferredAsyncIterator<number>();

iterator.next(1);
iterator.onCleanup(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
iterator.complete();

expectType<IteratorResult<number, number>>(await iterator.iterator.next());

iterator.complete();
