import { useContext } from 'react';
import { UserContext } from '../context/UserContext';


/**
 * Function to handle refreshing accesstokens
 * @returns custom request function
 */
export const useApi = () => {
  const { accessToken, setAccessToken, setUser } = useContext(UserContext);

  const request = async (url, options = {}) => {
    //Attach the current token from context
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
    options.credentials = 'include'; // Ensure the Refresh Cookie is sent

    let response = await fetch(url, options);

    if (response.status === 401) {
      //Try to get new token
      const refreshRes = await fetch('/api/refresh', { 
        method: 'POST', 
        credentials: 'include' 
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        const newToken = data.token;

        setAccessToken(newToken);
        setUser(data.user);

        //Retry the original request
        options.headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, options);
      } else {
        //Refresh token failed/expired
        setUser(null);
        setAccessToken(null);
      }
    }

    return response;
  };

  return request;
};