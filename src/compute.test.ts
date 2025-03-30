import { expect, test } from 'vitest';
import { getData, transformAllCollections, transformCollection } from "./compute";

test('getData', () => {
    const givenFuncStr = 'return rows.map(el => el.value * 2)';
    const givenCollection = [{ value: 12 }]
    const givenCollections = [];
    const result = getData(givenFuncStr, givenCollection, givenCollections);
    expect(result).toEqual([24]);
});

test("don't use colelctions", () => {
    const givenCollection = { collectionName: 'coll', collection: [{ value: 12 }], func: 'return rows.map(el => el.value * 2)'}
    const givenCollections = [];
    const result = transformCollection(givenCollection, givenCollections);
    expect(result).toEqual({ collectionName: 'coll', collection: [24], func: 'return rows.map(el => el.value * 2)'});
});

test("use colelctions", () => {
    const givenCollection = { collectionName: 'coll1', collection: [12], func: 'return rows.concat(VM)' }
    const givenCollections = [{ collectionName: 'VM', collection: [13] }];
    const result = transformCollection(givenCollection, givenCollections)
    expect(result).toEqual({ collectionName: 'coll1', collection: [12, 13], func: 'return rows.concat(VM)' });
});

test("getAllData", () => {
    const given = [
        { collectionName: 'coll1', collection: [12], func: 'return rows.map(el => el * 2)' },
        { collectionName: 'coll2', collection: [23], func: 'return rows.map(el => el * 10).concat(coll1)' }
    ];
    const result = transformAllCollections(given)
    expect(result).toEqual(
        [
            { collectionName: 'coll1', collection: [24], func: 'return rows.map(el => el * 2)' },
            { collectionName: 'coll2', collection: [230,24], func: 'return rows.map(el => el * 10).concat(coll1)' }
        ]);
})