return Enumerable
    .from(rows)
    .leftJoin(patch_policies,
        left => left.vm.replace(/([0-9]+p?(.zone.local)?)/g, ''),
        right => right.application,
        (left, right) => {
            return {
                ...left,
                application: right?.application ?? '',
                patchPolicy: right?.patchPolicy ?? ''
            }
        }).toArray();