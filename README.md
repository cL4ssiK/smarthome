## Description
This repository contains my smarthome project(s). Goal of this project ultimately is to create my own independent smarthome hub for various devices.
The devices will be containing self made IoT projects and modded commercial products.

Motivation of this project came from ambition to hack cheap electronic devices, and of course automate my environment.
I could have easily bought these services from some company, but what is the fun in that? Instead I decided to spend my precious time creating this kind of system myself.
Who wouldnt like to turn their coffemaker on from bed or workstation???

### Tech stack
Server side is running on node.js and the rest api portion is handled by express.js.
Frontend is made with react.
For the embedded system(s) I'm currently using ESP-32 dev board and programming it using Arduino framework.

### Version 1.0
For version 1.0 the definition of done features are quite simple. Only basic functionalities to create something working and intuitive to use.
Automated testing on this version is not comprehensive. Some front end functionality tests have been automated.
First version of the software will be containing the following functionalities:
#### 1. User interface
- User can see devices that are online.
- User can see devices that are offline, but have been connected earlier in session.
- User can expand online device to reveal available functions.
- User can interact with devices by activating function.
- User can see the state of the function while it executes.
- User can remove recently connected device entirely.
#### 2. Server side
- Maintain up to date information of currently connected devices and their states.
- Maintain information of currently connected clients.
- Handle communication from client to device and from device to client.
#### 3. Devices
Modded commercial coffeemaker
- User can see state of the machine from UI.
- User can trigger the coffeemaker on/off from UI.
- Coffeemaker connects automatically to server and reveals its function interface.

### Version 1.1
- User can set timer to activate device function.
- User can set timer to deactivate device function.
- Fallout 4 inspired theme
- Device decides automatically if timer is allowed or not.

### Version 2.0
Improved version of the server mainly concentrating on security
#### 1. User interface
- User needs to authenticate to access devices.
#### 2. Server side
- Uses https and wss.
- Database to store user-, session-, and device information.
- Authenticate devices. 
#### 3. Devices
- Devices deserve their own repositories tbh...

### Demo
Coming...

## Setup (first time)
If not already, install [Docker](https://www.docker.com/) and [Node.js](https://nodejs.org/en/download/current).

### 1. Clone the project
```bash
git clone https://github.com/cL4ssiK/smarthome
```

### 2. Create .env files into backend and frontend folders

### 3. Devices
You can do some of the following:
- Build testing device (coming soon...)
- Run the DeviceMock to simulate connected device
- Build your own devices and follow server requirements. (API description coming later...) 

## Usage

### 1. Activate server environment
```bash
cd smarthome\webserver
npm run start
```
### 2. Go to web page that server offers.

### 3. Turn on device(s)

### 4. Stop the server
```bash
npm run stop
```

