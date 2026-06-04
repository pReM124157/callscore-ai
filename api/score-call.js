const { scoreTranscript } = require("../lib/scoreEngine");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed. Use POST.",
      });
    }

    const { transcript } = req.body || {};

    if (!transcript || !transcript.trim()) {
      return res.status(400).json({
        error: "transcript is required",
      });
    }

    const result = await scoreTranscript(transcript);

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
