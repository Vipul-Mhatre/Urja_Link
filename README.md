# Urja_Link

Urja_Link is a web application designed to manage energy-related data efficiently and intuitively. This repository contains the codebase for the app, including both the backend and frontend implementations.

## Demo Video

https://drive.google.com/file/d/1sWrvtL78D4VOBCEd3Hk5MnhBXAfU_9US/view?usp=drive_link

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [License](#license)

---

## Features

- **User Authentication**: Secure login and registration functionality.
- **Real-Time Updates**: Updates on energy usage and status.
- **User Friendly Interface**: Graphical representation of user data and ease of use.
- **Responsive Design**: Seamless user experience across devices.

---

## Tech Stack

**Frontend**:
- React.js
- Tailwind CSS/SCSS for styling

**Backend**:
- Node.js
- Express.js
- MongoDB (Database)

---

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (Local or cloud instance)
- Git

Clone the repository:
```bash
git clone https://github.com/Vipul-Mhatre/Urja_Link.git
cd Urja_Link
```

---

## Backend Setup

1. **Navigate to the Backend Directory**:
   ```bash
   cd server
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the `server` directory and add the following:
   ```env
   PORT=8000
   MONGO_URI=<your_mongo_connection_string>
   JWT_SECRET=<your_jwt_secret>
   ```

4. **Start the Backend Server**:
   ```bash
   npm start
   ```
   The server should now be running on `http://localhost:8000`.

---

## Frontend Setup

1. **Navigate to the Frontend Directory**:
   ```bash
   cd ../client
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the `client` directory and add the following:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8000
   ```

4. **Start the Frontend Server**:
   ```bash
   npm start
   ```
   The app should now be accessible at `http://localhost:3000`.

---

## Running the Application

1. Ensure the backend server is running on `http://localhost:8000`.
2. Start the frontend server.
3. Open a browser and navigate to `http://localhost:3000` to use the app.
