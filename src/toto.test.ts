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

const VM = [{vm:'titane7p',cve:123}]

const ApplicationPolicy = [{application:'titane7p',patch_policy:'patch lors du PCA'}]

test('should ', () => {
    console.log(VM)
    const data = Enumerable.from(VM).join(ApplicationPolicy, outer=>outer.vm, inner=>inner.application,(outer,inner)=>{return{vm:outer.vm, cve:outer.vm, patch_policy:inner.patch_policy}}).toArray()
    console.log(data)
});