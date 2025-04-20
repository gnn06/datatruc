import { describe, expect, test } from 'vitest';
import { getData, getDependencies, isTypeValid, transformAllCollections, transformCollection } from "./compute";
import { Collection } from './data';

test('getData without dependency', () => {
    const givenFuncStr = 'return rows.map(el => el.value * 2)';
    const givenCollection = [{ value: 12 }]
    const givenCollections:Collection[] = [];
    const result = getData(givenFuncStr, givenCollection, givenCollections);
    expect(result).toEqual([24]);
});

test('getData parsing error', () => {
    const givenFuncStr = 'ret';
    const givenCollection = [{ value: 12 }]
    const givenCollections:Collection[] = [];
    const result = getData(givenFuncStr, givenCollection, givenCollections);
    expect(result).toEqual([]);
})

test("getData with dependency", () => {
    const givenCollection = [12];
    const givenCollections:Collection[] = [{ collectionName: 'VM', rows: [13], transformedCollection: [130], func: '' }];
    const result = getData('return rows.concat(VM)', givenCollection, givenCollections);
    expect(result).toEqual([12, 130]);
});

test("transformCollection without dependency", () => {
    const givenCollection:Collection = { collectionName: 'coll', rows: [12], func: 'return rows.map(el => el * 2)' }
    const givenCollections:Collection[] = [];
    const result = transformCollection(givenCollection, givenCollections);
    expect(result).toEqual({ collectionName: 'coll', rows: [12], func: 'return rows.map(el => el * 2)', transformedCollection: [24] });
});

test("transformCollection without func", () => {
    const givenCollection:Collection = { collectionName: 'coll', rows: [12], func: '' }
    const givenCollections:Collection[] = [];
    const result = transformCollection(givenCollection, givenCollections);
    expect(result).toEqual({ collectionName: 'coll', rows: [12], func: '', transformedCollection: [12] });
})

test("transformCollection with dependency", () => {
    const givenCollection:Collection = { collectionName: 'coll1', rows: [12], func: 'return rows.concat(VM)' }
    const givenCollections:Collection[] = [{ collectionName: 'VM', rows: [13], transformedCollection: [130], func:'' }];
    const result = transformCollection(givenCollection, givenCollections)
    expect(result).toEqual({ collectionName: 'coll1', rows: [12], func: 'return rows.concat(VM)', transformedCollection: [12, 130] });
});

test("getAllData", () => {
    const given:Collection[] = [
        { collectionName: 'coll1', rows: [12], func: 'return rows.map(el => el * 2)' },
        { collectionName: 'coll2', rows: [23], func: 'return rows.map(el => el * 10).concat(coll1)' }
    ];
    const result = transformAllCollections(given)
    expect(result).toEqual(
        [
            { collectionName: 'coll1', rows: [12], func: 'return rows.map(el => el * 2)', transformedCollection: [24] },
            { collectionName: 'coll2', rows: [23], func: 'return rows.map(el => el * 10).concat(coll1)', transformedCollection: [230, 24] }
        ]);
})

test("transformAllCollections of empty collection", () => {
    const given:Collection[] = [{ collectionName: 'rows', rows: [], func: '' }];
    const result = transformAllCollections(given)
    expect(result).toEqual([{ collectionName: 'rows', rows: [], transformedCollection: [], func: '' }])
})

test("transformAllCollections of empty", () => {
    const given:Collection[] = [];
    const result = transformAllCollections(given)
    expect(result).toEqual([])
})


test('getData result wrong structure', () => {
    const givenFuncStr = 'return [{prop:{subprop:\'val1\', subprop2: \'val2\'}}]';
    const givenCollection = [12]
    const givenCollections:Collection[] = [];
    const result = getData(givenFuncStr, givenCollection, givenCollections);
    expect(result).toEqual([]);
});

test('check type', () => {
    const coll1 = [{
        "vm": "nickel-jqualif1.zone.local",
        "toto": 12
    }]
    expect(isTypeValid(coll1)).toBeFalsy();
    const coll2 = [{
        "vm": "nickel-jqualif1.zone.local",
        "toto": 12,
        titi: { toto: 'ae' }
    }]
    expect(isTypeValid(coll2)).toBeTruthy()
})

describe('getDependencies', () => {
    test('1 dep', () => {
        const givenFunc = 'xxxcoll1yyyy';
        const givenCollections = ['coll1', 'coll2'];

        const expected = ['coll1'];

        const result = getDependencies(givenFunc, givenCollections);
        expect(result).toEqual(expected);
    });
    test('no dep', () => {
        const givenFunc = 'xxx yyyy';
        const givenCollections = ['coll1', 'coll2'];

        const expected:string[] = [];

        const result:string[] = getDependencies(givenFunc, givenCollections);
        expect(result).toEqual(expected);
    })
})
