import { useContext, useState } from "react";
import { DeviceContext } from "../context/DeviceContext";
import { useApi } from "../utils/useApi";


function NewGroup({ setCreateNewGroup }) {

    const { update } = useContext(DeviceContext);

    const [groupName, setGroupName] = useState("");

    const api = useApi();

    const createNewGroup = async function() {
        if (!groupName) return;
        const group = await (await api('/api/newgroup', { method: "POST", body: JSON.stringify({group:{name: groupName}}) })).json();
        setGroupName("");
        update();
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