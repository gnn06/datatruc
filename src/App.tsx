import './App.css'
import { useMemo, useState } from 'react'
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef,
} from 'material-react-table';
import CSVReader from 'react-csv-reader'
import Enumerable from 'linq'
import { produce } from "immer"
import { Button } from '@mui/material';

type VM_Row = {
    vm: string;
    cve: number;
}

type ApplicationPolicyRow = {
    application: string;
    patch_policy: string;
}

type Row = {
    vm: string;
    cve: number;
    application: string;
    patch_policy: string;
};

function App() {
    const [listVM, setListVM] = useState([])
    const [listPatchPolicy, setListPatchPolicy] = useState([])
    const [listResultFuncStr, setListResultFuncStr] = useState("")
    const [data, setData] = useState([])

    const columns = useMemo(
        () => [
            {
                accessorKey: 'vm', //access nested data with dot notation
                header: 'vm',
                size: 150,
            },
            {
                accessorKey: 'cve',
                header: 'cve',
                size: 150,
            },
            {
                accessorKey: 'application', //normal accessorKey
                header: 'application',
                size: 200,
            },
            {
                accessorKey: 'patchPolicy',
                header: 'patch policy',
                size: 150,
            },
        ],
        [],
    );

    const table = useMaterialReactTable({ columns, data });

    const onChangeFuncStr = (e) => {
        const value = e.target.value
        if (value) {
            setListResultFuncStr(value)
            const func = new Function('Enumerable', 'VM', 'patch_policies', listResultFuncStr);
            const newData = func(Enumerable, listVM, listPatchPolicy)
            setData(newData)
        } else {
            setListResultFuncStr(value)
            setData([])
        }
    }

    const onFuncUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                setListResultFuncStr(content);
                const func = new Function('Enumerable', 'VM', 'patch_policies', content);
                const newData = func(Enumerable, listVM, listPatchPolicy)
                setData(newData)
            };
            reader.readAsText(file);
        }
    };

    const onVMChange = (list) => {
        setListVM(list)
        if (listResultFuncStr) {
            const func = new Function('Enumerable', 'VM', 'patch_policies', listResultFuncStr);
            const newData = func(Enumerable, list, listPatchPolicy)
            setData(newData)
        }
    }

    const onPatchPolicyChange = (list) => {
        setListPatchPolicy(list)
        if (listResultFuncStr) {
            const func = new Function('Enumerable', 'VM', 'patch_policies', listResultFuncStr);
            const newData = func(Enumerable, listVM, list)
            setData(newData)
        }
    }

    return (<>
        <input type="file" accept=".js" onChange={onFuncUpload} />
        <textarea value={listResultFuncStr} onChange={onChangeFuncStr}></textarea>
        <MaterialReactTable table={table} />
        <CollectionEditor collectionName="VM" collection={listVM}          onCollectionChange={onVMChange} />
        <CollectionEditor collectionName="Patch policies" collection={listPatchPolicy} onCollectionChange={onPatchPolicyChange} />
    </>);
}
export default App

// collection [] or [{application:'aze',...},...]
function CollectionEditor({ collectionName, collection, onCollectionChange }) {

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
            onCollectionChange(nextListPatchPolicies)
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
            onCollectionChange(nextListPatchPolicies);
            table.setCreatingRow(null);
        },
        renderTopToolbarCustomActions: ({ table }) => (
            <Button
                onClick={() => {
                    table.setCreatingRow(true)
                }}>Ajouter une ligne</Button>
        )
    });

    const onFileUpload = (data, fileInfo, originalFile) => {
        // receive(header=true)  [{application:'aze',patchPolicy:'aze'},...], pas de header
        // receive(header=false) [['application','patch_policy'], ['titane','pas de patch'],...]
        onCollectionChange(data)
    }
    return <>
        <CSVReader label={collectionName} onFileLoaded={onFileUpload} parserOptions={{ header: true }} />
        {collection.length > 0 && <MaterialReactTable table={tablePatchPolicies} />}
    </>
}