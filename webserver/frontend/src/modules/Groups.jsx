import { useState, useContext } from "react";
import { NewGroup } from "./NewGroup";
import { GroupList } from "./GroupList";
import styles from "./Groups.module.css";


function Groups() {
    const [createNewGroup, setCreateNewGroup] = useState(false);

    const newGroup = function() {
        setCreateNewGroup(true);
    };

    return (
        <div className={styles.outerDiv}>
            { createNewGroup ? <NewGroup setCreateNewGroup={setCreateNewGroup}></NewGroup> :
                (<div>
                    <button onClick={() => newGroup()}
                    >new group</button>
                </div>)}
            <GroupList></GroupList>
        </div>
    );
}

export { Groups };