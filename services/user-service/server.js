const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = "your-secret-key";

app.use(express.json());

// In-memory user storage (use database in production)
const users = [];

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    service: "user-service",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Register endpoint
app.post("/api/users/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    users.push(user);

    // Return user without password
    const { password: _, ...userResponse } = user;
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login endpoint
app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user profile
app.get("/api/users/profile", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find((u) => u.id === decoded.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password: _, ...userResponse } = user;
    res.json(userResponse);
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});
