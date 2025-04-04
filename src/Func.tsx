import { useRef, useState } from 'react';
import { Button, IconButton, Paper, Popper, Stack, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import HelpIcon from '@mui/icons-material/Help';
import FilePicker from '@ihatecode/react-file-picker';
import { saveAs } from "file-saver";
import db from 'mime-db';

function getExtensionFromMimeType(mimeType) {
    const entry = db[mimeType];
    if (entry && entry.extensions && entry.extensions.length > 0) {
        return entry.extensions[0]; // souvent la plus courante
    }
    return null;
}


export function Func({ text, onTextChange, onClose, filenamePrefix = "function", mimeType = "text/javascript" }) {

    const [isMaximize, setMaximize] = useState(false);
    const [showPopper, setShowPopper] = useState(false);

    const onChange = (e) => {
        onTextChange(e.target.value);
    };

    const onUpload = (files) => {
        const file = files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const funcStr = e.target.result;
                onTextChange(funcStr);
            };
            reader.readAsText(file);
        }
    };

    const onDownload = () => {
        const fileExtension = getExtensionFromMimeType(mimeType);
        const filename = filenamePrefix + "." + fileExtension;
        const blob = new Blob([text], { type: mimeType });
        saveAs(blob, filename);
    };

    const maximizeStyle = isMaximize ? {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#f0f0f0",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    } : {
        height: "100%",
        width: "30em",
        margin: "4px"
    };

    const handleClick = (event) => {
        setShowPopper(!showPopper);
    };


    const anchorRef = useRef(null);

    return <Paper >
        <Stack sx={{ height: "100%" }}>
            <Stack direction="row" spacing={1} >
                <FilePicker
                    multiple={false}
                    accept={mimeType}
                    onChange={(files) => onUpload(files)}><Button>Open</Button>
                </FilePicker>
                <Button onClick={onDownload}>Save</Button>
                <Tooltip title="Show help"><IconButton onClick={handleClick}><HelpIcon /></IconButton></Tooltip>
                <Tooltip title="Full screen"><IconButton onClick={() => setMaximize(true)}><FullscreenIcon /></IconButton></Tooltip>
                <Tooltip title="Close panel"><IconButton onClick={onClose}><CloseIcon /></IconButton></Tooltip>
            </Stack>
            <textarea value={text} onChange={onChange} ref={anchorRef}
                style={{
                    ...maximizeStyle,
                    whiteSpace: "nowrap", fontFamily: "monospace", resize: 'none'
                }}
            ></textarea>
            <Popper open={showPopper} anchorEl={anchorRef.current} placement="right-start">
                <div style={{ padding: 10, background: "white", color: "black", border: "1px solid gray", width: "15em" }}>
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
                </div>
            </Popper>
            {isMaximize && <Tooltip title="Exit full screen"><IconButton sx={{ position: "absolute", top: "0", right: "0", zIndex: 1001, color: "black" }} onClick={() => setMaximize(false)}><FullscreenExitIcon /></IconButton></Tooltip>}
        </Stack>
    </Paper>


}