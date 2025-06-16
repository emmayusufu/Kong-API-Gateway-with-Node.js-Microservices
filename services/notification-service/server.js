const express = require("express");

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

// In-memory notifications storage
const notifications = [];

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    service: "notification-service",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Create notification
app.post("/api/notifications", (req, res) => {
  const { userId, type, message, orderId } = req.body;

  const notification = {
    id: notifications.length + 1,
    userId,
    type,
    message,
    orderId,
    read: false,
    createdAt: new Date().toISOString(),
  };

  notifications.push(notification);

  // Simulate real notification (email, push, SMS)
  console.log(`📧 Notification sent to user ${userId}: ${message}`);

  res.status(201).json(notification);
});

// Get notifications for user
app.get("/api/notifications/user/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const userNotifications = notifications.filter((n) => n.userId === userId);
  res.json(userNotifications);
});

// Mark notification as read
app.patch("/api/notifications/:id/read", (req, res) => {
  const notificationId = parseInt(req.params.id);
  const notification = notifications.find((n) => n.id === notificationId);

  if (!notification) {
    return res.status(404).json({ error: "Notification not found" });
  }

  notification.read = true;
  res.json(notification);
});

app.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});
