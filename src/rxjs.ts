import { BehaviorSubject, combineLatest, map, merge, switchMap } from 'rxjs';

import { Collection } from './data.ts';
import { getData, getDependencies } from './compute.ts';

export interface CollectionSubject {
    collection$: BehaviorSubject<unknown[]>,
    func$: BehaviorSubject<string>,
    name$: BehaviorSubject<string>,
    result$: BehaviorSubject<unknown[]>,
    collection: Collection
};

export function getObsNew(coll: Collection): CollectionSubject {
    const coll$ = {
        collection$: new BehaviorSubject<unknown[]>(coll.rows),
        func$: new BehaviorSubject(coll.func),
        name$: new BehaviorSubject(coll.collectionName),
        result$: new BehaviorSubject<unknown[]>([]),
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

// export function getAllObs(colls: Collection[]): CollectionSubject[] {
//     return colls.map((coll) => getObs(coll));
// }

export function getAllObsWithDep(colls: Collection[]): CollectionSubject[] {
    const obs$ = colls.map(el => getObsNew(el));
    const names$ = merge(...obs$.map(el => el.name$));
    for (const el of obs$) {
         el.result$ = combineLatest([el.func$, names$]).pipe(
            map(([func, names]) => getDependencies(func, obs$.map(el => el.name$.getValue()))),
            switchMap((deps) => {
                const dependencies$ = getDepSubjects(deps, obs$);
                return combineLatest([el.collection$, el.func$].concat(dependencies$))
                    .pipe(map(([rows, func, ...depsResult]) => {
                        const depsCollection: Collection[] = deps.map((dep, i) => ({ collectionName: dep, rows: depsResult[i], func: '' }));
                        return getData(func, rows, depsCollection)
                    }))
            })
        );
    }
    return obs$;
}

export function getDepSubjects(deps: string[], allSubjects$: CollectionSubject[]) {
    return deps.map(dep => {
        const subject = allSubjects$.find(el => el.name$.getValue() === dep);
        return subject?.result$;
    })
}

export function getCollectionFromObs(obs: CollectionSubject[]): Collection[] {
    const result = obs.map((el => {
        const obs: Collection = {
            collectionName: el.name$.getValue(),
            rows: el.collection$.getValue(),
            func: el.func$.getValue(),
        };
        return obs;
    }));
    return result
}

export function mergeCollectionObs(givenObs: CollectionSubject[]) {
    const flatObs = givenObs.reduce((acc, el) => acc.concat(el.collection$, el.func$, el.name$), [])

    const result = merge(...flatObs);

    return result;
}
