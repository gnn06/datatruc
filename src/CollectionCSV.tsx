import { Accordion, AccordionDetails, AccordionSummary, Box, Button, IconButton, Stack, Tooltip } from "@mui/material";
import { produce } from "immer";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { useMemo, useState } from "react";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Papa from 'papaparse';
import { Text } from "./Text";
import { transformAllCollections, transformCollection } from "./compute";

// collection [] or [{application:'aze',...},...]
export function CollectionCSV({ collections, onCollectionChange, id }) {

    const collectionObject = collections[id];
    const { collection: rows, func: funcStr, collectionName } = collectionObject;

    

    // const [funcStr, setFuncStr] = useState("");
    const rawData = (collectionObject.rawData || Papa.unparse(rows, collectionObject.meta));
    // const [rows, setRows] = useState([]);
    //const [collectionName, setCollectionName] = useState('rows' + id);

    const transformedCollections = useMemo(() => transformAllCollections(collections), [collections]);

    const data = useMemo(() => transformCollection({ collectionName, collection: rows, func: funcStr }, transformedCollections).transformedCollection,
        [collectionName, rows, funcStr, transformedCollections]
    )

    const columnsPatchPolicies = useMemo(() => {
        const headers = data.length > 0 ? Object.keys(data[0]) : []
        return headers.map(el => ({ accessorKey: el, header: el }))
    }, [data])

    const tablePatchPolicies = useMaterialReactTable({
        columns: columnsPatchPolicies,
        data: data,
        enableEditing: true,
        editDisplayMode: 'row',
        onEditingRowSave: ({ row, table, values }) => {
            const index = row.index
            const newRows = produce(rows, draftRows => {
                draftRows[index] = values
            })
            //setRows(newRows)
            onCollectionChange({ ...collectionObject, collection: newRows }, id);
            table.setEditingRow(null); //exit editing mode
        },
        onEditingRowCancel: () => {
            //clear any validation errors
        },
        createDisplayMode: 'modal',
        onCreatingRowSave: ({ table, values }) => {
            const newRows = produce(rows, draftRows => {
                draftRows.push(values)
            })
            // setRows(newRows)
            onCollectionChange({ ...collectionObject, collection: newRows }, id);
            table.setCreatingRow(null);
        },
        renderTopToolbarCustomActions: ({ table }) => (<>
            <Tooltip title="Ajouter une ligne">
                <IconButton onClick={() => { table.setCreatingRow(true) }}>
                    <AddIcon />
                </IconButton>
            </Tooltip>
            <Button onClick={onCSV_Import}>Import / Export</Button>
            <Button onClick={onFuncShow}>Function</Button>
        </>),
        renderRowActions: ({ row, table }) => (
            <Box sx={{ display: 'flex', gap: '1rem' }}>
                <Tooltip title="Edit">
                    <IconButton onClick={() => table.setEditingRow(row)}>
                        <EditIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => onDeleteRow(row)}>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        )
    });

    const onDeleteRow = (row) => {
        if (window.confirm('Are you sure you want to delete this row?')) {
            const index = row.index
            const newRows = produce(rows, draftRows => {
                draftRows.splice(index, 1)
            })
            // setRows(newRows)
            onCollectionChange({...collectionObject, collection: newRows }, id);
        }
    }

    const onCSV_Import = () => {
        setShowRawData(!rawDataShow);
        if (!rawDataShow) setFuncShow(false);
    }

    const onFuncStrChange = (value) => {
        // setFuncStr(value);
        onCollectionChange({...collectionObject, func: value }, id)
    }

    const onNameChange = (e) => {
        //setCollectionName(e.target.value)
        onCollectionChange({...collectionObject, collectionName: e.target.value }, id)
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

    const onRawDataChange = (text) => {
        if (text === '') {
            onCollectionChange({ ...collectionObject, collection: [], rawData: undefined, meta:undefined }, id)
            return;
        }
        const csvConfig = { header: true };
        const csvData = Papa.parse(text, csvConfig);
        if (csvData.errors.length > 0) {
            onCollectionChange({...collectionObject, rawData:text }, id);
            return;
        } else {
            onCollectionChange({ ...collectionObject, collection: csvData.data, meta: csvData.meta, rawData: undefined }, id);
            return;
        }
        // setRows(csvData.data)
        // setRawData(text);
        
    }

    return (<Accordion defaultExpanded={true} sx={{ bgcolor: 'rgb(250,250,250)' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <div>Collection name : <input type="text" value={collectionName} onChange={onNameChange} onClick={(e) => { e.stopPropagation() }} /></div>
        </AccordionSummary>
        <AccordionDetails >
            <Stack direction="row" spacing={2} >
                <MaterialReactTable table={tablePatchPolicies} />

                {funcShow && <Text text={funcStr} onTextChange={onFuncStrChange} onClose={onFuncClose}
                    mimeType="text/javascript" filenamePrefix="function" collectionName={collectionName}
                >
                    <p>You can use native javascript and <a href="https://github.com/mihaifm/linq" target='_blank'>linq</a> library.</p>
                    <p>You need to return an array of objects, each of its properties representing a column.</p>
                    <p>The current collection is accessible via <code>rows</code> and other collections are accessible by name. Put collections that are used by others first to resolve dependencies.</p>
                    <p>Example : <code><br />return Enumerable.from(rows)<br />
                        .select(row =&gt; (&#123;...row,&nbsp;prop: row.value * 2 &#125;)).toArray();</code></p>
                    <p>Example de jointure : <br />
                        <code>return Enumerable.from(coll1)<br />
                            .leftJoin(coll2,<br />
                            left =&gt; left.prop1,<br />
                            right =&gt; right.prop2,<br />
                            (left, right) =&gt; &#123;...&#125;)</code></p></Text>}

                {rawDataShow && <Text text={rawData} onTextChange={onRawDataChange} onClose={onRawDataClose}
                    mimeType="text/csv" filenamePrefix="data" collectionName={collectionName}></Text>}
            </Stack>
        </AccordionDetails>
    </Accordion>)
}