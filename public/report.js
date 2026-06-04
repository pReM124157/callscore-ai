const reportEl = document.getElementById("report");

const saved = localStorage.getItem("callscore_result");

if (!saved) {
  reportEl.innerHTML = `
    <section class="report-card">
      <h2>No report found</h2>
      <p>Please score a call first.</p>
    </section>
  `;
} else {
  const result = JSON.parse(saved);

  const strengths = result.top_strengths || [];
  const weaknesses = result.top_weaknesses || [];
  const priorities = result.coaching_priorities || [];
  const dimensions = result.dimension_scores || {};

  reportEl.innerHTML = `
    <section class="report-card kpi">
      <p class="metric-label">Final Score</p>
      <div class="score">${result.final_score}/3</div>
      <span class="verdict">${result.verdict}</span>
    </section>

    <section class="report-card kpi">
      <p class="metric-label">Weighted Score</p>
      <div class="score">${result.weighted_score}</div>
    </section>

    <section class="report-card kpi">
      <p class="metric-label">Deal Risk</p>
      <div class="score pill-risk">${result.deal_risk_flag || "N/A"}</div>
      <p class="support-copy">${result.deal_risk_reason || ""}</p>
    </section>

    <section class="report-card">
      <h2>Executive Summary</h2>
      <p>${result.executive_summary || ""}</p>
    </section>

    <section class="report-card split">
      <h2>Top Strengths</h2>
      <ul>
        ${strengths.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </section>

    <section class="report-card split">
      <h2>Top Weaknesses</h2>
      <ul>
        ${weaknesses.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </section>

    <section class="report-card">
      <h2>Coaching Priorities</h2>
      <ul>
        ${priorities.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </section>

    <section class="report-card">
      <h2>Dimension Scores</h2>
      <pre>${JSON.stringify(dimensions, null, 2)}</pre>
    </section>

    <section class="report-card">
      <h2>Recommended Next Action</h2>
      <p>${result.recommended_next_action || ""}</p>
    </section>
  `;
}
