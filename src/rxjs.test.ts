import { describe, expect, test } from 'vitest'

import { Collection } from './data.ts';
import { getAllObs, CollectionSubject, getDepSubjects, getAllObsWithDep } from './rxjs.ts';
import { BehaviorSubject, combineLatest, firstValueFrom, map, Subject, switchMap } from 'rxjs';

test.skip('one collection initialiazed', () => {
    const given: Collection = { collectionName: 'coll1', rows: [1, 2], func: 'return rows.join(",")' };

    const obsColl = getObs(given);

    expect(given.transformedCollection).toEqual("1,2");
})

test.skip('one collection', () => {
    const given: Collection = { collectionName: 'coll1', rows: [], func: '' };

    const obsColl = getObs(given);

    obsColl.collection$.next([1, 2]);
    expect(given.transformedCollection).toEqual([1, 2])

    obsColl.func$.next('return rows.join(",")');
    expect(given.transformedCollection).toEqual("1,2");
});

test.skip('array of collection', () => {
    const given: Collection[] = [
        { collectionName: 'coll1', rows: [], func: '' },
        { collectionName: 'coll2', rows: [], func: '' }
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

describe('getAllObsWithDep', () => {
    test('1 dep', async () => {
        const given: Collection[] = [
            { collectionName: 'coll1', rows: [1, 2], func: 'return rows.join(",")' },
            { collectionName: 'coll2', rows: [2, 3], func: 'return rows.join("/") + coll1' }
        ];

        const result$ = getAllObsWithDep(given);
        result$[0].collection$.next([10, 20]);

        const value0 = await firstValueFrom(result$[0].result$);
        expect(value0).toEqual("10,20")

        const value1 = await firstValueFrom(result$[1].result$);
        expect(value1).toEqual("2/310,20")
    });

    test('2 deps', async () => {
        const given: Collection[] = [
            { collectionName: 'coll1', rows: [1, 2], func: 'return rows.join(",")' },
            { collectionName: 'coll2', rows: [2, 3], func: 'return rows.join("/")' },
            { collectionName: 'coll3', rows: [],     func: 'return coll1 + coll2' }
        ];

        const result$ = getAllObsWithDep(given);

        const value0 = await firstValueFrom(result$[0].result$);
        expect(value0).toEqual("1,2")
        const value1 = await firstValueFrom(result$[1].result$);
        expect(value1).toEqual("2/3")
        const value2 = await firstValueFrom(result$[2].result$);
        expect(value2).toEqual("1,22/3")
    });
});

test('poc dependencies', async () => {
    const obs$ = [
        new BehaviorSubject(['1', '2']),
        new BehaviorSubject(['2', '3'])
    ];
    function getObsFromIndex(index: number[]) {
        return index.map(el => obs$[el])
    };
    const dep$ = new BehaviorSubject([0]);

    const obs3$ = dep$.pipe(
        switchMap((deps) => combineLatest(getObsFromIndex(deps))
            .pipe(
                map((values) => values.reduce((acc, el) => acc.concat(el.join(',')), ''))
            )));

    let result = await firstValueFrom(obs3$);
    expect(result).toEqual('1,2');
    obs$[0].next(['10', "20"])
    result = await firstValueFrom(obs3$);
    expect(result).toEqual('10,20');
    dep$.next([1]);
    result = await firstValueFrom(obs3$);
    expect(result).toEqual('2,3');
    dep$.next([0, 1]);
    result = await firstValueFrom(obs3$);
    expect(result).toEqual('10,202,3');

});
