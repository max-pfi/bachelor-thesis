import { useEffect, useState } from "react";
import { Chat } from "../data/types";
import { SERVER_URL } from "../data/const";


export function useChats() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<boolean>(false);

    const fetchChats = async () => {
        try {
            setLoading(true);
            setError(false);
            const response = await fetch(`${SERVER_URL}/chats`, {
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data : Chat[] = await response.json();
            setChats(data);
        } catch (error) {
            console.log(error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChats();
    }, []);

    return { chats, loading, error, fetchChats };
}