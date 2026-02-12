// Import dependencies
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Koneksi ke MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Error:', err));

// Schema & Model untuk Data RFID
const DataSchema = new mongoose.Schema({
    rfid_tag: String,
    status: String,
    timestamp: { type: Date, default: Date.now },
});
const DataModel = mongoose.model('Data', DataSchema);

// Schema & Model untuk User
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
const UserModel = mongoose.model('User', UserSchema);

// Schema & Model untuk FCM Token
const TokenSchema = new mongoose.Schema({
    token: { type: String, unique: true, required: true },
    createdAt: { type: Date, default: Date.now },
});
const TokenModel = mongoose.model('Token', TokenSchema);

// Mode status (in-memory for simplicity)
let currentMode = { inRoom: true };

// ===================== ENDPOINTS =====================

// Root endpoint
app.get('/', (req, res) => {
    res.send('🚀 Node.js + MongoDB Server is running 🧠✨');
});

// Register user
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username dan password diperlukan' });
        }
        const existingUser = await UserModel.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username sudah terdaftar' });
        }
        const user = new UserModel({ username, password });
        await user.save();
        res.status(201).json({ message: 'Registrasi berhasil ✅' });
    } catch (err) {
        console.error('❌ Error register:', err);
        res.status(500).json({ error: 'Gagal registrasi' });
    }
});

// Login user
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await UserModel.findOne({ username, password });
        if (!user) {
            return res.status(401).json({ error: 'Username atau password salah' });
        }
        res.json({ message: 'Login berhasil ✅', username: user.username });
    } catch (err) {
        console.error('❌ Error login:', err);
        res.status(500).json({ error: 'Gagal login' });
    }
});

// Get all data (RFID logs)
app.get('/data', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const allData = await DataModel.find().sort({ timestamp: -1 }).limit(limit);
        res.json(allData);
    } catch (err) {
        console.error('❌ Error fetching data:', err);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

// Receive data from ESP
app.post('/esp-data', async (req, res) => {
    try {
        const data = new DataModel(req.body);
        await data.save();
        res.status(201).json({ message: 'Data saved successfully 🚀' });
    } catch (err) {
        console.error('❌ Error saving data:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// Update mode (Di Kamar / Di Luar)
app.post('/mode', (req, res) => {
    const { inRoom } = req.body;
    currentMode.inRoom = inRoom;
    console.log(`📍 Mode updated: ${inRoom ? 'Di Kamar' : 'Di Luar'}`);
    res.json({ message: 'Mode updated', inRoom: currentMode.inRoom });
});

// Get current mode
app.get('/mode', (req, res) => {
    res.json(currentMode);
});

// Register FCM token
app.post('/token', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ error: 'Token diperlukan' });
        }
        await TokenModel.findOneAndUpdate(
            { token },
            { token },
            { upsert: true, new: true }
        );
        res.json({ message: 'Token saved ✅' });
    } catch (err) {
        console.error('❌ Error saving token:', err);
        res.status(500).json({ error: 'Gagal menyimpan token' });
    }
});

// Activate buzzer
app.post('/buzzer/on', (req, res) => {
    console.log('🔔 BUZZER ACTIVATED!');
    res.json({ message: 'Buzzer activated 🔔' });
});

// ===================== START SERVER =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
