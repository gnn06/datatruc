import './App.css'
import { useMemo, useState } from 'react'
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef,
} from 'material-react-table';
import CSVReader from 'react-csv-reader'
import Enumerable from 'linq'
import { produce, enableMapSet } from "immer"
import { Button } from '@mui/material';

enableMapSet();

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
    const [collections, setCollections] = useState(new Map([['VM', []], ['Patch policies', []]]))

    const onVMChange = (list) => {
        const newCollections = produce(collections, draftCollections => {
            draftCollections.set('VM', list)
        })
        setCollections(newCollections);
    }

    const onPatchPolicyChange = (list) => {
        const newCollections = produce(collections, draftCollections => {
            draftCollections.set('Patch policies', list)
        })
        setCollections(newCollections);
    }

    return (<>
        <CollectionFunc listVM={collections.get('VM')} listPatchPolicy={collections.get('Patch policies')} />
        <CollectionCSV collectionName="VM" collection={collections.get('VM')} onCollectionChange={onVMChange} />
        <CollectionCSV collectionName="Patch policies" collection={collections.get('Patch policies')} onCollectionChange={onPatchPolicyChange} />
    </>);
}
export default App

function CollectionFunc({ listVM, listPatchPolicy }) {
    const [funcStr, setFuncStr] = useState("")
    const data = useMemo(() => {
        if (funcStr) {
            try {
                const func = new Function('Enumerable', 'VM', 'patch_policies', funcStr);
                const newData = func(Enumerable, listVM, listPatchPolicy)
                return newData
            } catch (syntaxError) {
                return []
            }
        } else {
            return []
        }
    }, [listVM, listPatchPolicy, funcStr]);


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

    const columns = useMemo(() => {
        const headers = data.length > 0 ? Object.keys(data[0]) : []
        return headers.map(el => ({ accessorKey: el, header: el }))
    }, [data])

    const table = useMaterialReactTable({ columns, data });
    return <>
        <input type="file" accept=".js" onChange={onFuncUpload} />
        <textarea value={funcStr} onChange={onChangeFuncStr}></textarea>
        <MaterialReactTable table={table} />
    </>
}

// collection [] or [{application:'aze',...},...]
function CollectionCSV({ collectionName, collection, onCollectionChange }) {

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