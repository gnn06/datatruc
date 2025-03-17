import { expect, test } from 'vitest'
import App from './App';
import { join } from './service';

type VM_Row = {
    vm: string;
    cve: string;
}

type ApplicationPolicyRow = {
    application: string;
    patch_policy: string;
}


test('should ', () => {
    const givenVM = [{ vm: 'titane7p', cve: 123 }, { vm: 'nickel-cms1', cve: 12 }]

    const givenApplicationPolicy = [{ application: 'titane7p', patch_policy: 'patch lors du PCA' }]

    const expected = [{
        "vm": "titane7p",
        "cve": 123,
        "patch_policy": "patch lors du PCA",
    }, {
        "vm": "nickel-cms1",
        "cve": 12,
        "patch_policy": "",

    }]
    const result = join(givenVM, givenApplicationPolicy)
    expect(result).toEqual(expected)
});