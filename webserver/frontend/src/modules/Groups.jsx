import { useState, useContext } from "react";
import { SubHeader } from "./SubHeader";
import { TextAndButton } from "./TextAndButton";
import { UserContext } from "../context/UserContext";
import { NewGroup } from "./NewGroup";
import { GroupList } from "./GroupList";
import { useApi } from "../utils/useApi";
import { DeviceContext } from "../context/DeviceContext";


function Groups() {
    const { user } = useContext(UserContext);
    const [createNewGroup, setCreateNewGroup] = useState(false);

    const newGroup = function() {
        setCreateNewGroup(true);
    };

    return (
        <div>
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