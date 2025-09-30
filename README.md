# Training and Skilling Portal - IIT Guwahati

<div align="center">
  <img src="frontend/public/logo.png" alt="IIT Guwahati Logo" width="200"/>
  <h3>A comprehensive platform for managing training events and workshops</h3>
</div>

## 🌟 Features Overview

### 👤 User Features

#### Authentication & Profile
- **User Registration**: Create account with full name, email, and roll number
- **Secure Login**: Email and password authentication
- **Profile Management**: View and edit personal information
- **Dark/Light Mode**: Toggle between themes for better visibility

#### Event Management
- **Browse Events**: View all upcoming training sessions and workshops
- **Event Registration**: Register for available events with seat tracking
- **My Registrations**: Track registered events and their status
- **Cancel Registration**: Option to cancel registration for upcoming events
- **Event Details**: 
  - Event name and description
  - Speaker information
  - Date and time
  - Venue details
  - Available seats
  - Registration status

### 👨‍💼 Admin Features

#### Event Management
- **Create Events**: 
  - Set event name, description, and speaker
  - Configure date, time, and venue
  - Set maximum seats capacity
  - Enable email notifications
- **Event Controls**:
  - Update event status (upcoming/ongoing/completed)
  - Monitor registrations
  - Cancel or modify events
  - Delete events if needed

#### Dashboard Features
- **Event Overview**: Monitor all events in one place
- **Registration Tracking**: Track registered users for each event
- **Status Management**: Update event status in real-time
- **Email Notifications**: Send updates to registered users

## 🚀 Technology Stack

### Frontend
- **React**: UI development
- **TailwindCSS**: Styling and responsive design
- **Axios**: API communication
- **React Router**: Navigation
- **Lucide Icons**: Modern iconography

### Backend
- **Node.js**: Runtime environment
- **Express**: Web framework
- **MongoDB**: Database
- **JWT**: Authentication
- **Bcrypt**: Password hashing

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/Ash469/ccd_training_skilling.git
cd training-skilling-portal
```

2. **Install dependencies**
```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

3. **Environment Setup**
```bash
# Frontend (.env)
VITE_BACKEND_URL=
VITE_MICROSOFT_CLIENT_ID=
VITE_MICROSOFT_TENANT_ID=
VITE_REDIRECT_URI=

# Backend (.env)
PORT=
MONGO_URI=
JWT_SECRET=
OUTLOOK_EMAIL=  
OUTLOOK_PASSWORD=
FRONTEND_URL=
```

4. **Start the application**
```bash
# Frontend
cd frontend
npm run dev

# Backend
cd backend
npm run dev
```

## 🐳 Docker Setup (Recommended)

This project supports Docker for easy setup.

1. **Clone the repository**
```bash
git clone https://github.com/Ash469/ccd_training_skilling.git
cd ccd_training_skilling
```

2. **Create environment files**
Create a  `.env` in the root of the project.
```bash
# === Frontend Build-Time Variables ===
VITE_BACKEND_URL=
VITE_MICROSOFT_CLIENT_ID=
VITE_MICROSOFT_TENANT_ID=
VITE_REDIRECT_URI=
# === Backend Run-Time Variables ===
PORT=5001
MONGO_URI=
JWT_SECRET=
OUTLOOK_EMAIL=  
OUTLOOK_PASSWORD=
FRONTEND_URL=
```

3. **Docker Compose Configuration**
Create a `docker-compose.yml` in the root directory:

```yaml
version: "3.9"
services:
  app:
    build:
      context: .
      args:
        VITE_BACKEND_URL: ${VITE_BACKEND_URL}
        VITE_MICROSOFT_CLIENT_ID: ${VITE_MICROSOFT_CLIENT_ID}
        VITE_MICROSOFT_TENANT_ID: ${VITE_MICROSOFT_TENANT_ID}
        VITE_REDIRECT_URI: ${VITE_REDIRECT_URI}
    container_name: ccd-app
    ports:
      - "5001:5001"
    env_file:
      - .env
    volumes:
      - ./backend/uploads/pdfs:/app/backend/uploads/pdfs
    restart: unless-stopped
```

4. **Build and start containers**
```bash
docker-compose build --no-cache
docker-compose up -d
```

5. **Check running containers**
```bash
docker ps
```

6. **Access the application**
- Backend: http://localhost:5001
- Frontend: http://localhost:5001
- We had make a single container for both frontend and backend

7. **Stop containers**
```bash
docker-compose down
```

## 🙏 Acknowledgments

- IIT Guwahati Technical Team
- Centre For Career Development
- All contributors who helped in making this project better

---

<div align="center">
  <p>Developed with ❤️ by CCD IITG Technical Team</p>
</div>