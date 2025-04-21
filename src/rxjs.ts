import { BehaviorSubject, combineLatest, map } from 'rxjs';

import { Collection } from './data.ts';
import { getData, getDependencies } from './compute.ts';

export interface CollectionSubject {
    collection$: BehaviorSubject<any[]>,
    func$: BehaviorSubject<string>,
    result$: BehaviorSubject<any[]>,
    collection: Collection
};

export function getObsNew(coll: Collection): CollectionSubject {
    const coll$ = {
        collection$: new BehaviorSubject(coll.rows),
        func$: new BehaviorSubject(coll.func),
        result$: new BehaviorSubject([]),
        collection: coll
    };
    return coll$;
}

// export function getObs(coll: Collection): CollectionSubject {
//     const coll$ = {
//         coll: coll,
//         collection$: new BehaviorSubject(coll.collection),
//         func$: new BehaviorSubject(coll.func),
//         result$: new BehaviorSubject([])
//     };
//     coll$.result$ = combineLatest([coll$.collection$, coll$.func$]).pipe(
//         map(([collection, func]) => {
//             console.log('combine', collection, func)
//             return getData(func, collection, []);
//         })
//     ).subscribe((value) => {
//         console.log('update transformedCollection')
//         coll.transformedCollection = value;
//     });
//     return coll$;
// }

export function getAllObs(colls: Collection[]): CollectionSubject[] {
    return colls.map((coll) => getObs(coll));
}

export function getAllObsWithDep(colls: Collection[]): CollectionSubject[] {
    const obs$ = colls.map(el => getObsNew(el));
    for (const el of obs$) {
        const dependencies = getDependencies(el.collection.func, colls.map(el => el.collectionName));
        const dependencies$ = getDepSubjects(dependencies, obs$);
        // console.log('create observator');
        el.result$ = combineLatest([el.collection$, el.func$].concat(dependencies$))
            .pipe(map(([rows, func, depsResult]) => {
                const deps:Collection[] = [{collectionName:dependencies, rows: depsResult}];
                // console.log('post combineLatest','deps=',deps)
                return getData(func, rows, deps)
            }));
        // do not subscribe immedialtly on pipe()
        // el.result$.subscribe((value) => {
        //         console.log('flux, propafate transformedCollection', value)
        //         el.collection.transformedCollection = value;
        //     })
    }
    return obs$;
}

export function getDepSubjects(deps: string[], allSubjects$: CollectionSubject[]) {
    return deps.map(dep => {
        const subject = allSubjects$.find(el => el.collection.collectionName === dep);
        return subject?.result$;
    })
}