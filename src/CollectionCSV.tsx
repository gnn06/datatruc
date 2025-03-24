import { Button } from "@mui/material";
import { download, generateCsv, mkConfig } from "export-to-csv";
import { produce } from "immer";
import Enumerable from "linq";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { useMemo, useState } from "react";
import CSVReader from "react-csv-reader";

// collection [] or [{application:'aze',...},...]
export function CollectionCSV({ collectionName, collections, onCollectionChange }) {

    const [funcStr, setFuncStr] = useState("");
    const collection = useMemo(() => collections.get(collectionName) || [], [collections, collectionName])
    const data = useMemo(() => {
            if (funcStr) {
                try {
                    const parameters = ['Enumerable'].concat(Array.from(collections.keys())).join(',');
                    const values = Array.from(collections.values());
                    const func = new Function(parameters, funcStr);
                    const newData = func(Enumerable, ...values)
                    return newData
                } catch (error) {
                    console.error('parsing function ', error)
                    return collection
                }
            } else {
                return collection
            }
        }, [collections, collection, funcStr]);

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
            const nextListPatchPolicies = produce(collection, draftList => {
                draftList[index] = values
            })
            onCollectionChange(nextListPatchPolicies, collectionName);
            table.setEditingRow(null); //exit editing mode
        },
        onEditingRowCancel: () => {
            //clear any validation errors
        },
        createDisplayMode: 'modal',
        onCreatingRowSave: ({ table, values }) => {
            const nextListPatchPolicies = produce(collection, draftList => {
                draftList.push(values)
            })
            onCollectionChange(nextListPatchPolicies, collectionName);
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

    const onFileUpload = (data, fileInfo, originalFile) => {
        // receive(header=true)  [{application:'aze',patchPolicy:'aze'},...], pas de header
        // receive(header=false) [['application','patch_policy'], ['titane','pas de patch'],...]
        onCollectionChange(data, collectionName)
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

    return (<div>
        Collection name : {collectionName}
        {collectionName && <>
            <input type="file" accept=".js" onChange={onFuncUpload} />
            <textarea value={funcStr} onChange={onChangeFuncStr}></textarea>
            <CSVReader onFileLoaded={onFileUpload} parserOptions={{ header: true }} />
            {collection.length > 0 && <MaterialReactTable table={tablePatchPolicies} />}</>}
    </div>)
}