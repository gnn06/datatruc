import { useMemo, useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, IconButton, Stack, Tooltip } from "@mui/material";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { produce } from "immer";

import { transformAllCollections, transformCollection } from "./compute";
import { TextCSV } from "./TextCSV";
import { TextFunc } from "./TextFunc";

// collection [] or [{application:'aze',...},...]
export function CollectionCSV({ collections, onCollectionChange, id, onDelete: onDeleteParent }) {

    const collectionObject = collections[id];
    const { collection: rows, func: funcStr, collectionName } = collectionObject;

    // const [funcStr, setFuncStr] = useState("");
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
            onCollectionChange({ ...collectionObject, collection: newRows }, id);
        }
    }

    const onCSV_Import = () => {
        setShowRawData(!rawDataShow);
        if (!rawDataShow) setFuncShow(false);
    }

    const onFuncStrChange = (value) => {
        // setFuncStr(value);
        onCollectionChange({ ...collectionObject, func: value }, id)
    }

    const onNameChange = (e) => {
        //setCollectionName(e.target.value)
        onCollectionChange({ ...collectionObject, collectionName: e.target.value }, id)
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

    const onRawDataChange = (collection) => {
        onCollectionChange(collection, id)
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
                <MaterialReactTable table={tablePatchPolicies} />

                {funcShow && <TextFunc collection={collectionObject} onTextChange={onFuncStrChange} onClose={onFuncClose} />}

                {rawDataShow && <TextCSV collection={collectionObject} onRawDataChange={onRawDataChange} onClose={onRawDataClose}></TextCSV>}
            </Stack>
        </AccordionDetails>
    </Accordion>)
}