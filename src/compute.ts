import Enumerable from "linq";

import { Collection } from "./data";

export function isTypeValid (collection:unknown[]) {
    return Object.values(collection[0]).some(el => typeof el !== 'string' && typeof el !== 'number');
}

export function createFunc(funcStr:string, collections:Collection[]) {
    const funcParam = ['Enumerable', 'rows'].concat(collections.map(item => item.collectionName)).join(',');
    return new Function(funcParam, funcStr);
}

export function getData(funcStr:string, rows:unknown[], collections:Collection[]) {
    if (funcStr === undefined || funcStr === '') {
        return rows;
    }
    try {
        const funcArg = [Enumerable, rows].concat(collections.map(item => item.rows));
        const func = createFunc(funcStr, collections);
        const newData = func(...funcArg)
        if (newData === undefined) {
            return []
        }
        if (newData.length > 0 && newData[0] === undefined) {
            return []
        }
        // Check if all properties are simple types (not object)
        if (isTypeValid(newData)) {
            return [];
        }
        return newData
    } catch (error) {
        console.error('parsing function ', error)
        return []
    }
}

export function getDependencies(func:string, collections:string[]) {
    if (func === undefined) return [];
    return collections.filter(coll => func.indexOf(coll) > -1);
}

