return Enumerable
    .from(VM)
    .leftJoin(patch_policies,
        outer => outer.vm.replace(/([0-9]+p?(.zone.local)?)/g, ''),
        inner => inner.application,
        (outer, inner) => {
            return {
                vm: outer.vm,
                cve: outer.cve,
                patchPolicy: inner?.patchPolicy ?? ''
            }
        }).toArray();