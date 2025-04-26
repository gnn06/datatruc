export function restoreCollections() {
    const rawStored = localStorage.getItem('collections');
    if (rawStored) {
        const stored = JSON.parse(rawStored);
        return stored;
    } else {
        return [{ collectionName: 'rows0', rows: [], func: '' }]
    }
}