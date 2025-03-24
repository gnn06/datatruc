import Enumerable from "linq";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { useMemo, useState } from "react";

export function CollectionFunc({ collections }) {

    const [funcStr, setFuncStr] = useState("")
    const data = useMemo(() => {
        if (funcStr) {
            try {
                const parameters = ['Enumerable'].concat(Array.from(collections.keys())).join(',');
                const values = Array.from(collections.values());
                const func = new Function(parameters, funcStr);
                const newData = func(Enumerable, ...values)
                return newData
            } catch (syntaxError) {
                console.error('parsing function ', syntaxError)
                return []
            }
        } else {
            return []
        }
    }, [collections, funcStr]);


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
