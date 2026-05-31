import { useState, useContext } from "react";
import { SubHeader } from "./SubHeader";
import { TextAndButton } from "./TextAndButton";
import { UserContext } from "../context/UserContext";
import { NewGroup } from "./NewGroup";


function Groups() {
    const { user } = useContext(UserContext);
    const [createNewGroup, setCreateNewGroup] = useState(false);

    const newGroup = function() {
        setCreateNewGroup(true);
        console.log("uusipaska");
    };

    return (
        <div>
            {
                createNewGroup ? <NewGroup setCreateNewGroup={setCreateNewGroup}></NewGroup> :
                (
                <div>
                    <button onClick={() => newGroup()}
                    >new group</button>
                </div>
                )
            }
        </div>
    );
}

export { Groups };