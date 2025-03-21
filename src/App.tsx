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

    const onVM_Upload = (data, fileInfo, originalFile) => {
        const newListVM = data.slice(1).map(item => ({ vm: item[0], cve: item[1] }))
        setListVM(newListVM)
        if (listResultFuncStr) {
            const func = new Function('Enumerable', 'VM', 'patch_policies', listResultFuncStr);
            // const newData = join(newListVM, listPatchPolicy)
            const newData = func(Enumerable, newListVM, listPatchPolicy)
            setData(newData)
        }
    }
    const onPatchPolicyUpload = (data, fileInfo, originalFile) => {
        const newListPatchPolicy = data.slice(1).map(item => ({ application: item[0], patchPolicy: item[1] }))
        setListPatchPolicy(newListPatchPolicy)
        if (listResultFuncStr) {
            const func = new Function('Enumerable', 'VM', 'patch_policies', listResultFuncStr);
            // const newData = join(listVM, newListPatchPolicy)
            const newData = func(Enumerable, listVM, newListPatchPolicy)
            setData(newData)
        }
    }

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

    const onLocalFileUpload = (event) => {
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

    const onPatchPolicyChange = (list) => {
        setListPatchPolicy(list)
        if (listResultFuncStr) {
            const func = new Function('Enumerable', 'VM', 'patch_policies', listResultFuncStr);
            const newData = func(Enumerable, listVM, list)
            setData(newData)
        }
    }

    return (<>
        <input type="file" accept=".js" onChange={onLocalFileUpload} />
        <textarea value={listResultFuncStr} onChange={onChangeFuncStr}></textarea>
        <MaterialReactTable table={table} />
        <CSVReader label="VM" onFileLoaded={onVM_Upload} />
        <CSVReader label="patch_policies" onFileLoaded={onPatchPolicyUpload} />
        <CollectionEditor collection={listPatchPolicy} onCollectionChange={onPatchPolicyChange} />
    </>);
}
export default App

function CollectionEditor({ collection, onCollectionChange }) {
    const columnsPatchPolicies = useMemo(() => [
        {
            accessorKey: 'application',
            header: 'application'
        },
        {
            accessorKey: 'patchPolicy',
            header: 'patch policy'
        }], [])
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
    return <MaterialReactTable table={tablePatchPolicies} />
}