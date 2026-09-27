import { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import { SubHeader } from "./SubHeader";
import { Login } from "./Login";
import styles from "./MainMenu.module.css";

function MainMenu() {

    const { user } = useContext(UserContext);

    const defaultView = (<div className={styles.defaultViewDiv}>
                            <h1>Welcome to smarthome hub!</h1>
                            {user && <p>Hello {user.username}</p>}
                        </div>);

    const [view, setView] = useState(0);
    const views = [defaultView, <Login/>,];
    const headerTexts = ["main", "Login"];
    
    return (
        <div>
            <SubHeader
                setView={setView}
                elements={headerTexts}>
            </SubHeader>
            {views[view]}
        </div>
    );
};

export { MainMenu };