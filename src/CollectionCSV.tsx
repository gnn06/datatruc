import { Button } from "@mui/material";
import { download, generateCsv, mkConfig } from "export-to-csv";
import { produce } from "immer";
import Enumerable from "linq";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { useMemo, useState } from "react";
import CSVReader from "react-csv-reader";

// collection [] or [{application:'aze',...},...]
export function CollectionCSV({ collections, onCollectionChange }) {

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
            onCollectionChange({collection:newRows, collectionName});
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
            onCollectionChange({collection:newRows, collectionName});
            table.setCreatingRow(null);
        },
        renderTopToolbarCustomActions: ({ table }) => (<div>
            <Button
                onClick={() => {
                    table.setCreatingRow(true)
                }}>Ajouter une ligne</Button>
            <Button onClick={handleExportData}>Exporter</Button>
        </div>)
    });

    const onCSV_Import = (data, fileInfo, originalFile) => {
        // receive(header=true)  [{application:'aze',patchPolicy:'aze'},...], pas de header
        // receive(header=false) [['application','patch_policy'], ['titane','pas de patch'],...]
        setRows(data)
        onCollectionChange({collection: data, collectionName})
    }

    const handleExportData = () => {
        const csvConfig = mkConfig({
            fieldSeparator: ',',
            decimalSeparator: '.',
            useKeysAsHeaders: true,
            quoteStrings: false,
            filename: collectionName,
        });
        const csv = generateCsv(csvConfig)(collection);
        download(csvConfig)(csv);
    };

    const onChangeFuncStr = (e) => {
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
        onCollectionChange({collection: rows, collectionName: e.target.value})
    }

    return (<div>
        Collection name : <input type="text" value={collectionName} onChange={onNameChange} />
        <input type="file" accept=".js" onChange={onFuncUpload} />
        <textarea value={funcStr} onChange={onChangeFuncStr}></textarea>
        <CSVReader onFileLoaded={onCSV_Import} parserOptions={{ header: true }} />
        {rows.length > 0 && <MaterialReactTable table={tablePatchPolicies} />}
    </div>)
}