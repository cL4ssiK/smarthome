import { useContext, useState, useEffect } from "react";
import { DeviceContext } from "../context/DeviceContext";
import { WebSocketContext } from "../context/WebSocketContext";
import { DeviceFunctionsForm } from "./deviceFunctionsForm";
import { InputTextButton } from "./InputTextButton";
import { useApi } from '../utils/useApi';
import styles from "./GroupList.module.css";
import { ReactComponent as CoffeemakerIMG } from "../images/coffeemakerFallout4.svg";
import { TextAndButton, Text } from "./TextAndButton";
import { UserContext } from "../context/UserContext";

function GroupList() {
    const {groups, loading, update} = useContext(DeviceContext);
    const {user} = useContext(UserContext);

    const [openGroups, setOpenGroups] = useState([]);

    const [newUser, setNewUser] = useState(false);
    const [newUserName, setNewUserName] = useState("");

    const api = useApi();

    useEffect(() => {
        if (!groups) return;

        setOpenGroups(prevOpenGroups => 
            groups?.map(group => {
                const prevToggleState = prevOpenGroups?.find(g => g.groupId == group.groupId);
                return { 
                    groupId: group.groupId, 
                    toggled: prevToggleState ? prevToggleState.toggled : false 
                };
            })
        );
    }, [groups]);

    function changeOpenGroups(groupId){
        setOpenGroups(prevOpenGroups => prevOpenGroups.map(group =>
            group.groupId == groupId ? {...group, toggled: !group.toggled} : group
        ));
    }

    function handleClick(groupId){
        changeOpenGroups(groupId);
    }

    async function removeUserFromGroup(username, groupId) {
        console.log("removed user: " + username);
        const response = await api('/api/group/removeUser', { method: "POST", body: JSON.stringify({groupId: groupId, user: username}) });
        if (response.status) {
            console.log("success");
            update();
        }
    }

    async function addUserToGroup(username, groupId) {
        console.log("added user: " + username + " to group: " + groupId, groupId);
        const response = await api('/api/group/newUser', { method: "POST", body: JSON.stringify({groupId: groupId, user: username}) });
        if (response.status) {
            console.log("success");
            update();
        }
    }

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            {groups?.map((group, i) => (
                <div key={group.groupId}
                    className={styles.deviceDiv}>
                    <div id={group.groupId}
                        data-testid="device-card-testdevice1" 
                        className={`${styles.commonBox} 
                            ${openGroups.find(elem => elem.groupId == group.groupId)?.toggled ? 
                            styles.deviceCardfuncOn : styles.deviceCardfuncOff}`}
                        onClick={() => handleClick(group.groupId)}>
                    <p>{group.name}</p>
                    </div>
                    <div className={`${styles.commonBox} 
                        ${openGroups.find(elem => elem.groupId == group.groupId)?.toggled ? styles.functionlistOn : styles.functionlistOff}`}>
                    {
                        openGroups.find(elem => elem.groupId == group.groupId)?.toggled && (
                        <>
                            {group.users.map((groupUser, i) => (<TextAndButton
                                key={i}
                                symbol={'X'}
                                text={groupUser.username}
                                handleBtonClick={() => removeUserFromGroup(groupUser.username, group.groupId)}></TextAndButton>)
                            )}
                            {
                            newUser ? 
                            <div>
                                <label>
                                    user name
                                    <input onChange={(e) => setNewUserName(e.target.value)}
                                    ></input>
                                </label>
                                <button onClick={(e) => addUserToGroup(newUserName, group.groupId)}>Confirm</button>
                                <button onClick={() => setNewUser(false)}>Cancel</button>
                            </div>
                            : <TextAndButton
                                symbol={'+'}
                                text=""
                                handleBtonClick={() => setNewUser(true)}>
                            </TextAndButton> 
                            }
                        </>)
                    }
                    </div>
                </div>
            ))}
        </div>
    )
}

export { GroupList };