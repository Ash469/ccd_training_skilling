### Step 1: Set Up Your Project

1. **Initialize a new Node.js project:**
   ```bash
   mkdir user-registration-backend
   cd user-registration-backend
   npm init -y
   ```

2. **Install necessary packages:**
   ```bash
   npm install express mongoose bcryptjs jsonwebtoken dotenv
   ```

   - `express`: Web framework for Node.js.
   - `mongoose`: MongoDB object modeling tool.
   - `bcryptjs`: Library to hash passwords.
   - `jsonwebtoken`: Library to create and verify JSON Web Tokens.
   - `dotenv`: Module to load environment variables from a `.env` file.

### Step 2: Create Project Structure

Create the following folder structure:

```
user-registration-backend/
│
├── config/
│   └── db.js
├── models/
│   └── User.js
├── routes/
│   └── auth.js
├── .env
├── server.js
└── package.json
```

### Step 3: Set Up Database Connection

**`config/db.js`**
```javascript
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### Step 4: Create User Model

**`models/User.js`**
```javascript
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  studentId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model('User', UserSchema);
```

### Step 5: Create Authentication Routes

**`routes/auth.js`**
```javascript
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  const { fullName, email, studentId, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      fullName,
      email,
      studentId,
      password: await bcrypt.hash(password, 10),
    });

    await user.save();

    // Create and return JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
```

### Step 6: Set Up the Server

**`server.js`**
```javascript
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Step 7: Create Environment Variables

**`.env`**
```
MONGO_URI=mongodb://localhost:27017/user-registration
JWT_SECRET=your_jwt_secret
```

### Step 8: Run Your Application

1. **Start MongoDB** (if you have it installed locally):
   ```bash
   mongod
   ```

2. **Run your server:**
   ```bash
   node server.js
   ```

### Step 9: Test the Registration Feature

You can use tools like Postman or curl to test the registration endpoint:

- **Endpoint:** `POST http://localhost:5001/api/auth/register`
- **Body (JSON):**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "studentId": "2023CS001",
  "password": "yourpassword"
}
```

### Conclusion

You now have a basic backend setup for user registration with MongoDB. You can expand this by adding more features like user login, email verification, and password reset functionality.