import { useMemo, useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, IconButton, Stack, Tooltip } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { TextCSV } from "./TextCSV";
import { TextFunc } from "./TextFunc";
import { Collection } from "./data";
import { transformAllCollections, transformCollection } from "./compute";
import { DataTable } from "./DataTale";


// collection [] or [{application:'aze',...},...]

interface CollectionCSVProps {
    collections: Collection[],
    onCollectionChange: (collection: Collection, id: number) => void,
    id: number,
    onDelete: (id: number) => void
};

export function CollectionCSV({ collections, onCollectionChange, id, onDelete: onDeleteParent }
    : CollectionCSVProps
) {

    const collectionObject = collections[id];

    const { rows, func: funcStr, collectionName } = collectionObject;

    // const [funcStr, setFuncStr] = useState("");
    // const [rows, setRows] = useState([]);
    //const [collectionName, setCollectionName] = useState('rows' + id);

    const transformedCollections = useMemo(() => transformAllCollections(collections), [collections]);

    const data = useMemo(() => transformCollection({ collectionName, rows, func: funcStr }, transformedCollections).transformedCollection,
        [collectionName, rows, funcStr, transformedCollections]
    )

    const [funcShow, setFuncShow] = useState(false)
    const [rawDataShow, setShowRawData] = useState(false)

    const onCSV_Import = () => {
        setShowRawData(!rawDataShow);
        if (!rawDataShow) setFuncShow(false);
    }

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

    const onFuncStrChange = (value:string) => {
        // setFuncStr(value);
        onCollectionChange({ ...collectionObject, func: value }, id)
    }

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

                {funcShow && <TextFunc collectionName={collectionObject.collectionName} func={collectionObject.func} onTextChange={onFuncStrChange} onClose={onFuncClose} />}

                {rawDataShow && <TextCSV collectionName={collectionObject.collectionName} collection={collectionObject.rows} onCollectionChange={onRowsChange} onClose={onRawDataClose}></TextCSV>}
            </Stack>
        </AccordionDetails>
    </Accordion>)
}