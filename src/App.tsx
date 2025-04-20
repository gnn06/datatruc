import './App.css'
import createPersistedState from 'use-persisted-state';

import { produce, enableMapSet } from "immer"
import { Box, Button } from '@mui/material';

import { CollectionCSV } from './CollectionCSV';
import { Collection } from './data';

enableMapSet();

const usePersitCollectionState = createPersistedState<Collection[]>('collections');

function App() {
    const [collections, setCollections] = usePersitCollectionState([{ collectionName: 'rows0', rows: [], func: '' }])

    const onCollectionChange = (collection: Collection, id: number) => {
        const newCollections = produce(collections, (draftCollections) => {
            draftCollections[id] = collection
        })
        setCollections(newCollections);
    }

    const onAddCollection = () => {
        const newCollections = produce(collections, (draftCollections) => {
            const newCollection:Collection = { collectionName: 'rows' + collections.length, rows: [], func:'' };
            draftCollections.push(newCollection)
        })
        setCollections(newCollections);
    }

    const onDeleteCollection = (index:number) => {
        const newCollections = produce(collections, (draftCollections) => {
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
