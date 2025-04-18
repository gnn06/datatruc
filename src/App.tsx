import './App.css'
import { useState } from 'react'
import createPersistedState from 'use-persisted-state';

import { produce, enableMapSet } from "immer"
import { Box, Button } from '@mui/material';

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

const usePersitCollectionState = createPersistedState('collections');

function App() {
    const [collections, setCollections] = usePersitCollectionState([{ collectionName: 'rows0', collection: [] }])

    const onCollectionChange = (collection, key) => {
        const newCollections = produce(collections, draftCollections => {
            draftCollections[key] = collection
        })
        setCollections(newCollections);
    }

    const onAddCollection = () => {
        const newCollections = produce(collections, draftCollections => {
            draftCollections.push({ collectionName: 'rows' + collections.length, collection: [] })
        })
        setCollections(newCollections);
    }

    const onDeleteCollection = (index:number) => {
        const newCollections = produce(collections, draftCollections => {
            draftCollections.splice(index)
        })
        setCollections(newCollections);
    }

    return (<Box>
        {Array.from(collections).map((value, index) => <CollectionCSV key={index} id={index} collections={collections} 
            onCollectionChange={onCollectionChange} onDelete={onDeleteCollection} />)}
        <Button sx={{ mt: 1 }} onClick={onAddCollection}>Ajouter collection</Button>
    </Box>);
}
export default App
