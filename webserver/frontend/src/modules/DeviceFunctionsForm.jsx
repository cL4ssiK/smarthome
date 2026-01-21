import { useState } from "react";

function DeviceFunctionsForm({ device, toggleDeviceFunctionState}) {

  
  const handleClick = (value) => {

    fetch("api/turnon/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "code": value,
        "id": device.id
      }),
    })
      .then((res) => res.text())
      .then((data) => {
        console.log("Server response:", data)
        toggleDeviceFunctionState(device.id, value);
      })
      .catch((err) => console.error("Error:", err));
  };

  return (
        <div key={device.id}>
          {device.functions.map(func => (
            <button key={func.code} onClick={() => handleClick(func.code)}>{func.name}</button>
          ))}
        </div>
  );
}

export { DeviceFunctionsForm };