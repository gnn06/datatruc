import { Box, Button, IconButton, Tooltip } from "@mui/material";
import { download, generateCsv, mkConfig } from "export-to-csv";
import { produce } from "immer";
import Enumerable from "linq";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { useMemo, useState } from "react";
import CSVReader from "react-csv-reader";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// collection [] or [{application:'aze',...},...]
export function CollectionCSV({ collections, onCollectionChange, id }) {

    const [funcStr, setFuncStr] = useState("");
    const [rows, setRows] = useState([]);
    const [collectionName, setCollectionName] = useState('rows');
    const data = useMemo(() => {
        if (funcStr) {
            try {
                const funcParam = ['Enumerable', 'rows'].concat(collections.map(item => item.collectionName)).join(',');
                const funcArg = collections.map(item => item.collection);
                const func = new Function(funcParam, funcStr);
                const newData = func(Enumerable, rows, ...funcArg)
                return newData
            } catch (error) {
                console.error('parsing function ', error, collections.length)
                return []
            }
        } else {
            return rows
        }
    }, [collections, rows, funcStr]);

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
            onCollectionChange({ collection: newRows, collectionName }, id);
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
            onCollectionChange({ collection: newRows, collectionName }, id);
            table.setCreatingRow(null);
        },
        renderTopToolbarCustomActions: ({ table }) => (<div>
            <Button
                onClick={() => {
                    table.setCreatingRow(true)
                }}>Ajouter une ligne</Button>
            <Button onClick={onCSV_Export}>Exporter</Button>
        </div>),
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
            onCollectionChange({ collection: newRows, collectionName }, id);
        }
    }

    const onCSV_Import = (data, fileInfo, originalFile) => {
        // receive(header=true)  [{application:'aze',patchPolicy:'aze'},...], pas de header
        // receive(header=false) [['application','patch_policy'], ['titane','pas de patch'],...]
        setRows(data)
        onCollectionChange({ collection: data, collectionName }, id)
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

    const onFuncStrChange = (e) => {
        const value = e.target.value
        if (value) {
            setFuncStr(value)
        } else {
            setFuncStr(value)
        }
    }

    const onFuncUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const funcStr = e.target.result;
                setFuncStr(funcStr);
            };
            reader.readAsText(file);
        }
    };

    const onNameChange = (e) => {
        setCollectionName(e.target.value)
        onCollectionChange({ collection: rows, collectionName: e.target.value }, id)
    }

    return (<div className="collection">
        <div className="command">
            <div>Collection name : <input type="text" value={collectionName} onChange={onNameChange} /></div>
            <input type="file" accept=".js" onChange={onFuncUpload} />
            <textarea value={funcStr} onChange={onFuncStrChange}></textarea>
            <CSVReader onFileLoaded={onCSV_Import} parserOptions={{ header: true }} />
        </div>
        {rows.length > 0 && <MaterialReactTable table={tablePatchPolicies} />}
    </div>)
}