import './App.css'
import { useState } from 'react'

import { produce, enableMapSet } from "immer"
import { Button } from '@mui/material';

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
    const [collections, setCollections] = useState([])

    const onCollectionChange = (collection) => {
        const newCollections = produce(collections, draftCollections => {
            const index = draftCollections.findIndex(item => item.collectionName === collection.collectionName)
            draftCollections.splice(index, 1)
            draftCollections.push(collection)
        })
        setCollections(newCollections);
    }

    const onAddCollection = () => {
        const newCollections = produce(collections, draftCollections => {
            draftCollections.push({ collectionName: 'rows', collection: [] })
        })
        setCollections(newCollections);
    }

    return (<>
        
        {Array.from(collections).map((value, index) => <CollectionCSV key={index} collections={collections} onCollectionChange={onCollectionChange} />)}
        <Button onClick={onAddCollection}>Ajouter collection</Button>
    </>);
}
export default App
