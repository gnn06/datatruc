import './App.css'
import { useMemo } from 'react'
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import Enumerable from 'linq'

type VM_Row = {
  vm: string;
  cve: string;
}

type ApplicationPolicyRow = {
  application: string;
  patch_policy: string;
}

type Row = {
  vm: string;
  cve: string;
  application: string;
  patch_policy: string;
};

function App() {
  const columns = useMemo<MRT_ColumnDef<Row>[]>(
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
        accessorKey: 'patch_policy',
        header: 'patch_policy',
        size: 150,
      },
    ],
    [],
  );

  const VM: Array<VM_Row> = [{vm:'titane7p',cve:'1234'}]

  const ApplicationPolicy: Array<ApplicationPolicyRow> = [{application:'titane7p',patch_policy:'patch lors du PCA'}]
  
  const data = Enumerable.from(VM).join(ApplicationPolicy, 
    outer=>outer.vm, inner=>inner.application,
    (outer, inner)=>{}).log().toArray()

  console.log(data)
  // const data: Row[] = [
  //   {
  //     vm: 'titane7p',
  //     cve: '2134',
  //     application: 'bdd_prod',
  //     patch_policy: 'patch lors du PCA',
  //   },
  // ];

  const table = useMaterialReactTable({
    columns,
    data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
  });
  return <MaterialReactTable table={table} />;
}
export default App
