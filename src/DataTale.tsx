import { useMemo } from 'react';
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { MaterialReactTable, MRT_Row, useMaterialReactTable } from "material-react-table";
import { produce } from "immer";

import { Collection } from './data';

interface DataTableProps {
    data: Collection[],
    onRowsChange: (collection: Collection[]) => void,
    onCSV_Import: () => void,
    onFuncShow: () => void,
};


export function DataTable({ data, onRowsChange, onCSV_Import, onFuncShow }: DataTableProps) {

    const columnsPatchPolicies = useMemo(() => {
        const headers = data.length > 0 ? Object.keys(data[0]) : []
        return headers.map(el => ({ accessorKey: el, header: el }))
    }, [data]);

    const rows = data;

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
            //setRows(newRows)
            onRowsChange(newRows);
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
            // setRows(newRows)
            onRowsChange(newRows);
            table.setCreatingRow(null);
        },
        renderTopToolbarCustomActions: ({ table }) => (<>
            <Tooltip title="Ajouter une ligne">
                <IconButton onClick={() => { table.setCreatingRow(true) }}>
                    <AddIcon />
                </IconButton>
            </Tooltip>
            <Button onClick={onCSV_Import}>Import / Export</Button>
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

    const onDeleteRow = (row: MRT_Row<Collection>) => {
        if (window.confirm('Are you sure you want to delete this row?')) {
            const index = row.index
            const newRows = produce(rows, draftRows => {
                draftRows.splice(index, 1)
            })
            // setRows(newRows)
            onRowsChange(newRows);
        }
    }

    return <MaterialReactTable table={tablePatchPolicies} />
}