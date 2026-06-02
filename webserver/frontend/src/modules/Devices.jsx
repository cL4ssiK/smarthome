import { useState, useContext } from "react";
import { SubHeader } from "./SubHeader";
import { TextAndButton } from "./TextAndButton";
import { UserContext } from "../context/UserContext";
import { DeviceContext } from "../context/DeviceContext";
import { DeviceList } from "./DeviceList";



function Devices() {
    const { user } = useContext(UserContext);
    const { groups, devices } = useContext(DeviceContext);

    const [createNewDevice, setcreateNewDevice] = useState(false);
    const [selectedDevices, setSelectedDevices] = useState([]);
    const [activeGroup, setActiveGroup] = useState(0);

    const newDevice = function() {
        setcreateNewDevice(true);
        console.log("uusipaska");
    };

    const setActiveGroupAndDevices = function(index) {
        const actives = devices[groups[index].groupId];
        const d = actives ? actives : [];
        setSelectedDevices(d);
        setActiveGroup(groups[index].groupId);
        console.log("uudet laitteet", d);
    };

    return (
        <div>
            <SubHeader 
                setView={setActiveGroupAndDevices}
                elements={groups.map(group => group.name)}
            ></SubHeader>
            {
                createNewDevice ? <p>new device if here</p> :
                (
                <div>
                    <button onClick={() => newDevice()}
                    >new device</button>
                </div>
                )
            }
            <DeviceList 
                group={activeGroup}></DeviceList>
        </div>
    );
}

export { Devices };