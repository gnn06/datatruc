import FilePicker from '@ihatecode/react-file-picker';
import { Button, IconButton, Paper, Stack, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

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

    return <Stack sx={{ height: "100%" }} >
        <Paper sx={{ p: 1 }}>
            <Stack direction="row" spacing={1} >
                <FilePicker
                    multiple={false}
                    accept="text/javascript"
                    onChange={(files) => onUpload(files)}
                >
                    <Button>Charger</Button>
                </FilePicker>
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </Stack>
            <TextField slotProps={{ input: { sx: { width: "100%", height: "100%", 
                fontFamily: "monospace", overflowX: "auto", whiteSpace:"nowrap" } } }} 
                multiline value={funcBody} onChange={onChange}></TextField>
        </Paper>
    </Stack>

}