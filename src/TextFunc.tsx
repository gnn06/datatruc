import { useState } from "react";

import { Text } from "./Text";
import { createFunc } from "./compute";

export function TextFunc({ collectionName, func, onTextChange, onClose }) {
    
    const [funcStr, setFuncStr] = useState(func);
    const [errorMsg, setErrorMsg] = useState("");

    
    const onInnerTextChange = (text: string) => {
        setFuncStr(text);
        try {
            createFunc(text, []);
            setErrorMsg("");
            onTextChange(text);
        } catch (error) {
            setErrorMsg(error.message);            
        }
    }

    return <Text text={funcStr} errorMsg={errorMsg} onTextChange={onInnerTextChange} onClose={onClose}
        mimeType="text/javascript" filenamePrefix="function" collectionName={collectionName} >
        <>
            <p>You can use native javascript and <a href="https://github.com/mihaifm/linq" target='_blank'>linq</a> library.</p>
            <p>You need to return an array of objects, each of its properties representing a column.</p>
            <p>The current collection is accessible via <code>rows</code> and other collections are accessible by name. Put collections that are used by others first to resolve dependencies.</p>
            <p>Example : <code><br />return Enumerable.from(rows)<br />
                .select(row =&gt; (&#123;...row,&nbsp;prop: row.value * 2 &#125;)).toArray();</code></p>
            <p>Example de jointure : <br />
                <code>return Enumerable.from(coll1)<br />
                    .leftJoin(coll2,<br />
                    left =&gt; left.prop1,<br />
                    right =&gt; right.prop2,<br />
                    (left, right) =&gt; &#123;...&#125;)</code></p>
                    </>
    </Text>

}