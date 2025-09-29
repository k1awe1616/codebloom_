const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config(); // must come before process.env usage

const app = express();

// ✅ CORS setup
const corsOptions = {
  origin: [
    "http://127.0.0.1:5500",  // local (static HTML on VS Code Live Server)
    "http://localhost:5000",  // local (if you run frontend on Express)
    "https://frontend-codebloom1.onrender.com" // deployed frontend
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ MongoDB connection
const MONGO_URL =
  process.env.MONGO_URL ||
  "mongodb+srv://k1awe1616_db_user:Yellychan.16@cluster0.lzhloid.mongodb.net/gamified?retryWrites=true&w=majority&appName=Cluster0";

console.log("MONGO_URL:", MONGO_URL);

mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ---------------- SCHEMAS ----------------

// Accounts schema
const schema1 = new mongoose.Schema({
  fullname: String,
  username: String,
  password: String,
  ID: String,
  birthday: String,
  SOT: String,
});

// Results schema
const resultSchema = new mongoose.Schema({
  username: { type: String, required: true },
  results: [
    {
      language: { type: String, required: true },
      score: { type: Number, required: true },
      time: { type: Number, required: true },
    },
  ],
});

// Register models
const model1 = mongoose.model("accounts", schema1);
const ResultModel = mongoose.model("results", resultSchema);

// Serve static frontend (if needed, for local HTML testing)
app.use(express.static('./src'));

// ---------------- ROUTES ----------------

// LOGIN
app.post('/', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await model1.findOne({ username, password });

    if (user) {
      console.log("Login successful:", user.username);
      return res.json({
        success: true,
        username: user.username,
        fullname: user.fullname,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error, please try again later",
    });
  }
});

// REGISTRATION
app.post('/api/register', async (req, res) => {
  const { fullname, username, password, ID, bday, SOT } = req.body;
  try {
    const data = await model1.create({
      fullname,
      username,
      password,
      ID,
      birthday: bday,
      SOT,
    });
    console.log("Registered:", data);

    res.json({ success: true, message: "Registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ success: false, message: "Error registering user" });
  }
});

// FORGOT PASSWORD
app.post('/forgot-password', async (req, res) => {
  const { ID, newPassword } = req.body;

  try {
    const user = await model1.findOneAndUpdate(
      { ID },
      { password: newPassword },
      { new: true }
    );
    if (user) {
      console.log("Password updated:", user);
      res.json({ success: true, message: "Password updated successfully!" });
    } else {
      res.status(404).json({ success: false, message: "ID not found!" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error updating password." });
  }
});

// API: fetch accounts
app.get('/api/accounts', async (req, res) => {
  try {
    const users = await model1.find({}, 'fullname');
    res.json(users);
  } catch (err) {
    console.error("Error fetching accounts:", err);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

// API: save result
app.post("/api/save_result", async (req, res) => {
  const { username, language, score, time } = req.body;
  try {
    let userResult = await ResultModel.findOne({ username });
    if (!userResult) {
      userResult = new ResultModel({
        username,
        results: [{ language, score, time }],
      });
    } else {
      const existing = userResult.results.find((r) => r.language === language);
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

// API: leaderboard
app.get("/api/leaderboard/:language", async (req, res) => {
  const { language } = req.params;
  try {
    const results = await ResultModel.find().lean();
    const accounts = await model1.find().lean();
    const leaderboard = results.flatMap((user) =>
      user.results
        .filter((r) => r.language === language)
        .map((r) => {
          const account = accounts.find(
            (acc) => acc.username === user.username
          );
          return {
            name: account ? account.fullname : user.username,
            score: r.score,
            time: r.time,
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

// API: overall scores
app.get("/api/overall-scores", async (req, res) => {
  try {
    const results = await ResultModel.find().lean();
    const accounts = await model1.find().lean();
    const students = results.map((user) => {
      const account = accounts.find((acc) => acc.username === user.username);
      let scores = {};
      let totalScore = 0;
      user.results.forEach((r) => {
        scores[r.language] = r.score;
        totalScore += r.score;
      });
      return {
        name: account ? account.fullname : user.username,
        totalScore,
        scores,
      };
    });
    res.json(students);
  } catch (err) {
    console.error("Error fetching overall scores:", err);
    res.status(500).json({ error: "Failed to fetch overall scores" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server Ready! Listening on http://localhost:${PORT}`)
);
