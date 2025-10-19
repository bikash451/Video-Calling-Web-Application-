# Video Calling Web Application

A full-featured video calling web application built with WebRTC, React, Node.js, Express, Socket.IO, and MongoDB.

Deployed at: https://meetingcam.netlify.app/

## 🚀 Features

### Features
-  **Create Video Call Meeting** - Generate unique meeting IDs for new video calls
-  **Join Video Call** - Join meetings using meeting ID or link
-  **Multi-participant Support** - Support for multiple users in a single meeting
-  **Real-time Chat** - Send text messages during video calls
-  **Audio/Video Toggle** - Mute/unmute microphone and turn camera on/off
-  **Screen Sharing** - Share your screen with other participants
-  **Schedule Meetings** - Schedule meetings for future dates and times
-  **Password Protection** - Secure meetings with optional passwords
-  **Responsive Design** - Works on desktop and mobile devices


## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **React Router** - Client-side routing
- **Socket.IO Client** - Real-time communication
- **Simple Peer** - WebRTC wrapper for peer connections
- **Axios** - HTTP client
- **Vite** - Build tool


## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/bikash451/Video-Calling-Web-app.git
cd Video-Calling-Web-app
```

### 2. Backend Setup

```bash
cd Backend

npm install

# Create .env file
```

Create a `.env` file in the Backend directory:

```env
PORT=
MONGODB_URI=""
JWT_SECRET=""
FRONTEND_URL=""
NODE_ENV=development
```

### 3. Frontend Setup

```bash
cd ../Frontend

npm install

# Create .env file
```

Create a `.env` file in the Frontend directory:

```env
VITE_API_URL=""
VITE_SOCKET_URL=""
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

Or use **MongoDB Atlas** (cloud) and update the `MONGODB_URI` in Backend `.env`

### 5. Run the Application

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd Backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```

### Creating a Meeting
1. Go to the home page
2. Enter your name
3. Click "Create New Meeting"
4. Share the meeting link with participants


### Joining a Meeting
1. Get the meeting ID or link from the host
2. Enter your name
3. Enter the meeting ID
4. Click "Join Meeting"


### During the Meeting
- Click the microphone icon to mute/unmute
- Click the camera icon to turn video on/off
- Click the screen icon to start/stop screen sharing
- Click the chat icon to open the chat sidebar
- Click the red phone icon to leave the meeting


### Scheduling a Meeting
1. Click "Schedule Meeting" on the home page
2. Fill in the meeting details (title, date, time)
3. Optionally set a password
4. Click "Schedule Meeting"

## Author

**Bikash Chaudhary**
- GitHub: [@bikash451](https://github.com/bikash451)




