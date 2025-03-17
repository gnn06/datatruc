import { expect, test } from 'vitest'
import Enumerable from 'linq'

type VM_Row = {
    vm: string;
    cve: string;
}

type ApplicationPolicyRow = {
    application: string;
    patch_policy: string;
}

const VM = [{ vm: 'titane7p', cve: 123 }, { vm: 'nickel-cms1', cve: 12 }]

const ApplicationPolicy = [{ application: 'titane7p', patch_policy: 'patch lors du PCA' }]

test('should ', () => {
    const expected = [{
        "vm": "titane7p",
        "cve": 123,
        "patch_policy": "patch lors du PCA",
    }, {
        "vm": "nickel-cms1",
        "cve": 12,
        "patch_policy": "",

    }]
    const result = Enumerable
        .from(VM)
        .leftJoin(ApplicationPolicy,
            outer => outer.vm,
            inner => inner.application,
            (outer, inner) => {
                return {
                    vm: outer.vm,
                    cve: outer.cve,
                    patch_policy: inner?.patch_policy ?? ''
                }
            }).toArray()
    expect(result).toEqual(expected)
});