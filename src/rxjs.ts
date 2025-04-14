import { BehaviorSubject, combineLatest, map } from 'rxjs';

import { Collection } from './data.ts';
import { getData, getDependencies } from './compute.ts';
import { Collections as rows } from '@mui/icons-material';

export interface CollectionSubject {
    name: string,
    collection$: BehaviorSubject<any[]>,
    func$: BehaviorSubject<string>,
    result$: BehaviorSubject<any[]>
};

export function getObsNew(coll: Collection): CollectionSubject {
    const coll$ = {
        name: coll.collectionName,
        collection$: new BehaviorSubject(coll.collection),
        func$: new BehaviorSubject(coll.func),
        result$: new BehaviorSubject([]),
        collection: coll
    };
    return coll$;
}

export function getObs(coll: Collection): CollectionSubject {
    const coll$ = {
        name: coll.collectionName,
        collection$: new BehaviorSubject(coll.collection),
        func$: new BehaviorSubject(coll.func),
        result$: new BehaviorSubject([])
    };
    coll$.result$ = combineLatest([coll$.collection$, coll$.func$]).pipe(
        map(([collection, func]) => {
            // console.log('combine', collection, func)
            return getData(func, collection, []);
        })
    ).subscribe((value) => {
        coll.transformedCollection = value;
    });
    return coll$;
}

export function getAllObs(colls: Collection[]): CollectionSubject[] {
    return colls.map((coll) => getObs(coll));
}

export function getAllObsWithDep(colls: Collection[]): CollectionSubject[] {
    const obs$ = colls.map(el => getObsNew(el));
    for(const el of obs$) {
        const dependencies = getDependencies(el.collection.func, colls.map(el => el.collectionName));
        console.log('dependencies of ', el.collection.collectionName, ' ', dependencies)
        const dependencies$ = getDepSubjects(dependencies, obs$);
        el.result$ = combineLatest([el.collection$, el.func$].concat(dependencies$))
            .pipe(map(([rows, func, foo]) => {
                return getData(func, rows, colls)
            }))
            .subscribe((value) => {
                el.collection.transformedCollection = value;
            })
    }
    return obs$;
}

export function getDepSubjects(deps: string[], allSubjects$: CollectionSubject[]) {
    return deps.map(dep => {
        const subject = allSubjects$.find(el => el.name === dep);
        return subject?.result$;
    })
}