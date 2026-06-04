const transcriptInput = document.getElementById("transcript");
const scoreBtn = document.getElementById("scoreBtn");
const statusText = document.getElementById("status");

scoreBtn.addEventListener("click", async () => {
  const transcript = transcriptInput.value.trim();

  if (!transcript) {
    statusText.textContent = "Please paste a transcript first.";
    return;
  }

  try {
    scoreBtn.disabled = true;
    scoreBtn.textContent = "Generating...";
    statusText.textContent = "Generating executive scorecard...";

    const response = await fetch("/api/score-call", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transcript }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to score call");
    }

    localStorage.setItem("callscore_result", JSON.stringify(data.result));

    window.location.href = "/report.html";
  } catch (error) {
    statusText.textContent = error.message;
  } finally {
    scoreBtn.disabled = false;
    scoreBtn.textContent = "Generate Scorecard";
  }
});
