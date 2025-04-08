import { useEffect, useState } from 'react';
import Papa from 'papaparse';

import { Text } from "./Text";

function getRawDataFromRows(collection) {
    if (collection === undefined) return '';
    const { collection:rows, meta, rawData } = collection;
    if (rawData) return rawData;
    if (rows === undefined) return '';
    return Papa.unparse(rows, meta)
}

export function TextCSV({collection, onRawDataChange, onClose}) {
    
    const [rawData, setRawData] = useState('')

    const { collectionName } = collection;
    
    useEffect(() => {
        const rawData = getRawDataFromRows(collection);
        setRawData(rawData);
    }, [collection])    

    const onTextChange = (text:string) => {
        setRawData(text);
        if (text === '') {
            onRawDataChange({ ...collection, collection: [], rawData: undefined, meta: undefined })
            return;
        }
        const csvConfig = { header: true };
        const csvData = Papa.parse(text, csvConfig);
        if (csvData.errors.length > 0) {
            return;
        } else {
            onRawDataChange({ ...collection, collection: csvData.data, meta: csvData.meta, rawData: undefined });
            return;
        }
        // setRows(csvData.data)

    }

    return <Text text={rawData} onTextChange={onTextChange} onClose={onClose}
        mimeType="text/csv" filenamePrefix="data" collectionName={collectionName}></Text>
}