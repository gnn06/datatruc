import Enumerable from "linq";

export function getData(funcStr, rows, collections) {
    try {
        const funcParam = ['Enumerable', 'rows'].concat(collections.map(item => item.collectionName)).join(',');
        const funcArg = [Enumerable, rows].concat(collections.map(item => item.transformedCollection));
        const func = new Function(funcParam, funcStr);
        const newData = func(...funcArg)
        if (newData === undefined) {
            return []
        }
        if (newData.length > 0 && newData[0] === undefined) {
            return []
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