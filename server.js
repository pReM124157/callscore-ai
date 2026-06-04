require("dotenv").config();

const express = require("express");
const { scoreTranscript } = require("./lib/scoreEngine");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "CallScore AI API is running",
  });
});

app.post("/api/score-call", async (req, res) => {
  try {
    const { transcript } = req.body || {};

    if (!transcript || !transcript.trim()) {
      return res.status(400).json({
        success: false,
        error: "transcript is required",
      });
    }

    const result = await scoreTranscript(transcript);

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("API error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`CallScore AI API running on http://localhost:${PORT}`);
});
