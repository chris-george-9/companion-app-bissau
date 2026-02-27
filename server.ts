import express from "express";
import { createServer as createViteServer } from "vite";
import { initDb } from "./src/db";
import db from "./src/db";

// Initialize DB
initDb();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Get orders by phone number
  app.get("/api/orders", (req, res) => {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ error: "Phone number required" });
    }
    
    try {
      const stmt = db.prepare('SELECT * FROM orders WHERE recipient_phone = ? ORDER BY created_at DESC');
      const orders = stmt.all(phone);
      
      // Parse items JSON
      const parsedOrders = orders.map((order: any) => ({
        ...order,
        items: JSON.parse(order.items)
      }));
      
      res.json(parsedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get single order
  app.get("/api/orders/:id", (req, res) => {
    const { id } = req.params;
    try {
      const stmt = db.prepare('SELECT * FROM orders WHERE id = ?');
      const order = stmt.get(id) as any;
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      order.items = JSON.parse(order.items);
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Submit complaint
  app.post("/api/complaints", (req, res) => {
    const { orderId, type, description } = req.body;
    
    if (!orderId || !type || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const stmt = db.prepare('INSERT INTO complaints (order_id, type, description) VALUES (?, ?, ?)');
      const result = stmt.run(orderId, type, description);
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
      console.error("Error submitting complaint:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving would go here
    // For this environment, we rely on the build output
    app.use(express.static('dist'));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
