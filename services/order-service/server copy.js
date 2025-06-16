const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

// In-memory orders storage
const orders = [];

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    service: "order-service",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Create order
app.post("/api/orders", async (req, res) => {
  try {
    const { userId, items } = req.body;

    // Validate products exist (call product service)
    const productIds = items.map((item) => item.productId);
    let totalAmount = 0;

    for (const item of items) {
      try {
        const response = await axios.get(
          `http://product-service:3002/api/products/${item.productId}`
        );
        const product = response.data;
        totalAmount += product.price * item.quantity;
      } catch (error) {
        return res
          .status(400)
          .json({ error: `Product ${item.productId} not found` });
      }
    }

    const order = {
      id: orders.length + 1,
      userId,
      items,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    orders.push(order);

    // Simulate notification (call notification service)
    try {
      await axios.post("http://notification-service:3004/api/notifications", {
        userId,
        type: "order_created",
        message: `Order #${order.id} has been created`,
        orderId: order.id,
      });
    } catch (error) {
      console.log("Failed to send notification:", error.message);
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get orders for user
app.get("/api/orders/user/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const userOrders = orders.filter((order) => order.userId === userId);
  res.json(userOrders);
});

// Get order by ID
app.get("/api/orders/:id", (req, res) => {
  const orderId = parseInt(req.params.id);
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  res.json(order);
});

// Update order status
app.patch("/api/orders/:id/status", (req, res) => {
  const orderId = parseInt(req.params.id);
  const { status } = req.body;

  const order = orders.find((o) => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();

  res.json(order);
});

app.listen(PORT, () => {
  console.log(`Order service running on port ${PORT}`);
});
