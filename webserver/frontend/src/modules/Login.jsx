import { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import { useLogout } from "../utils/authentication";
import styles from "./Login.module.css";

function Login() {

    const userContext = useContext(UserContext);

    const [userInfo, setUserInfo] = useState({
        username: "",
        pswd1: "",
        pswd2: "",
    });

    const [logIn, setLogIn] = useState(false);

    const logout = useLogout();

    const login = async function() {
        console.log("login");
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Tells the server we are sending JSON
                },
                body: JSON.stringify(userInfo), // Turns your JS object into a string
            });

            if (!response.ok)
                throw new Error('Login failed');

            const data = await response.json();
            
            if (!data.user || !data.token) 
                throw new Error('Login failed');
            //TODO: Is there better way to do this, so i would not have to manually touch the user state setter
            userContext.setUser(data.user);
            userContext.setAccessToken(data.token);

        } catch (error) {
            console.error('Error:', error);
        }
    };

    const register = async function() {
        console.log("register");
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Tells the server we are sending JSON
                },
                body: JSON.stringify(userInfo), // Turns your JS object into a string
            });

            if (!response.ok) {
                throw new Error('Registration failed');
            }

            const data = await response.json();
            console.log('Success:', data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleChange = function(e) {
        const { name, value } = e.target;

        setUserInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    return (
        <div className={styles.div}>
            { !userContext.user ? (
            <>
            <div className={styles.innerDiv}>
                <label>
                    username
                    <input
                        className={`${styles.input} ${logIn ? styles.shortInput : ""}`}
                        name="username"
                        onChange={handleChange}>
                    </input>
                </label>
                <label>
                    password
                    <input
                        className={`${styles.input} ${logIn ? styles.shortInput : ""}`}
                        name="pswd1"
                        type="password"
                        onChange={handleChange}>
                    </input>
                </label>
                {logIn && (
                <label>
                    re-type password
                    <input
                        className={styles.input}
                        name="pswd2"
                        type="password"
                        onChange={handleChange}>
                    </input>
                </label>
                )}
            </div>
            <button onClick={e => logIn ? register() : login()}>{logIn ? "register" : "login"}</button>
            </>
            ) : (<button onClick={e => logout()}>Logout</button>) }
            {
                userContext.user ? "" :
                <label onClick={e => setLogIn(!logIn)}>
                    {logIn ? "log in" : "no account?"}
                </label>
            }
        </div>
    );

}

export { Login };