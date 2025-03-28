import FilePicker from '@ihatecode/react-file-picker';
import { Button, IconButton, Paper, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { saveAs } from "file-saver";

export function Func({ funcBody, onFuncBodyChange, onClose }) {

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

    return <Paper >
        <Stack sx={{ height: "100%" }}>
            <Stack direction="row" spacing={1} >
                <FilePicker
                    multiple={false}
                    accept="text/javascript"
                    onChange={(files) => onUpload(files)}><Button>Open</Button>
                </FilePicker>
                <Button onClick={onDownload}>Save</Button>
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </Stack>
            <textarea value={funcBody} onChange={onChange}
                style={{ margin: "4px", height: "100%", width: "30em",
                whiteSpace: "nowrap", fontFamily: "monospace", resize: 'none' }}
                ></textarea>
        </Stack>
    </Paper>


}