import { useState } from 'react';
import { produce, enableMapSet } from "immer"
import { Box, Button } from '@mui/material';

import './App.css'
import { CollectionCSV } from './CollectionCSV';
import { getAllObsWithDep, getCollectionFromObs as getCollectionFromObs, mergeCollectionObs } from './rxjs';
import { Collection } from './data';
import { restoreCollections } from './persist';

enableMapSet();

function App() {
    const [collections, setCollections] = useState<Collection[]>(restoreCollections());
    const collections$ = getAllObsWithDep(collections);

    const merge$ = mergeCollectionObs(collections$);
    merge$.subscribe(() => {
        const collection = getCollectionFromObs(collections$);
        localStorage.setItem('collections', JSON.stringify(collection));
    });

    const onAddCollection = () => {
        const newCollections = produce(getCollectionFromObs(collections$), (draftCollections) => {
            const newCollection:Collection = { collectionName: 'rows' + collections.length, rows: [], func:'' };
            draftCollections.push(newCollection)
        })
        setCollections(newCollections);
    }

    const onDeleteCollection = (index:number) => {
        const newCollections = produce(getCollectionFromObs(collections$), (draftCollections) => {
            draftCollections.splice(index,1)
        })
        setCollections(newCollections);
    }

    return (<Box>
        {Array.from(collections).map((value, index) => <CollectionCSV key={index} id={index} collections={collections}
            onDelete={onDeleteCollection} collectionsObs={collections$}/>)}
        <Button sx={{ mt: 1 }} onClick={onAddCollection}>Ajouter collection</Button>
    </Box>);
}
export default App
