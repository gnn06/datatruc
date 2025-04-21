import { describe, expect, test } from 'vitest';
import { getData, getDependencies, isTypeValid } from "./compute";
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
    const givenCollections:Collection[] = [{ collectionName: 'VM', rows: [13], func: '' }];
    const result = getData('return rows.concat(VM)', givenCollection, givenCollections);
    expect(result).toEqual([12, 13]);
});

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
