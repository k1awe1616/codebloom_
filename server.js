const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // <-- Add this

dotenv.config(); // must come before process.env usage

const app = express(); // ← MUST add this

const cors = require("cors");
app.use(cors({
  origin: "https://frontend-codebloom1.onrender.com",  // your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Enable CORS for your frontend
app.use(cors({
    origin: process.env.ORIGIN || '*' // ORIGIN from .env, fallback to allow all
}));

const MONGO_URL = process.env.MONGO_URL;
console.log("MONGO_URL:", MONGO_URL); // debugging

mongoose.connect(MONGO_URL)
    .then(() => console.log('MongoDB connected!'))
    .catch(err => console.error('MongoDB connection error:', err));

// Accounts schema (existing one)
const schema1 = new mongoose.Schema({
    fullname: String,
    username: String,
    password: String,
    ID: String,
    birthday: String,
    SOT: String,
});

// New schema for storing results like a dictionary
const resultSchema = new mongoose.Schema({
    username: { type: String, required: true },
    results: [
        {
            language: { type: String, required: true },
            score: { type: Number, required: true },
            time: { type: Number, required: true }
        }
    ]
});

// Register models
const model1 = mongoose.model("accounts", schema1);
const ResultModel = mongoose.model("results", resultSchema);

// Middleware
app.use(express.static('./src'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.post('/', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await model1.findOne({ username, password });

        if (user) {
            console.log("Login successful:", user.username);
            return res.redirect(`/Menu.html?username=${encodeURIComponent(user.username)}`);
        } else {
            return res.redirect('/index.html?error=1');
        }
    } catch (err) {
        console.error("Login error:", err);
        return res.redirect('/index.html?error=1');
    }
});

app.post('/registration.html', async (req, res) => {
    const { fullname, username, password, ID, bday, SOT } = req.body;
    const data = await model1.create({ fullname, username, password, ID, birthday: bday, SOT });
    console.log("Registered:", data);
    res.redirect('/index.html');
});

// Forgot Password
app.post('/forgot-password', async (req, res) => {
    const { ID, newPassword } = req.body;

    try {
        const user = await model1.findOneAndUpdate({ ID }, { password: newPassword }, { new: true });
        if (user) {
            console.log("Password updated:", user);
            res.send("<h2>Password updated successfully! <a href='/index.html'>Login</a></h2>");
        } else {
            res.send("<h2>ID not found! <a href='/forgotpassword.html'>Try Again</a></h2>");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating password.");
    }
});

// API Routes
app.get('/api/accounts', async (req, res) => {
    try {
        const users = await model1.find({}, 'fullname');
        res.json(users);
    } catch (err) {
        console.error("Error fetching accounts:", err);
        res.status(500).json({ error: "Failed to fetch accounts" });
    }
});

app.post("/api/save_result", async (req, res) => {
    const { username, language, score, time } = req.body;
    try {
        let userResult = await ResultModel.findOne({ username });
        if (!userResult) {
            userResult = new ResultModel({ username, results: [{ language, score, time }] });
        } else {
            const existing = userResult.results.find(r => r.language === language);
            if (existing) {
                existing.score = score;
                existing.time = time;
            } else {
                userResult.results.push({ language, score, time });
            }
        }
        await userResult.save();
        res.json({ success: true, message: "Result saved!", data: userResult });
    } catch (err) {
        console.error("Error saving result:", err);
        res.status(500).json({ success: false, message: "Error saving result" });
    }
});

app.get("/api/leaderboard/:language", async (req, res) => {
    const { language } = req.params;
    try {
        const results = await ResultModel.find().lean();
        const accounts = await model1.find().lean();
        const leaderboard = results.flatMap(user =>
            user.results
                .filter(r => r.language === language)
                .map(r => {
                    const account = accounts.find(acc => acc.username === user.username);
                    return {
                        name: account ? account.fullname : user.username,
                        score: r.score,
                        time: r.time
                    };
                })
        );
        leaderboard.sort((a, b) => b.score - a.score || a.time - b.time);
        res.json(leaderboard);
    } catch (err) {
        console.error("Error fetching leaderboard:", err);
        res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
});

app.get("/api/overall-scores", async (req, res) => {
    try {
        const results = await ResultModel.find().lean();
        const accounts = await model1.find().lean();
        const students = results.map(user => {
            const account = accounts.find(acc => acc.username === user.username);
            let scores = {};
            let totalScore = 0;
            user.results.forEach(r => {
                scores[r.language] = r.score;
                totalScore += r.score;
            });
            return { name: account ? account.fullname : user.username, totalScore, scores };
        });
        res.json(students);
    } catch (err) {
        console.error("Error fetching overall scores:", err);
        res.status(500).json({ error: "Failed to fetch overall scores" });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server Ready! Port: ${PORT}`));
