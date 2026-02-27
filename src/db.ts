import Database from 'better-sqlite3';

const db = new Database('nhakinhon.db');

export function initDb() {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      recipient_phone TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      status TEXT NOT NULL, -- 'pending', 'processing', 'shipped', 'out_for_delivery', 'delivered'
      items TEXT NOT NULL, -- JSON string of items
      estimated_delivery TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      type TEXT NOT NULL, -- 'delay', 'damaged', 'missing', 'other'
      description TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    );
  `);

  // Seed data if empty
  const stmt = db.prepare('SELECT count(*) as count FROM orders');
  const result = stmt.get() as { count: number };
  
  if (result.count === 0) {
    console.log('Seeding database...');
    const insert = db.prepare(`
      INSERT INTO orders (id, recipient_phone, sender_name, status, items, estimated_delivery, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // Demo user phone: 960000000 (Common prefix in GW is 96 or 95)
    // Using a simple demo number for easy testing
    const demoPhone = '123456789';

    insert.run(
      'ORD-2024-001',
      demoPhone,
      'Maria Silva',
      'out_for_delivery',
      JSON.stringify([{ name: 'Rice (20kg)', qty: 2 }, { name: 'Cooking Oil (5L)', qty: 1 }]),
      '2024-03-10',
      '2024-03-01 10:00:00'
    );

    insert.run(
      'ORD-2024-002',
      demoPhone,
      'Joao Mendes',
      'shipped',
      JSON.stringify([{ name: 'Milk Powder (2kg)', qty: 3 }, { name: 'Sugar (5kg)', qty: 1 }]),
      '2024-03-15',
      '2024-03-05 14:30:00'
    );

    insert.run(
      'ORD-2024-003',
      demoPhone,
      'Ana Gomes',
      'delivered',
      JSON.stringify([{ name: 'Canned Tuna (Box)', qty: 1 }]),
      '2024-02-28',
      '2024-02-20 09:15:00'
    );
  }
}

export default db;
