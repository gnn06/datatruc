import { BehaviorSubject, combineLatest, map } from 'rxjs';

import { Collection } from './data.ts';
import { getData, getDependencies } from './compute.ts';

export function getObsArray(colls: Collection[]) {
    return colls.map((coll) => getObs(coll));
}

export interface CollectionSubject {
    name: string,
    collection$: BehaviorSubject<any[]>,
    func$: BehaviorSubject<string>,
    result$: BehaviorSubject<any[]>
};

export function getObs(coll: Collection): collectionSubject {
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

export function getDepSubjects(deps:string[], allSubjects$:CollectionSubject[]) {
    return deps.map(dep => {
        const subject = allSubjects$.find(el => el.name === dep);
        return subject?.result$;
    })

}