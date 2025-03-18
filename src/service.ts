import Enumerable from 'linq'

export function join(coll1, coll2) {
    const result = Enumerable
        .from(coll1)
        .leftJoin(coll2,
            outer => outer.vm,
            inner => inner.application,
            (outer, inner) => {
                return {
                    vm: outer.vm,
                    cve: outer.cve,
                    patchPolicy: inner?.patchPolicy ?? ''
                }
            }).toArray()
    return result
}