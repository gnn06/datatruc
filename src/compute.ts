import Enumerable from "linq";

export function getData(funcStr, rows, collections) {
    const funcParam = ['Enumerable', 'rows'].concat(collections.map(item => item.collectionName)).join(',');
    const funcArg = collections.map(item => item.collection);
    const func = new Function(funcParam, funcStr);
    const newData = func(Enumerable, rows, ...funcArg)
    if (newData === undefined) {
        return []
    }
    if (newData.length > 0 && newData[0] === undefined) {
        return []
    }
    return newData
}

export function transformCollection(collection, collections) {
    const { func: funcStr, collection: rows } = collection;
    const newData = getData(funcStr, rows, collections)
    return { ...collection, collection: newData };
}

export function transformAllCollections(collections) {
    const newCollections = [];

    let el = collections.shift();
    while (el) {
        const tempCollections = newCollections.concat(collections)
        const newCollection = transformCollection(el, tempCollections);
        newCollections.push(newCollection);
        el = collections.shift();
    }
    return newCollections;
}