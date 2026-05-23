const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const db = require('./db'); 

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve Static HTML Files
app.use(express.static(path.join(__dirname))); 
// Agar files 'public' folder mein hain to: path.join(__dirname, 'public')

// --- API ROUTES ---

// 1. Room Booking API
app.post('/api/book', (req, res) => {
    const { name, phone, email, checkin, checkout, room, requests } = req.body;
    
    const sql = "INSERT INTO bookings (name, phone, email, checkin, checkout, room_type, special_requests) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const values = [name, phone, email, checkin, checkout, room, requests];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Booking Error: ", err);
            res.status(500).json({ message: 'Booking Failed due to server error.' });
        } else {
            console.log("New Booking ID:", result.insertId);
            res.json({ message: 'Booking Confirmed Successfully!' });
        }
    });
});

// 2. Food Order API
app.post('/api/order', (req, res) => {
    const { roomNumber, items, total, instructions } = req.body;
    
    // Items array ko JSON string me convert karke save karenge
    const itemsJson = JSON.stringify(items);
    
    const sql = "INSERT INTO orders (room_number, order_items, total_amount, instructions) VALUES (?, ?, ?, ?)";
    const values = [roomNumber, itemsJson, total, instructions];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Order Error: ", err);
            res.status(500).json({ message: 'Order Failed.' });
        } else {
            console.log("New Order ID:", result.insertId);
            res.json({ message: 'Order Placed! Kitchen is preparing your food.' });
        }
    });
});

// 3. Newsletter Subscription API
app.post('/api/subscribe', (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    const sql = "INSERT INTO subscribers (email) VALUES (?)";
    db.query(sql, [email], (err, result) => {
        if (err) {
            if(err.code === 'ER_DUP_ENTRY') {
                res.json({ message: 'You are already subscribed!' });
            } else {
                console.error("Subscription Error: ", err);
                res.status(500).json({ message: 'Subscription failed.' });
            }
        } else {
            console.log("New Subscriber:", email);
            res.json({ message: 'Subscribed successfully!' });
        }
    });
});

// --- USER AUTHENTICATION APIS ---

// 4. Register User
app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;
    
    // Check if user exists
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
        if(err) return res.status(500).json({ message: 'Server Error' });
        if(result.length > 0) return res.status(400).json({ message: 'Email already exists' });

        // Insert new user
        const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        db.query(sql, [name, email, password], (err, result) => {
            if (err) return res.status(500).json({ message: 'Registration failed' });
            res.json({ message: 'Registration Successful! Please Login.' });
        });
    });
});

// 5. Login User
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.query(sql, [email, password], (err, result) => {
        if (err) return res.status(500).json({ message: 'Server Error' });
        
        if (result.length > 0) {
            // User found
            res.json({ message: 'Login Successful!', user: result[0].name });
        } else {
            res.status(401).json({ message: 'Invalid Email or Password' });
        }
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});