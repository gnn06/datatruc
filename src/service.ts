import Enumerable from 'linq'

export function join(VM, patch_policies) {
    const result = Enumerable
        .from(VM)
        .leftJoin(patch_policies,
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