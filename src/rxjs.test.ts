import { expect, test } from 'vitest'

import { Collection } from './data.ts';
import { getObs } from './rxjs.ts';

test('should ', () => {
    const given: Collection = { collectionName: 'coll1', collection: [], func: '' };
    
    const obsColl = getObs(given);

    obsColl.collection$.next([1, 2]);
    expect(given.transformedCollection).toEqual([1, 2])
    
    obsColl.func$.next('return rows.join(",")');
    expect(given.transformedCollection).toEqual("1,2");
});

test('should return empty array', () => {

});