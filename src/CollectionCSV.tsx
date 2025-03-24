import { Button } from "@mui/material";
import { download, generateCsv, mkConfig } from "export-to-csv";
import { produce } from "immer";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { useMemo } from "react";
import CSVReader from "react-csv-reader";

// collection [] or [{application:'aze',...},...]
export function CollectionCSV({ collectionName, collections, onCollectionChange }) {

    const collection = useMemo(() => collections.get(collectionName) || [], [collections, collectionName])

    const columnsPatchPolicies = useMemo(() => {
        const headers = collection.length > 0 ? Object.keys(collection[0]) : []
        return headers.map(el => ({ accessorKey: el, header: el }))
    }, [collection])

    const tablePatchPolicies = useMaterialReactTable({
        columns: columnsPatchPolicies,
        data: collection,
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

    return (<div>
        Collection name : {collectionName}
        {collectionName && <>
            <CSVReader onFileLoaded={onFileUpload} parserOptions={{ header: true }} />
            {collection.length > 0 && <MaterialReactTable table={tablePatchPolicies} />}</>}
    </div>)
}