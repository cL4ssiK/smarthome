import { render, screen, act } from '@testing-library/react';
import { WebSocketProvider } from '../context/WebSocketContext';
import { DeviceProvider } from '../context/DeviceContext';
import { DeviceList } from './DeviceList';

// 1. Create a Mock for the Global WebSocket
class MockWebSocket {
  constructor(url) {
    this.url = url;
    // Store the instance so we can trigger events manually in tests
    window.mockSocketInstance = this; 
    setTimeout(() => this.onopen?.(), 0);
  }
  send = jest.fn();
  close = jest.fn();
}

// Attach to window before tests
window.WebSocket = MockWebSocket;

const deviceUpdate = { type: 'deviceupdate' };

function setup(fetchData) {
    const fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve(fetchData),
        })
    );

    const page = render(
        <WebSocketProvider>
            <DeviceProvider>
                <DeviceList />
            </DeviceProvider>
        </WebSocketProvider>
    );

    const sendMsg = (serverMsg) => {
        act(() => {
            window.mockSocketInstance.onmessage({
                data: JSON.stringify(serverMsg),
            });
        });
    };

    return {
        ...page,
        fetchSpy,
        sendMsg,
    };
}

test('initial page load', async () => {
  // 1. Mock the Fetch call (The response for when the UI asks for data)
    const mockFetchResponse = [{ 
        id: "testdevice1", 
        name: "thermostate", 
        functions: [{name: "turn on", code: 1, active: "on"},{name: "increase temp", code: 2, active: "off"}],
        active: true
    }];
    
    const { fetchSpy } = setup(mockFetchResponse);

    // 3. ASSERT: Did the fetch happen?
    // We check if the function was called by the component
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // 4. ASSERT: Did the UI show the fetched data?
    const device = await screen.findByText(/thermostate/i);
    expect(device).toBeInTheDocument();

    fetchSpy.mockRestore(); // Clean up the fetch mock
});


test('receives WS update and then fetches device details', async () => {
  // 1. Mock the Fetch call (The response for when the UI asks for data)
    const mockFetchResponse = [{ 
        id: "testdevice1", 
        name: "thermostate", 
        functions: [{name: "turn on", code: 1, active: "on"},{name: "increase temp", code: 2, active: "off"}],
        active: true
    }];
    
    const { fetchSpy, sendMsg } = setup(mockFetchResponse);

    // Clean the initial fetch, and onconnect fetch.
    fetchSpy.mockClear();

    // 2. Trigger the WebSocket "Signal"
    // This is mocking the FUNCTION CALL onmessage
    sendMsg(deviceUpdate);

    // 3. ASSERT: Did the fetch happen?
    // We check if the function was called by the component
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // 4. ASSERT: Did the UI show the fetched data?
    const device = await screen.findByText(/thermostate/i);
    expect(device).toBeInTheDocument();

    fetchSpy.mockRestore(); // Clean up the fetch mock
});

test('receives WS update and then fetches broken device details', async () => {
  // 1. Mock the Fetch call (The response for when the UI asks for data)
    const mockFetchResponse = [{ 
        id: "testdevice1", 
        name: "",
        functions: [{name: "turn on", code: 1, active: "on"},{name: "increase temp", code: 2, active: "off"}],
        active: true
    }];
    
    const { fetchSpy, sendMsg } = setup(mockFetchResponse);

    // Clean the initial fetch, and onconnect fetch.
    fetchSpy.mockClear();

    // 2. Trigger the WebSocket "Signal"
    // This is mocking the FUNCTION CALL onmessage
    sendMsg(deviceUpdate);

    // 3. ASSERT: Did the fetch happen?
    // We check if the function was called by the component
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // 4. ASSERT: Did the UI show the fetched data?
    const device = await screen.findByText(/device 0/i);
    expect(device).toBeInTheDocument();

    fetchSpy.mockRestore(); // Clean up the fetch mock
});