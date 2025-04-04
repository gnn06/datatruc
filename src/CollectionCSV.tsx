import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Collapse, IconButton, Stack, Tooltip } from "@mui/material";
import { download, generateCsv, mkConfig } from "export-to-csv";
import { produce } from "immer";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { useMemo, useState } from "react";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilePicker from '@ihatecode/react-file-picker';
import Papa from 'papaparse';
import { Func } from "./Func";
import { transformAllCollections, transformCollection } from "./compute";

// collection [] or [{application:'aze',...},...]
export function CollectionCSV({ collections, onCollectionChange, id }) {

    const [funcStr, setFuncStr] = useState("");
    const [rows, setRows] = useState([]);
    const [collectionName, setCollectionName] = useState('rows' + id);

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
            setRows(newRows)
            onCollectionChange({ collection: newRows, collectionName, func: funcStr }, id);
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
            setRows(newRows)
            onCollectionChange({ collection: newRows, collectionName, func: funcStr }, id);
            table.setCreatingRow(null);
        },
        renderTopToolbarCustomActions: ({ table }) => (<>
            <Tooltip title="Ajouter une ligne">
                <IconButton onClick={() => { table.setCreatingRow(true) }}>
                    <AddIcon />
                </IconButton>
            </Tooltip>
            <FilePicker
                multiple={false}
                accept="text/csv"
                onChange={(files) => onCSV_Import(files)}
            >
                <Button>Importer</Button>
            </FilePicker>
            <Button onClick={onCSV_Export}>Exporter</Button>
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
            setRows(newRows)
            onCollectionChange({ collection: newRows, collectionName, func: funcStr }, id);
        }
    }

    const onCSV_Import = (files: FileList | null) => {
        if (files) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileContent = e.target.result;
                const csvConfig = { header: true };
                const csvData = Papa.parse(fileContent, csvConfig);
                setRows(csvData.data)
                onCollectionChange({ collection: csvData.data, collectionName, func: funcStr }, id)
            };
            reader.readAsText(files[0]);
        }
    }

    const onCSV_Export = () => {
        const csvConfig = mkConfig({
            fieldSeparator: ',',
            decimalSeparator: '.',
            useKeysAsHeaders: true,
            quoteStrings: false,
            filename: collectionName,
        });
        const csv = generateCsv(csvConfig)(data);
        download(csvConfig)(csv);
    };

    const onFuncStrChange = (value) => {
        setFuncStr(value);
        onCollectionChange({ collection: rows, collectionName: collectionName, func: value }, id)
    }

    const onNameChange = (e) => {
        setCollectionName(e.target.value)
        onCollectionChange({ collection: rows, collectionName: e.target.value, func: funcStr }, id)
    }

    const [funcShow, setFuncShow] = useState(false)

    const onFuncShow = () => {
        setFuncShow(true);
    }

    const onFuncClose = () => {
        setFuncShow(false);
    }

    return (<Accordion defaultExpanded={true} sx={{bgcolor:'rgb(250,250,250)'}}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <div>Collection name : <input type="text" value={collectionName} onChange={onNameChange} onClick={(e) => {e.stopPropagation()}}/></div>
        </AccordionSummary>
        <AccordionDetails >
            <Stack direction="row" spacing={2} >
                <MaterialReactTable table={tablePatchPolicies} />
                {funcShow && <Func text={funcStr} onTextChange={onFuncStrChange} onClose={onFuncClose} />}
            </Stack>
        </AccordionDetails>
    </Accordion>)
}