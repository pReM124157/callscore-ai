require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { scoreTranscript } = require("./lib/scoreEngine");

async function runLocalScoring() {
  try {
    const transcriptArg = process.argv[2];

    const transcriptPath = transcriptArg
      ? path.resolve(__dirname, transcriptArg)
      : path.join(__dirname, "transcript.txt");

    if (!fs.existsSync(transcriptPath)) {
      throw new Error(`Transcript file not found: ${transcriptPath}`);
    }

    const transcript = fs.readFileSync(transcriptPath, "utf8");

    if (!transcript.trim()) {
      throw new Error(`Transcript file is empty: ${transcriptPath}`);
    }

    console.log("Using transcript:", transcriptPath);

    const parsedJson = await scoreTranscript(transcript);
    const resultPath = path.join(__dirname, "result.json");

    fs.writeFileSync(
      resultPath,
      JSON.stringify(parsedJson, null, 2),
      "utf8"
    );

    console.log("\n===== JSON PARSE + VALIDATION SUCCESS =====\n");
    console.log("Provider Used:", parsedJson.provider_used);
    console.log("Final Score:", parsedJson.final_score);
    console.log("Verdict:", parsedJson.verdict);
    console.log("Weighted Score:", parsedJson.weighted_score);
    console.log("Saved Result:", resultPath);
  } catch (error) {
    const rawErrorPath = path.join(__dirname, "raw_response.txt");

    fs.writeFileSync(
      rawErrorPath,
      error.stack || error.message,
      "utf8"
    );

    console.error("\n===== ERROR =====\n");
    console.error("Message:", error.message);
    console.error("Full Error:", error);
    console.error("Saved error details:", rawErrorPath);
  }
}

runLocalScoring();
