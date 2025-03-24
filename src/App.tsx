import './App.css'
import { useState } from 'react'

import { produce, enableMapSet } from "immer"
import { Button } from '@mui/material';

import { CollectionFunc } from './CollectionFunc';
import { CollectionCSV } from './CollectionCSV';

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
    const [collections, setCollections] = useState(new Map())
    const [collectionName, setCollectionName] = useState("")

    const onCollectionChange = (list, collectionName) => {
        const newCollections = produce(collections, draftCollections => {
            draftCollections.set(collectionName, list)
        })
        setCollections(newCollections);
    }

    const onNameChange = (e) => {
        const value = e.target.value;
        setCollectionName(value)
    }

    const onAddCollection = () => {
        const newCollections = produce(collections, draftCollections => {
            draftCollections.set(collectionName, [])
        })
        setCollections(newCollections);
        setCollectionName("")
    }

    return (<>
        <CollectionFunc collections={collections} />
        {Array.from(collections).map(([key, value]) => <CollectionCSV key={key} collectionName={key} collections={collections} onCollectionChange={onCollectionChange} />)}
        Collection name : <input type="text" value={collectionName} onChange={onNameChange} />
        <Button onClick={onAddCollection}>Ajouter collection</Button>
    </>);
}
export default App
