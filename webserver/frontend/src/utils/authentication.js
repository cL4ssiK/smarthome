import { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useApi } from './useApi';

export const useLogout = function() {
    const { setAccessToken, setUser } = useContext(UserContext);
    const api = useApi();

    const logOut = async function() {
        try {
            await api('/api/logout', { method: "POST" });
        }finally {
            setUser(null);
            setAccessToken(null);
        }
    };

    return logOut;
};