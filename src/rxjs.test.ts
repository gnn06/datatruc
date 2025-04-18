import { expect, test } from 'vitest'
import { TestScheduler } from 'rxjs/testing';

import { Collection } from './data.ts';
import { getObs, getAllObs, CollectionSubject, getDepSubjects, getAllObsWithDep } from './rxjs.ts';
import { combineLatest, firstValueFrom, Subject } from 'rxjs';

test.skip('one collection initialiazed', () => {
    const given: Collection = { collectionName: 'coll1', collection: [1, 2], func: 'return rows.join(",")' };

    const obsColl = getObs(given);

    expect(given.transformedCollection).toEqual("1,2");
})

test.skip('one collection', () => {
    const given: Collection = { collectionName: 'coll1', collection: [], func: '' };

    const obsColl = getObs(given);

    obsColl.collection$.next([1, 2]);
    expect(given.transformedCollection).toEqual([1, 2])

    obsColl.func$.next('return rows.join(",")');
    expect(given.transformedCollection).toEqual("1,2");
});

test.skip('array of collection', () => {
    const given: Collection[] = [
        { collectionName: 'coll1', collection: [], func: '' },
        { collectionName: 'coll2', collection: [], func: '' }
    ];
    const obsColl = getAllObs(given);

    obsColl[0].collection$.next([1, 2]);
    obsColl[0].func$.next('return rows.join(",")');
    expect(given[0].transformedCollection).toEqual("1,2")

    obsColl[1].collection$.next([2, 3]);
    obsColl[1].func$.next('return rows.join("/")');
    expect(given[1].transformedCollection).toEqual("2/3")
});

test('get dependant subjects', () => {
    const givenDep = ['coll1'];
    const givenAllSubject$: CollectionSubject[] = [{ collection: { collectionName: 'coll1' }, result$: 'result' }];
    const result = getDepSubjects(givenDep, givenAllSubject$);
    expect(result).toEqual(['result']);
});

test('poc', () => {
    const obs1Rows$ = new Subject();
    const obs1Func$ = new Subject();
    const obs1Result$ = combineLatest([obs1Rows$, obs1Func$]);

    const obs2Rows$ = new Subject();
    const obs2Func$ = new Subject();
    const obs2Result$ = combineLatest([obs2Rows$, obs2Func$, obs1Result$]);

    obs1Rows$.next(1);
    obs1Func$.next(2);

    obs2Rows$.next(3);
    obs2Func$.next(4);

    obs2Result$.subscribe((value) => expect(value).toEqual([3, 4, [1, 2]]));
});

test('getAllObsWithDep', async () => {
    const given: Collection[] = [
        { collectionName: 'coll1', collection: [1, 2], func: 'return rows.join(",")' },
        { collectionName: 'coll2', collection: [2, 3], func: 'return rows.join("/") + coll1' }
    ];

    const result$ = getAllObsWithDep(given);
    result$[0].collection$.next([10, 20]);

    const value0 = await firstValueFrom(result$[0].result$);
    expect(value0).toEqual("10,20")
    const value1 = await firstValueFrom(result$[1].result$);
    expect(value1).toEqual("2/310,20")
});