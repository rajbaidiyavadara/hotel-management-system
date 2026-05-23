const mysql = require('mysql');

// Database Connection Setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // XAMPP default user
    password: '',      // XAMPP default password (usually empty)
    database: 'urbanstay'
});

// Connect to Database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL Database as id ' + db.threadId);
});

// Is connection ko export karein taaki server.js isse use kar sake
module.exports = db;