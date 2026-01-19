import './App.css';
import { DeviceProvider } from './context/DeviceContext';

function App() {

  const handleSubmit = (event) => {
    event.preventDefault();

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
    <DeviceProvider>
      <div className="App">
        <header className="App-header">
          <form onSubmit={handleSubmit}>
            <input type="hidden" name="key" value="value"></input>
            <input type="submit" value="Send Request" />
          </form>
        </header>
      </div>
    </DeviceProvider>
  );
}

export default App;
