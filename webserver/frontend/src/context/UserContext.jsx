import { useState, createContext, useEffect } from "react";

export const UserContext = createContext(null);

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/refresh', {
                    credentials: 'include',
                });
                if (res.ok) {
                    const data = await res.json();
                    
                    setUser(data.user);
                    setAccessToken(data.token);
                }
            }catch(err) {
                setUser(null);
                setAccessToken(null);
            }
        };
        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={ {user, setUser, accessToken, setAccessToken } }>
            { children }
        </UserContext.Provider>
    );
}