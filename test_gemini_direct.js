require("dotenv").config();

async function testGeminiDirect() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing from .env");
    }

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
      apiKey;

    const body = {
      contents: [
        {
          parts: [
            {
              text: 'Reply with only this JSON: {"status":"ok"}',
            },
          ],
        },
      ],
    };

    console.log("Testing direct Gemini API request...");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("HTTP Status:", response.status);

    const text = await response.text();

    console.log("\n===== RAW RESPONSE =====\n");
    console.log(text);
  } catch (error) {
    console.error("\n===== DIRECT TEST ERROR =====\n");
    console.error("Message:", error.message);
    console.error("Cause:", error.cause);
    console.error("Full Error:", error);
  }
}

testGeminiDirect();
