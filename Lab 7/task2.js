const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Initialize SQLite Database
const db = new sqlite3.Database('./quirkbox.db', (err) => {
    if (err) console.error('Database connection error:', err.message);
});

// Create Persistent Tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price REAL,
        image_url TEXT,
        hover_story TEXT,
        tag TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        product_id INTEGER,
        quantity INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(product_id) REFERENCES products(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        full_name TEXT,
        street_address TEXT,
        city TEXT,
        payment_method TEXT,
        total_amount REAL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
});

// --- Authentication Endpoints ---

app.post('/api/users/signup', (req, res) => {
    const { name, email, password } = req.body;
    db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
        [name, email, password], function (err) {
            if (err) return res.status(400).json({ error: 'Email already exists or invalid data' });
            res.status(201).json({ id: this.lastID, message: 'User created successfully' });
        });
});

app.post('/api/users/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT id, name, email FROM users WHERE email = ? AND password = ?`,
        [email, password], (err, user) => {
            if (err || !user) return res.status(401).json({ error: 'Invalid credentials' });
            res.status(200).json({ message: 'Login successful', user });
        });
});

// --- Product Endpoints ---

app.get('/api/products', (req, res) => {
    const { tag } = req.query;
    let query = `SELECT * FROM products`;
    let params = [];

    if (tag) {
        query += ` WHERE tag = ?`;
        params.push(tag);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
});

app.get('/api/products/:id', (req, res) => {
    db.get(`SELECT * FROM products WHERE id = ?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Product not found' });
        res.status(200).json(row);
    });
});

// --- Cart Endpoints ---

app.get('/api/cart/:user_id', (req, res) => {
    const query = `
        SELECT c.id as cart_id, p.name, p.price, c.quantity, (p.price * c.quantity) as subtotal
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
    `;
    db.all(query, [req.params.user_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const total = rows.reduce((sum, item) => sum + item.subtotal, 0);
        res.status(200).json({ items: rows, total });
    });
});

app.post('/api/cart/items', (req, res) => {
    const { user_id, product_id, quantity } = req.body;
    db.run(`INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)`,
        [user_id, product_id, quantity], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Item added to cart', cart_item_id: this.lastID });
        });
});

app.delete('/api/cart/items/:id', (req, res) => {
    db.run(`DELETE FROM cart WHERE id = ?`, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Item removed from cart' });
    });
});

// --- Order Processing Endpoints ---

app.post('/api/orders', (req, res) => {
    const { user_id, full_name, street_address, city, payment_method } = req.body;

    // Calculate total from cart
    db.all(`SELECT p.price, c.quantity FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?`,
        [user_id], (err, items) => {
            if (err || items.length === 0) return res.status(400).json({ error: 'Cart is empty or invalid' });

            const total_amount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            // Create Order
            db.run(`INSERT INTO orders (user_id, full_name, street_address, city, payment_method, total_amount) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [user_id, full_name, street_address, city, payment_method, total_amount], function (err) {
                    if (err) return res.status(500).json({ error: err.message });

                    const orderId = this.lastID;

                    // Clear the user's cart after successful order
                    db.run(`DELETE FROM cart WHERE user_id = ?`, [user_id], (err) => {
                        if (err) console.error('Failed to clear cart:', err);
                    });

                    res.status(201).json({ message: 'Order placed successfully', order_id: orderId, total: total_amount });
                });
        });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Quirkbox API running on http://localhost:${PORT}`);
});