const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const app = express();

// SABOTAGE 1: Expects a very specific environment variable name!
const dbUri = process.env.DATABASE_URI || 'mongodb://localhost:27017/phoenix';

// Log directory and file
const logDirectory = path.join(__dirname, 'logs');
const logFile = path.join(logDirectory, 'server.log');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

// Function to write logs
function writeLog(message) {
    const time = new Date().toISOString();
    fs.appendFileSync(logFile, `[${time}] ${message}\n`);
}

mongoose.connect(dbUri)
    .then(() => {
        console.log('Connected to MongoDB!');
        writeLog('Connected to MongoDB.');
    })
    .catch(err => {
        console.error('Failed to connect:', err);
        writeLog(`MongoDB Connection Failed: ${err.message}`);
    });

// Serve the Vite build folder
const uiPath = path.join(__dirname, 'dist');
app.use(express.static(uiPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(uiPath, 'index.html'));
});

// Health route
app.get('/api/health', (req, res) => {
    writeLog('Health endpoint accessed.');
    res.json({ status: 'API is alive' });
});

app.listen(5000, () => {
    console.log('Server running on port 5000');
    writeLog('Server started on port 5000.');
});