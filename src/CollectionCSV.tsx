import { useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, IconButton, Stack, Tooltip } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { TextCSV } from "./TextCSV";
import { TextFunc } from "./TextFunc";
import { Collection } from "./data";
import { CollectionSubject } from "./rxjs";
import { useObservable } from "./react-rxjs";
import { DataTable } from "./DataTale";

// collection [] or [{application:'aze',...},...]

interface CollectionCSVProps {
    collections: Collection[],
    collectionsObs: CollectionSubject[],
    onCollectionChange: (collection: Collection, id: number) => void,
    id: number,
    onDelete: (id: number) => void
};

export function CollectionCSV({ collections, collectionsObs, onCollectionChange, id, onDelete: onDeleteParent }
    : CollectionCSVProps
) {

    const collectionObject = collections[id];
    const currentCollection$:CollectionSubject = collectionsObs[id];
    const { collectionName } = collectionObject;

    // const [funcStr, setFuncStr] = useState("");
    // const [rows, setRows] = useState([]);
    //const [collectionName, setCollectionName] = useState('rows' + id);

    // const transformedCollections = useMemo(() => transformAllCollections(collections), [collections]);

    // const data = useMemo(() => transformCollection({ collectionName, collection: rows, func: funcStr }, transformedCollections).transformedCollection,
    //     [collectionName, rows, funcStr, transformedCollections]
    // )
    const data = useObservable(currentCollection$.result$, []);

    const onCSV_Import = () => {
        setShowRawData(!rawDataShow);
        if (!rawDataShow) setFuncShow(false);
    }

    const [funcShow, setFuncShow] = useState(false)
    const [rawDataShow, setShowRawData] = useState(false)

    const onFuncShow = () => {
        setFuncShow(!funcShow);
        if (!funcShow) setShowRawData(false);
    }

    const onFuncClose = () => {
        setFuncShow(false);
    }

    const onRawDataClose = () => {
        setShowRawData(false);
    }

    const onRowsChange = (rows: unknown[]) => {
        //setRows(rows);
        onCollectionChange({ ...collectionObject, rows }, id)
    };

    const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        //setCollectionName(e.target.value)
        onCollectionChange({ ...collectionObject, collectionName: e.target.value }, id)
    }

    const onDeleteCollection = () => {
        if (window.confirm('Are you sure you want to delete this collection?')) {
            onDeleteParent(id);
        }
    }

    return (<Accordion defaultExpanded={true} sx={{ bgcolor: 'rgb(238,238,238)' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <div>Collection name : <input type="text" value={collectionName} onChange={onNameChange} onClick={(e) => { e.stopPropagation() }} />
                <Tooltip title="Delete collection"><IconButton onClick={onDeleteCollection}><DeleteIcon /></IconButton></Tooltip>

            </div>
        </AccordionSummary>
        <AccordionDetails >
            <Stack direction="row" spacing={2} >
                <DataTable data={data} onRowsChange={onRowsChange} onCSV_Import={onCSV_Import} onFuncShow={onFuncShow} />

                {funcShow && <TextFunc collectionName={collectionObject.collectionName} funcObs={currentCollection$.func$} onClose={onFuncClose} />}

                {rawDataShow && <TextCSV collectionName={collectionObject.collectionName} collectionObs={currentCollection$.collection$} onClose={onRawDataClose}></TextCSV>}
            </Stack>
        </AccordionDetails>
    </Accordion>)
}