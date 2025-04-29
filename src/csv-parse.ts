import Papa from 'papaparse';

export function getRawDataFromRows(collection: unknown[]) {
    if (collection === undefined) return '';
    return Papa.unparse(collection)
};
