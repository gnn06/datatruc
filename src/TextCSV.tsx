import { useState } from 'react';
import Papa from 'papaparse';
import { ParseError } from 'papaparse';

import { Text } from "./Text";

function getRawDataFromRows(collection) {
    if (collection === undefined) return '';
    return Papa.unparse(collection)
};

function getMessageError(errors: ParseError[]): string {
    return errors.map((error) => {
        const { row, message } = error;
        if (row === undefined) return message;
        return `Error in row ${row}: ${message}`;
    }).join('\n');
}

export function TextCSV({ collectionName, collection, onCollectionChange, onClose }) {

    const [rawData, setRawData] = useState(getRawDataFromRows(collection));
    const [errorMsg, setErrorMsg] = useState("");

    // useEffect(() => {
    //     const rawData = getRawDataFromRows(collection);
    //     setRawData(rawData);
    // }, [collection])

    const onTextChange = (text: string) => {
        setRawData(text);
        if (text === '') {
            onCollectionChange({ ...collection, collection: [], rawData: undefined, meta: undefined })
            return;
        }
        const csvConfig = { header: true, skipEmptyLines: true };
        const csvData = Papa.parse(text, csvConfig);
        if (csvData.errors.length > 0) {
            setErrorMsg(getMessageError(csvData.errors));
            return;
        } else {
            setErrorMsg("");
            onCollectionChange({ ...collection, collection: csvData.data, meta: csvData.meta, rawData: undefined });
            return;
        }
        // setRows(csvData.data)

    }

    

    return <>
        <Text text={rawData} errorMsg={errorMsg} onTextChange={onTextChange} onClose={onClose}
            mimeType="text/csv" filenamePrefix="data" collectionName={collectionName}></Text>
    </>
}