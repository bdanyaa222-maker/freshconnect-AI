require('dotenv').config();
const mysql = require('mysql2/promise');
async function initDB() {
    try {
        // Connect without a specific database first to create it
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || ''
        });
        console.log('Connected to MySQL server.');
        // Create Database
        const dbName = process.env.DB_NAME || 'freshconnect';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        console.log(`Database '${dbName}' created or already exists.`);
        // Switch to the database
        await connection.changeUser({ database: dbName });
        // Create Users Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS Users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                roll_no VARCHAR(20) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('student', 'faculty', 'admin') DEFAULT 'student',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        // Create Notices Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS Notices (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                category VARCHAR(50) NOT NULL,
                date DATE NOT NULL,
                is_new BOOLEAN DEFAULT TRUE,
                attachment_link VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        // Create HubPosts Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS HubPosts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                author_name VARCHAR(100),
                content TEXT,
                tags VARCHAR(255),
                likes INT DEFAULT 0,
                comments INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL
            );
        `);
        console.log('Tables created successfully.');
        // Seed Data
        // Clear existing to avoid duplicates in this simple script
        await connection.query('DELETE FROM HubPosts');
        await connection.query('DELETE FROM Notices');
        await connection.query('DELETE FROM Users');
        // Insert Dummy User (Password should be hashed in production, keeping plain for demo)
        await connection.query(`
            INSERT INTO Users (roll_no, name, password, role) 
            VALUES ('21X41A0501', 'Jane Doe', 'password123', 'student');
        `);
 // Insert Dummy Notices
        await connection.query(`
            INSERT INTO Notices (title, category, date, is_new) VALUES 
            ('End Semester Practical Examination Schedule - Nov 2026', 'Examinations', '2026-10-25', TRUE),
            ('Google Campus Recruitment Drive - Eligible Students List', 'Placements', '2026-10-20', FALSE),
            ('Holiday Declaration for State Festival', 'Circulars', '2026-10-15', FALSE);
        `);
        // Insert Dummy Posts
        await connection.query(`
            INSERT INTO HubPosts (author_name, content, tags, likes, comments) VALUES 
            ('Alex Mercer', 'Just published my first research paper on Natural Language Processing optimization! Huge thanks to Prof. Smith for the guidance. 🚀', '#NLP #AI #Research', 42, 5),
            ('Sarah Connor', 'Built an autonomous obstacle-avoiding robot for the upcoming Tech Symposium!', '#Robotics #Hardware', 128, 12);
        `);
         console.log('Dummy data seeded successfully.');
        await connection.end();
        console.log('Database initialization complete.');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
}
initDB();