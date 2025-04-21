import { expect, test } from 'vitest'
import Enumerable from 'linq'
import { join } from './service';
import { b } from 'vitest/dist/chunks/suite.qtkXWc6R.js';

type VM_Row = {
    vm: string;
    cve: string;
}

type ApplicationPolicyRow = {
    application: string;
    patch_policy: string;
}


test('poc linq ', () => {
    const givenVM = [{ vm: 'titane7p', cve: 123 }, { vm: 'nickel-cms1', cve: 12 }]

    const givenApplicationPolicy = [{ application: 'titane7p', patchPolicy: 'patch lors du PCA' }]

    const expected = [{
        "vm": "titane7p",
        "cve": 123,
        "patchPolicy": "patch lors du PCA",
    }, {
        "vm": "nickel-cms1",
        "cve": 12,
        "patchPolicy": "",

    }]
    const result = join(givenVM, givenApplicationPolicy)
    expect(result).toEqual(expected)
});

test('test except ', () => {
    const given1 = [{p1:1}, {p1:2}, {p1:3}];
    const given2 = [{p1:2}];
    const result = Enumerable
            .from(given1)
            .except(given2, (a) => a.p1)
            .toArray()
    expect(result).toEqual([{p1:1}, {p1:3}])
});