import './App.css';
import { DeviceProvider } from './context/DeviceContext';
import { DeviceList } from './modules/DeviceList';

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
        </header>
        <DeviceList>
        </DeviceList>
      </div>
    </DeviceProvider>
  );
}

export default App;
