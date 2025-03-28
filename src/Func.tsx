import { useState } from 'react';
import { Button, IconButton, Paper, Stack, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import FilePicker from '@ihatecode/react-file-picker';
import { saveAs } from "file-saver";

export function Func({ funcBody, onFuncBodyChange, onClose }) {

    const [isMaximize, setMaximize] = useState(false);

    const onChange = (e) => {
        onFuncBodyChange(e.target.value);
    };

    const onUpload = (files) => {
        const file = files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const funcStr = e.target.result;
                onFuncBodyChange(funcStr);
            };
            reader.readAsText(file);
        }
    };

    const onDownload = () => {
        const filename = "function.js";
        const blob = new Blob([funcBody], { type: "text/javascript" });
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

    return <Paper >
        <Stack sx={{ height: "100%" }}>
            <Stack direction="row" spacing={1} >
                <FilePicker
                    multiple={false}
                    accept="text/javascript"
                    onChange={(files) => onUpload(files)}><Button>Open</Button>
                </FilePicker>
                <Button onClick={onDownload}>Save</Button>
                <Tooltip title="Full screen"><IconButton onClick={() => setMaximize(true)}><FullscreenIcon /></IconButton></Tooltip>
                <Tooltip title="Close panel"><IconButton onClick={onClose}><CloseIcon /></IconButton></Tooltip>
            </Stack>
            <textarea value={funcBody} onChange={onChange}
                style={{
                    ...maximizeStyle,
                    whiteSpace: "nowrap", fontFamily: "monospace", resize: 'none'
                }}
            ></textarea>
            {isMaximize && <Tooltip title="Exit full screen"><IconButton sx={{ position: "absolute", top: "0", right: "0", zIndex: 1001, color: "black" }} onClick={() => setMaximize(false)}><FullscreenExitIcon /></IconButton></Tooltip>}
        </Stack>
    </Paper>


}