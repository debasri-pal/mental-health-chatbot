const express = require("express");
const mongoose = require("mongoose");
const Sentiment = require("sentiment");
const cors = require("cors");
require("dotenv").config();

const app = express();
const sentiment = new Sentiment();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Message Schema
const Message = mongoose.model("Message", {
  text: String,
  sentimentScore: Number,
  response: String,
});

// Analyze user message and respond
app.post("/api/message", async (req, res) => {
  const { text } = req.body;
  const result = sentiment.analyze(text);

  let response = "I'm here for you. Let's talk.";
  if (result.score < -3) response = "It sounds like you're really struggling. Would you like to try a breathing exercise?";
  else if (result.score < 0) response = "I'm sensing some stress. Remember, it's okay to take a break.";

  const message = new Message({ text, sentimentScore: result.score, response });
  await message.save();

  res.json({ response, sentiment: result.score });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
