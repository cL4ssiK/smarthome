import { useContext, useState } from "react";
import { DeviceContext } from "../context/DeviceContext";


function NewGroup({ setCreateNewGroup }) {

    const deviceContext = useContext(DeviceContext);

    const [groupName, setGroupName] = useState("");

    const createNewGroup = function() {
        if (!groupName) return;
        console.log("new group: " + groupName);       
    }
    
    return (
        <div>
            <label>
                group name
                <input onChange={(e) => setGroupName(e.target.value)}
                ></input>
            </label>
            <button onClick={() => createNewGroup()}>Confirm</button>
            <button onClick={() => setCreateNewGroup(false)}>Cancel</button>
        </div>
    );
}

export { NewGroup };