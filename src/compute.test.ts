import { expect, test } from 'vitest';
import { getData, transformAllCollections, transformCollection } from "./compute";

test('getData without dependency', () => {
    const givenFuncStr = 'return rows.map(el => el.value * 2)';
    const givenCollection = [{ value: 12 }]
    const givenCollections = [];
    const result = getData(givenFuncStr, givenCollection, givenCollections);
    expect(result).toEqual([24]);
});

test("getData with dependency", () => {
    const givenCollection = [12];
    const givenCollections = [{ collectionName: 'VM', collection: [13], transformedCollection: [130] }];
    const result = getData('return rows.concat(VM)', givenCollection, givenCollections);
    expect(result).toEqual([12, 130]);
});

test("transformCollection without dependency", () => {
    const givenCollection = { collectionName: 'coll', collection: [12], func: 'return rows.map(el => el * 2)' }
    const givenCollections = [];
    const result = transformCollection(givenCollection, givenCollections);
    expect(result).toEqual({ collectionName: 'coll', collection: [12], func: 'return rows.map(el => el * 2)', transformedCollection: [24] });
});

test("transformCollection with dependency", () => {
    const givenCollection = { collectionName: 'coll1', collection: [12], func: 'return rows.concat(VM)' }
    const givenCollections = [{ collectionName: 'VM', collection: [13], transformedCollection: [130] }];
    const result = transformCollection(givenCollection, givenCollections)
    expect(result).toEqual({ collectionName: 'coll1', collection: [12], func: 'return rows.concat(VM)', transformedCollection: [12, 130] });
});

test("getAllData", () => {
    const given = [
        { collectionName: 'coll1', collection: [12], func: 'return rows.map(el => el * 2)' },
        { collectionName: 'coll2', collection: [23], func: 'return rows.map(el => el * 10).concat(coll1)' }
    ];
    const result = transformAllCollections(given)
    expect(result).toEqual(
        [
            { collectionName: 'coll1', collection: [12], func: 'return rows.map(el => el * 2)', transformedCollection: [24] },
            { collectionName: 'coll2', collection: [23], func: 'return rows.map(el => el * 10).concat(coll1)', transformedCollection: [230, 24] }
        ]);
})