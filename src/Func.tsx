import FilePicker from '@ihatecode/react-file-picker';
import { Button } from '@mui/material';

export function Func({ funcBody, onFuncBodyChange }) {

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

    return <>
        <FilePicker
            multiple={false}
            accept="text/javascript"
            onChange={(files) => onUpload(files)}
        >
            <Button>Charger function</Button>
        </FilePicker>
        <textarea value={funcBody} onChange={onChange}></textarea>
    </>
}