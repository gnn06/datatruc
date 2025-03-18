import './App.css'
import { useMemo, useState } from 'react'
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef,
} from 'material-react-table';
import { join } from './service';
import CSVReader from 'react-csv-reader'

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
        const newData = join(newListVM, listPatchPolicy)
        setData(newData)
    }
    const onPatchPolicyUpload = (data, fileInfo, originalFile) => {
        let newListPatchPolicy = data.slice(1).map(item => ({ application: item[0], patchPolicy: item[1] }))
        setListPatchPolicy(newListPatchPolicy)
        const newData = join(listVM, newListPatchPolicy)
        setData(newData)

    }

    return (<>
        <CSVReader label="VM" onFileLoaded={onVM_Upload} />
        <CSVReader label="patch policies" onFileLoaded={onPatchPolicyUpload} />
        <MaterialReactTable table={table} />
    </>);
}
export default App
