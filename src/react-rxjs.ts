import { useEffect, useState } from "react";

export function useObservable(obs$, initialValue) {
    const [value, setValue] = useState(initialValue);
    useEffect(() => {
        const subscription = obs$.subscribe((value) => {
            // console.log('useObservable')
            setValue(value);
        });
        return () => subscription.unsubscribe();
    }, [obs$])
    return value;
}
