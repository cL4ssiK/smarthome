import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const deviceUpdate = { type: 'deviceupdate' };

// Attach to window before tests
window.WebSocket = MockWebSocket;

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

test('test opening functions tab and pressing function button', async () => {
    const mockFetchResponse = [{ 
        id: "testdevice1", 
        name: "thermostate", 
        functions: [{name: "turn on", code: 1, active: "on"},{name: "increase temp", code: 2, active: "off"}],
        active: true
    }];

    const updatedMockFetchResponse = [{ 
        id: "testdevice1", 
        name: "thermostate", 
        functions: [{name: "turn on", code: 1, active: "off"},{name: "increase temp", code: 2, active: "off"}],
        active: true
    }];

    
    const { container, fetchSpy, sendMsg } = setup(mockFetchResponse);
    
    const deviceCard = await screen.findByTestId("device-card-testdevice1", {}, { timeout: 3000 });
    expect(deviceCard).toBeInTheDocument();
    
    fetchSpy.mockImplementation(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve(updatedMockFetchResponse),
        })
    );

    userEvent.click(deviceCard);

    const functionBton = screen.getByRole("button", {name: "turn on"});
    expect(functionBton).toBeInTheDocument();
    
    const indicatorSpan = container.querySelector("span");
    expect(indicatorSpan).toBeInTheDocument();
    expect(indicatorSpan).toHaveClass('active');

    fetchSpy.mockClear();
    userEvent.click(functionBton);
    
    await waitFor(() => {
        expect(window.mockSocketInstance.send).toHaveBeenCalledWith(
            expect.stringContaining('"code":1')
        );
    });

    sendMsg(deviceUpdate);

    await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalled();
    });
    

    await waitFor(() => {
        const updatedSpan = container.querySelector("span");
        expect(updatedSpan).toHaveClass('inactive');
    });

    fetchSpy.mockRestore(); // Clean up the fetch mock
});
