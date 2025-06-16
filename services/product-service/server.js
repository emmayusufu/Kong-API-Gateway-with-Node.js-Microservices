const express = require("express");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Sample products data
const products = [
  { id: 1, name: "Laptop", price: 999.99, category: "Electronics", stock: 50 },
  {
    id: 2,
    name: "Smartphone",
    price: 699.99,
    category: "Electronics",
    stock: 100,
  },
  {
    id: 3,
    name: "Headphones",
    price: 199.99,
    category: "Electronics",
    stock: 75,
  },
  { id: 4, name: "Book", price: 19.99, category: "Books", stock: 200 },
];

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    service: "product-service",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Get all products
app.get("/api/products", (req, res) => {
  const { category, minPrice, maxPrice } = req.query;
  let filteredProducts = [...products];

  if (category) {
    filteredProducts = filteredProducts.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (minPrice) {
    filteredProducts = filteredProducts.filter(
      (p) => p.price >= parseFloat(minPrice)
    );
  }

  if (maxPrice) {
    filteredProducts = filteredProducts.filter(
      (p) => p.price <= parseFloat(maxPrice)
    );
  }

  res.json(filteredProducts);
});

// Get product by ID
app.get("/api/products/:id", (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json(product);
});

// Create new product (admin only in real app)
app.post("/api/products", (req, res) => {
  const { name, price, category, stock } = req.body;

  const newProduct = {
    id: products.length + 1,
    name,
    price: parseFloat(price),
    category,
    stock: parseInt(stock),
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.listen(PORT, () => {
  console.log(`Product service running on port ${PORT}`);
});
