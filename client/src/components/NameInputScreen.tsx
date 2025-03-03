import { useEffect, useState } from "react";

export const NameInputScreen = (props: {
    sendInit: (name: string) => void;
    nameTaken: boolean;
}) => {
    const [name, setName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (props.nameTaken) {
            window.alert('Name already taken');
        }
        setLoading(false);
    }, [props.nameTaken])

    const submitName = () => {
        if (name.trim() === '') {
            window.alert('Please enter a name');
            return;
        }
        setLoading(true);
        props.sendInit(name);
    }

    return (
        <div className='name-input-container'>
            {
                loading ? (
                    <p>Checking name...</p>
                ) : (
                    <div className='input-container'>
                        <input
                            type='text'
                            value={name}
                            placeholder="Enter your name"
                            onChange={(e) => setName(e.target.value)}
                        />
                        <button
                            onClick={submitName}
                        >
                            Send
                        </button>
                    </div>
                )
            }
        </div>
    )
}