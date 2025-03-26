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
    const [collections, setCollections] = useState([{collectionName: 'rows', collection:[]}])

    const onCollectionChange = (collection, key) => {
        const newCollections = produce(collections, draftCollections => {
            draftCollections[key] = collection
        })
        setCollections(newCollections);
    }

    const onAddCollection = () => {
        const newCollections = produce(collections, draftCollections => {
            draftCollections.push({ collectionName: 'rows', collection: [] })
        })
        setCollections(newCollections);
    }

    return (<div className='application' >        
        {Array.from(collections).map((value, index) => <CollectionCSV key={index} id={index} collections={collections} onCollectionChange={onCollectionChange} />)}
        <Button onClick={onAddCollection}>Ajouter collection</Button>
    </div>);
}
export default App
