
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config(); // must come before process.env usage

const app = express(); // ← MUST add this

const MONGO_URL = process.env.MONGO_URL;
console.log("MONGO_URL:", MONGO_URL); // debugging

mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
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
    username: { type: String, required: true },   // who took the test
    results: [
        {
            language: { type: String, required: true }, // e.g. "html", "css"
            score: { type: Number, required: true },    // percentage
            time: { type: Number, required: true }      // seconds
        }
    ]
});

// Register both models
const model1 = mongoose.model("accounts", schema1);   // existing accounts
const ResultModel = mongoose.model("results", resultSchema); // new results


app.use(express.static('./src'))
app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.post('/', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await model1.findOne({ username, password });

        if (user) {
            console.log("Login successful:", user.username);
            return res.redirect(`/Menu.html?username=${encodeURIComponent(user.username)}`);
        } else {
            // Redirect back with error flag
            return res.redirect('/index.html?error=1');
        }
    } catch (err) {
        console.error("Login error:", err);
        return res.redirect('/index.html?error=1');
    }
});

app.post('/registration.html', async (req, res) => {
    const { fullname, username, password, ID, bday, SOT } = req.body; // <-- added fullname
    const data = await model1.create({
      fullname: fullname,
      username: username,
      password: password,
      ID: ID,
      birthday: bday,
      SOT: SOT
    });

    console.log("Registered:", data);
    res.redirect('/index.html');
});


app.listen(5000, () => {
    console.log('Servxer Ready! port:5000')
})







// Forgot Password Route
app.post('/forgot-password', async (req, res) => {
    const { ID, newPassword } = req.body;

    try {
        // Find user by TUP-ID and update password
        const user = await model1.findOneAndUpdate(
            { ID: ID },
            { password: newPassword },
            { new: true }
        );

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




app.get('/api/accounts', async (req, res) => {
  try {
    const users = await model1.find({}, 'fullname'); // only fullname
    res.json(users);
  } catch (err) {
    console.error("Error fetching accounts:", err);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});



// Save a result
app.post("/api/save_result", async (req, res) => {
  const { username, language, score, time } = req.body;

  try {
    // Find if results already exist for this user
    let userResult = await ResultModel.findOne({ username });
    console.log(userResult);
    if (!userResult) {
      // If no record yet → create new
      userResult = new ResultModel({
        username,
        results: [{ language, score, time }]
      });
    } else {
      // If record exists → check if language already exists
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
    // Get results
    const results = await ResultModel.find().lean();
    const accounts = await model1.find().lean(); // get fullnames

    // Flatten results with fullname lookup
    const leaderboard = results.flatMap(user =>
      user.results
        .filter(r => r.language === language)
        .map(r => {
          const account = accounts.find(acc => acc.username === user.username);
          return {
            name: account ? account.fullname : user.username, // prefer fullname
            score: r.score,
            time: r.time
          };
        })
    );

    // Sort by score, then time
    leaderboard.sort((a, b) => b.score - a.score || a.time - b.time);

    res.json(leaderboard);
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});



// Get overall scores across all languages

// ❌ Remove this duplicate:
/*
app.get("/api/overall-scores", async (req, res) => {
   ...
   percentage: percentage.toFixed(2) + "%"
});
*/

// ✅ Keep this one (correct: includes scores object)
app.get("/api/overall-scores", async (req, res) => {
  try {
    const results = await ResultModel.find().lean();
    const accounts = await model1.find().lean(); // to get fullnames

    const students = results.map(user => {
      const account = accounts.find(acc => acc.username === user.username);

      // Build scores object: { html: 10, css: 8, ... }
      let scores = {};
      let totalScore = 0;

      user.results.forEach(r => {
        scores[r.language] = r.score;
        totalScore += r.score;
      });

      return {
        name: account ? account.fullname : user.username,
        totalScore,
        scores
      };
    });

    res.json(students);
  } catch (err) {
    console.error("Error fetching overall scores:", err);
    res.status(500).json({ error: "Failed to fetch overall scores" });
  }
});

// Export Express app as Firebase Function
//exports.api = functions.https.onRequest(app);






