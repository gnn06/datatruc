import Enumerable from "linq";

export function isTypeValid (collection) {
    return Object.values(collection[0]).some(el => typeof el !== 'string' && typeof el !== 'number');
}

export function createFunc(funcStr:string, collections:[]) {
    const funcParam = ['Enumerable', 'rows'].concat(collections.map(item => item.collectionName)).join(',');
    return new Function(funcParam, funcStr);
}

export function getData(funcStr, rows, collections) {
    if (funcStr === undefined || funcStr === '') {
        return rows;
    }
    try {
        const funcArg = [Enumerable, rows].concat(collections.map(item => item.transformedCollection));
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

export function transformCollection(collection, collections) {
    const { func: funcStr, collection: rows } = collection;
    if (funcStr && funcStr !== '') {
        const newData = getData(funcStr, rows, collections)
        return { ...collection, transformedCollection: newData };
    } else {
        return { ...collection, transformedCollection: rows };
    }
}

export function transformAllCollections(collections) {
    const newCollections = [];
    const clone = collections.slice();
    let el = clone.shift();
    while (el) {
        const tempCollections = newCollections.concat(clone)
        const newCollection = transformCollection(el, tempCollections);
        newCollections.push(newCollection);
        el = clone.shift();
    }
    return newCollections;
}