import { useState } from 'react';
import Papa from 'papaparse';
import { ParseError } from 'papaparse';
import { Button } from '@mui/material';
import { useObservable } from './react-rxjs';
import { map } from 'rxjs';

import { Text } from "./Text";
import { CollectionSubject } from './rxjs';
import { getRawDataFromRows } from './csv-parse';

function getMessageError(errors: ParseError[]): string {
    return errors.map((error) => {
        const { row, message } = error;
        if (row === undefined) return message;
        return `Error in row ${row}: ${message}`;
    }).join('\n');
}

interface TextCSVProps {
    collectionName: string,
    collectionObs: CollectionSubject,
    onClose: () => void,
    onResultExport: () => void,
};

export function TextCSV({ collectionName, collectionObs, onClose, onResultExport }: TextCSVProps) {

    const [errorMsg, setErrorMsg] = useState("");

    const rawData = useObservable(collectionObs.pipe(map((value) => getRawDataFromRows(value))), "");

    // useEffect(() => {
    //     const rawData = getRawDataFromRows(collection);
    //     setRawData(rawData);
    // }, [collection])

    const onTextChange = (text: string) => {
        // setRawData(text);
        if (text === '') {
            // onCollectionChange([])
            collectionObs.next([]);
            return;
        }
        const csvConfig = { header: true, skipEmptyLines: true };
        const csvData = Papa.parse(text, csvConfig);
        if (csvData.errors.length > 0) {
            setErrorMsg(getMessageError(csvData.errors));
            return;
        } else {
            setErrorMsg("");
            // onCollectionChange(csvData.data);
            collectionObs.next(csvData.data);
            return;
        }
        // setRows(csvData.data)

    }

    const otherButton = <Button onClick={onResultExport}>Export Result</Button>

    return <>
        <Text text={rawData} otherButton={otherButton} errorMsg={errorMsg} onTextChange={onTextChange} onClose={onClose}
            mimeType="text/csv" filenamePrefix="data" collectionName={collectionName}></Text>
    </>
}