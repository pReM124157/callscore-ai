const fs = require("fs");
const path = require("path");

function cleanJsonResponse(responseText) {
  let cleaned = responseText.trim();

  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No valid JSON object found in AI response");
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
}

function validateScoreResult(parsedJson) {
  const requiredTopLevelFields = [
    "call_metadata",
    "dimension_scores",
    "discovery_checklist",
    "buying_signals",
    "objections_or_risks",
    "weighted_score",
    "final_score",
    "verdict",
    "executive_summary",
    "top_strengths",
    "top_weaknesses",
    "coaching_priorities",
    "deal_risk_flag",
    "deal_risk_reason",
    "recommended_next_action",
    "confidence_level",
  ];

  const missingFields = requiredTopLevelFields.filter(
    (field) => !(field in parsedJson)
  );

  if (missingFields.length > 0) {
    throw new Error(
      `AI response is missing required fields: ${missingFields.join(", ")}`
    );
  }

  if (![1, 2, 3].includes(parsedJson.final_score)) {
    throw new Error("final_score must be 1, 2, or 3");
  }

  if (!["Excellent", "Good", "Poor"].includes(parsedJson.verdict)) {
    throw new Error("verdict must be Excellent, Good, or Poor");
  }

  if (typeof parsedJson.weighted_score !== "number") {
    throw new Error("weighted_score must be a number");
  }

  return true;
}

async function generateWithGroq({ apiKey, systemPrompt, transcript }) {
  if (!apiKey) {
    throw new Error("Groq API key is missing.");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Score this sales call transcript:\n\n${transcript}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("Groq returned empty response");
  }

  return text;
}

function readSystemPrompt() {
  const systemPromptPath = path.join(process.cwd(), "system_prompt.txt");

  if (!fs.existsSync(systemPromptPath)) {
    throw new Error("system_prompt.txt not found in project root");
  }

  const systemPrompt = fs.readFileSync(systemPromptPath, "utf8");

  if (!systemPrompt.trim()) {
    throw new Error("system_prompt.txt is empty");
  }

  return systemPrompt;
}

async function scoreTranscript(transcript) {
  if (!transcript || !transcript.trim()) {
    throw new Error("Transcript is required");
  }

  const systemPrompt = readSystemPrompt();
  const groqKeys = [
    {
      key: process.env.GROQ_API_KEY,
      provider: "groq",
      label: "Groq (primary)",
    },
    {
      key: process.env.GROQ_FALLBACK_API_KEY,
      provider: "groq-fallback",
      label: "Groq (fallback 1)",
    },
    {
      key: process.env.GROQ_SECONDARY_FALLBACK_API_KEY,
      provider: "groq-fallback-2",
      label: "Groq (fallback 2)",
    },
  ].filter((entry) => entry.key);

  let responseText;
  let providerUsed;
  let lastGroqError;

  if (groqKeys.length === 0) {
    throw new Error(
      "Add GROQ_API_KEY or one of the Groq fallback keys to your .env file"
    );
  }

  for (const groqEntry of groqKeys) {
    try {
      console.log(`Trying API: ${groqEntry.label}`);
      responseText = await generateWithGroq({
        apiKey: groqEntry.key,
        systemPrompt,
        transcript,
      });
      providerUsed = groqEntry.provider;
      break;
    } catch (groqError) {
      lastGroqError = groqError;
      console.log(`\n===== ${groqEntry.label.toUpperCase()} FAILED =====\n`);
      console.log("Groq Error:", groqError.message);
    }
  }

  if (!responseText) {
    throw lastGroqError;
  }

  const cleanedJsonText = cleanJsonResponse(responseText);
  const parsedJson = JSON.parse(cleanedJsonText);

  validateScoreResult(parsedJson);

  parsedJson.provider_used = providerUsed;

  return parsedJson;
}

module.exports = {
  scoreTranscript,
  cleanJsonResponse,
  validateScoreResult,
};
