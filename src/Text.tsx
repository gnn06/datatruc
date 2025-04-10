import { Children, useRef, useState } from 'react';
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

export function Text({ text, errorMsg, onTextChange, onClose, collectionName = "", filenamePrefix = "function", mimeType = "text/javascript", children = undefined }) {
    
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
        const filename = filenamePrefix + '-' + collectionName + "." + fileExtension;
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
                <Tooltip title="Show help"><IconButton onClick={handleClick} disabled={children === undefined}><HelpIcon /></IconButton></Tooltip>
                <Tooltip title="Full screen"><IconButton onClick={() => setMaximize(true)}><FullscreenIcon /></IconButton></Tooltip>
                <Tooltip title="Close panel"><IconButton onClick={onClose}><CloseIcon /></IconButton></Tooltip>
            </Stack>
            <textarea value={text} onChange={onChange} ref={anchorRef}
                style={{
                    ...maximizeStyle,
                    whiteSpace: "nowrap", fontFamily: "monospace", resize: 'none'
                }}
            ></textarea>
            {errorMsg && <div style={{width:'30em', color:'red'}}>{errorMsg}</div>}
            <Popper open={showPopper} anchorEl={anchorRef.current} placement="right-start">
                <div style={{ padding: 10, background: "white", color: "black", border: "1px solid gray", width: "15em" }}>
                    {children}
                </div>
            </Popper>
            {isMaximize && <Tooltip title="Exit full screen"><IconButton sx={{ position: "absolute", top: "0", right: "0", zIndex: 1001, color: "black" }} onClick={() => setMaximize(false)}><FullscreenExitIcon /></IconButton></Tooltip>}
        </Stack>
    </Paper>


}