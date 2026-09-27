import { useContext, useState } from "react";
import { DeviceContext } from "../context/DeviceContext";
import { useApi } from "../utils/useApi";
import { InputTextButtons } from "./InputTextButton";


function NewGroup({ setCreateNewGroup }) {

    const { update } = useContext(DeviceContext);

    const [groupName, setGroupName] = useState("");

    const api = useApi();

    const createNewGroup = async function() {
        if (!groupName) return;
        const group = await (await api('/api/newgroup', { method: "POST", body: JSON.stringify({group:{name: groupName}}) })).json();
        setGroupName("");
        update();
        setCreateNewGroup(false);
    }
    
    return (
        <div>
            <InputTextButtons
                text="Group name"
                onChange={setGroupName}
                bton1Func={() => createNewGroup()}
                bton2Func={() => setCreateNewGroup(false)}
                orientation="side"
            ></InputTextButtons>
        </div>
    );
}

export { NewGroup };