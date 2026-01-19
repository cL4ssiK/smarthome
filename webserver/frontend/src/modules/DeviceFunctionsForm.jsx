import { useState } from "react";

function DeviceFunctionsForm() {

  const handleSubmit = (event) => {
    event.preventDefault();

    // Here you can send the data using fetch, axios, etc.
    fetch("api/turnon/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "message": "on",
        "id": "esp32-001"
      }),
    })
      .then((res) => res.text())
      .then((data) => console.log("Server response:", data))
      .catch((err) => console.error("Error:", err));
  };

  return (
        <form onSubmit={handleSubmit}>
          <input type="hidden" name="key" value="value"></input>
          <input type="submit" value="Send Request" />
        </form>
  );
}

export default DeviceFunctionsForm;