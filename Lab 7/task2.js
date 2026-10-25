const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// SQL Server Configuration
const dbConfig = {
    user: 'your_username',
    password: 'your_password',
    server: 'localhost',
    database: 'QuirkboxDB',
    options: {
        trustServerCertificate: true
    }
};

// --- Authentication Endpoints ---

app.post('/api/users/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, password)
            .query(`INSERT INTO users (name, email, password) OUTPUT INSERTED.id VALUES (@name, @email, @password)`);

        res.status(201).json({ id: result.recordset[0].id, message: 'User created successfully' });
    } catch (err) {
        res.status(400).json({ error: 'Email already exists or database error' });
    }
});

app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, password)
            .query(`SELECT id, name, email FROM users WHERE email = @email AND password = @password`);

        if (result.recordset.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        res.status(200).json({ message: 'Login successful', user: result.recordset[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Product Endpoints ---

app.get('/api/products', async (req, res) => {
    try {
        const { tag } = req.query;
        const pool = await sql.connect(dbConfig);
        const request = pool.request();

        let query = `SELECT * FROM products`;
        if (tag) {
            query += ` WHERE tag = @tag`;
            request.input('tag', sql.NVarChar, tag);
        }

        const result = await request.query(query);
        res.status(200).json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Cart Endpoints ---

app.get('/api/cart/:user_id', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('user_id', sql.Int, req.params.user_id)
            .query(`
                SELECT c.id as cart_id, p.name, p.price, c.quantity, (p.price * c.quantity) as subtotal
                FROM cart c
                JOIN products p ON c.product_id = p.id
                WHERE c.user_id = @user_id
            `);

        const total = result.recordset.reduce((sum, item) => sum + item.subtotal, 0);
        res.status(200).json({ items: result.recordset, total });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/cart/items', async (req, res) => {
    try {
        const { user_id, product_id, quantity } = req.body;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('user_id', sql.Int, user_id)
            .input('product_id', sql.Int, product_id)
            .input('quantity', sql.Int, quantity)
            .query(`INSERT INTO cart (user_id, product_id, quantity) VALUES (@user_id, @product_id, @quantity)`);

        res.status(201).json({ message: 'Item added to cart' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Order Processing Endpoints ---

app.post('/api/orders', async (req, res) => {
    try {
        const { user_id, full_name, street_address, city, payment_method } = req.body;
        const pool = await sql.connect(dbConfig);

        // Calculate total
        const cartResult = await pool.request()
            .input('user_id', sql.Int, user_id)
            .query(`SELECT p.price, c.quantity FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = @user_id`);

        if (cartResult.recordset.length === 0) return res.status(400).json({ error: 'Cart is empty' });

        const total_amount = cartResult.recordset.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Process transaction
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        const request = new sql.Request(transaction);
        const orderResult = await request
            .input('user_id', sql.Int, user_id)
            .input('full_name', sql.NVarChar, full_name)
            .input('street_address', sql.NVarChar, street_address)
            .input('city', sql.NVarChar, city)
            .input('payment_method', sql.NVarChar, payment_method)
            .input('total_amount', sql.Decimal(10, 2), total_amount)
            .query(`INSERT INTO orders (user_id, full_name, street_address, city, payment_method, total_amount) 
                    OUTPUT INSERTED.id 
                    VALUES (@user_id, @full_name, @street_address, @city, @payment_method, @total_amount)`);

        await request.query(`DELETE FROM cart WHERE user_id = @user_id`);
        await transaction.commit();

        res.status(201).json({ message: 'Order placed successfully', order_id: orderResult.recordset[0].id, total: total_amount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`SQL Server API running on http://localhost:${PORT}`));