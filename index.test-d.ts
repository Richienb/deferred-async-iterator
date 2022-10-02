import {expectType} from 'tsd';
import createDeferredAsyncIterator from './index.js';

const {next, nextError, iterator, complete, onCleanup} = createDeferredAsyncIterator<number>();

expectType<Promise<void>>(next(1));
expectType<Promise<void>>(nextError(new Error('Catch me if you can!')));
onCleanup(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
expectType<Promise<void>>(complete());

expectType<IteratorResult<number, number>>(await iterator.next());
