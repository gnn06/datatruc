import { expect, test } from 'vitest'

import { Collection } from './data.ts';
import { getObs, getObsArray } from './rxjs.ts';

test('one collection initialiazed', () => {
    const given: Collection = { collectionName: 'coll1', collection: [1,2], func: 'return rows.join(",")' };

    const obsColl = getObs(given);

    expect(given.transformedCollection).toEqual("1,2");
})

test('one collection', () => {
    const given: Collection = { collectionName: 'coll1', collection: [], func: '' };

    const obsColl = getObs(given);

    obsColl.collection$.next([1, 2]);
    expect(given.transformedCollection).toEqual([1, 2])

    obsColl.func$.next('return rows.join(",")');
    expect(given.transformedCollection).toEqual("1,2");
});

test('array of collection', () => {
    const given: Collection[] = [
        { collectionName: 'coll1', collection: [], func: '' },
        { collectionName: 'coll2', collection: [], func: '' }
    ];
    const obsColl = getObsArray(given);

    obsColl[0].collection$.next([1, 2]);
    obsColl[0].func$.next('return rows.join(",")');
    expect(given[0].transformedCollection).toEqual("1,2")

    obsColl[1].collection$.next([2, 3]);
    obsColl[1].func$.next('return rows.join("/")');
    expect(given[1].transformedCollection).toEqual("2/3")
});