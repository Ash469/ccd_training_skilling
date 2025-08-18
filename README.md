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
VITE_BACKEND_URL=http://localhost:5000

# Backend (.env)
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
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
Make sure you have `.env` inside both `frontend/` and `backend/` as shown above.

3. **Docker Compose Configuration**
Create a `docker-compose.yml` in the root directory:

```yaml
version: "3.9"
services:
  backend:
    build: ./backend
    container_name: backend
    ports:
      - "5000:5000"
    env_file:
      - ./backend/.env
    volumes:
      - ./backend/uploads/pdfs:/app/uploads/pdfs
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      args:
        VITE_BACKEND_URL: http://localhost:5000
        VITE_MICROSOFT_CLIENT_ID: your_client_id
        VITE_MICROSOFT_TENANT_ID: your_tenant_id
        VITE_REDIRECT_URI: http://localhost:3000/user/dashboard
    container_name: frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped
```

4. **Build and start containers**
```bash
docker compose up --build -d
```

5. **Check running containers**
```bash
docker ps
```

6. **Access the application**
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

7. **Stop containers**
```bash
docker compose down
```


## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 🙏 Acknowledgments

- IIT Guwahati Technical Team
- Centre For Career Development
- All contributors who helped in making this project better

---

<div align="center">
  <p>Developed with ❤️ by CCD IITG Technical Team</p>
</div>