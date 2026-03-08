# Elev8 — Data & Analytics Agent: Data Architecture, Intelligence & Anonymization for Elev8 Signal

*This document is part of the Elev8 product team's foundational context. It provides the perspective of a world-class data architect and analytics leader who has built proprietary intelligence platforms for high-value, privacy-sensitive audiences. Read alongside company.md, legal-compliance.md, cognitive-psychology.md, product-owner.md, product-manager.md, and ux-design.md.*

---

## Why This Perspective Matters

Elev8 Signal's long-term competitive moat is its data asset — a longitudinal dataset of executive sentiment from a curated, verified peer group. The decisions made about data architecture in the first 90 days will determine whether this asset becomes genuinely irreplaceable or just another survey database. Simultaneously, the data architecture must solve the hardest constraint in the system: producing rich, actionable intelligence while protecting the identity and privacy of members who are senior leaders at publicly traded companies.

---

## 1. Data Architecture Principles

### Principle 1: Schema for Intelligence, Not Just Storage
Every data point captured should be structured to support three time horizons of analysis:

- **Real-time:** Immediate post-vote comparison ("here's how your peers answered right now")
- **Periodic:** Weekly/monthly insights reports ("here's what shifted this quarter")
- **Longitudinal:** Year-over-year trend analysis ("here's how executive sentiment on AI evolved over 24 months")

Most survey tools only support the first. Elev8's differentiation requires all three.

### Principle 2: Member Attributes as Analytical Dimensions
Every response should be tagged with anonymized member attributes that enable segmentation without identification:

- **Seniority tier:** L6-L7 / L8 / L9-L10 (never exact title)
- **Company tier:** FAANG-equivalent / Major tech / Growth-stage / Korean tech (never specific company for groups smaller than 5)
- **Domain:** Infrastructure / AI-ML / Product / Engineering / Data / Security / Business / Operations (mapped from the 8 tech domains)
- **Geography:** US / Korea / Singapore / Other APAC (never city-level for small groups)
- **Tenure in role:** 0-2 years / 3-5 years / 5+ years

These dimensions are what make Signal insights genuinely unique — "72% of L8+ leaders at FAANG-tier companies in the US" is dramatically more valuable than "72% of respondents."

### Principle 3: Separation of Identity and Response
The core data architecture must enforce a hard separation between member identity and response data:

- **Identity store:** Member profile, email, name, company, title, Superpower profile — encrypted at rest, access-controlled.
- **Response store:** Anonymized responses tagged with attribute dimensions only. No foreign key to identity store in the reporting layer.
- **Bridge table:** Maps identity to response for personalization features (showing a member their own answers in context). This bridge must never be accessible to reporting, export, or partner-facing systems.

This is not just a privacy best practice — it's an architectural firewall that protects against both external breaches and internal misuse.

---

## 2. The Anonymization Challenge

### The Small-N Problem
Elev8's membership is curated and relatively small (100+ members in Year 1, scaling over time). In a community of 100-150 senior leaders, the combination of seniority + company tier + domain + geography can easily narrow to a single individual. "L9 leader in AI at a FAANG company in Korea" might be exactly one person.

### Anonymization Rules (Non-Negotiable)

**Rule 1: Minimum cohort size.** No insight in any report may be based on a segment with fewer than 10 respondents. If a segment has fewer than 10, it must be combined with an adjacent segment or excluded.

**Rule 2: No exact counts for small segments.** For segments with 10-25 respondents, use ranges ("15-20 leaders") rather than exact counts. Exact counts can help narrow identification.

**Rule 3: No cross-dimensional drilling below threshold.** The report can show "72% of US-based leaders" and "68% of AI-domain leaders" separately — but must NOT show "72% of US-based AI-domain leaders" if that cross-section has fewer than 10 respondents.

**Rule 4: Suppress outlier responses in small segments.** If one response in a small segment is dramatically different from others, showing the distribution could identify the outlier. Use aggregation (mean/median) rather than distribution charts for small segments.

**Rule 5: No company-level attribution.** Never publish insights like "Leaders at Google think X." Even aggregated by company, this creates risk. Attribution must stay at the company-tier level ("Leaders at FAANG-tier companies").

### Anonymization Automation
Build these rules into the report generation pipeline — not as manual editorial checks. Every chart, every insight, every data point should pass through an automated anonymization validator before being included in a report.

---

## 3. The Signal Data Model

### Question Schema
```
Signal_Question {
  question_id: UUID
  question_text: string
  question_type: enum [opinion, prediction, self_assessment, peer_comparison, scenario]
  domain_tags: array[string]  // Which tech domains this relates to
  topic_tags: array[string]   // Specific topics (AI, infrastructure, hiring, etc.)
  answer_options: array[{option_id, option_text, option_order}]
  published_date: timestamp
  voting_window_close: timestamp
  report_publish_date: timestamp
  related_questions: array[question_id]  // For longitudinal tracking
  status: enum [draft, active, closed, reported]
}
```

### Response Schema
```
Signal_Response {
  response_id: UUID
  question_id: UUID (FK)
  selected_option_id: UUID
  responded_at: timestamp
  // Anonymized dimensions — NO identity link in this table
  seniority_tier: enum [L6_L7, L8, L9_L10]
  company_tier: enum [faang_equivalent, major_tech, growth_stage, korean_tech]
  domain: enum [infrastructure, ai_ml, product, engineering, data, security, business, operations]
  geography: enum [us, korea, singapore, other_apac]
  role_tenure: enum [0_2_years, 3_5_years, 5_plus_years]
  is_member: boolean  // Distinguishes member vs. non-member votes
}
```

### Member-Response Bridge (Access-Controlled)
```
Member_Response_Bridge {
  bridge_id: UUID
  member_id: UUID (FK to Identity Store — encrypted)
  response_id: UUID (FK to Response Store)
  // This table exists ONLY to power personalization features
  // NEVER accessible to reporting, export, or partner systems
}
```

### Insight Schema
```
Signal_Insight {
  insight_id: UUID
  question_id: UUID (FK)
  report_id: UUID (FK)
  insight_type: enum [majority_finding, contrarian_finding, trend_shift, prediction_outcome, segment_divergence]
  headline: string  // "72% of leaders are prioritizing AI infrastructure"
  body: string      // Full analysis paragraph
  data_snapshot: JSON  // Frozen data at time of report generation
  segment_filters: JSON  // Which dimensions this insight covers
  min_cohort_size: integer  // Anonymization validation
  superpower_bridge_tags: array[string]  // Topics for matching to Superpower profiles
  created_at: timestamp
}
```

---

## 4. The Intelligence Pipeline

### Stage 1: Collection (Real-Time)
- Votes are captured in the Response Store immediately.
- Post-vote comparison is computed in real-time from the Response Store (no identity data involved).
- Non-member votes are flagged with `is_member: false` and included in aggregate analysis but can be segmented out for member-only reports.

### Stage 2: Analysis (Post-Voting Window)
- After the voting window closes, the analysis pipeline runs.
- Automated segmentation: compute response distributions across all dimensional combinations that meet the minimum cohort threshold.
- Automated anomaly detection: flag any finding where a segment's response distribution differs significantly from the overall distribution (this is where the interesting insights live).
- Longitudinal matching: if this question relates to a previous question (via `related_questions`), compute trend data.
- Prediction tracking: if this is a follow-up to a previous prediction question, compute accuracy rates.

### Stage 3: Anonymization Validation
- Every computed insight passes through the anonymization validator.
- Any insight that violates the minimum cohort rules is flagged for human review or automatically suppressed.
- The validator outputs a compliance log — a record of what was suppressed and why. This log is critical for legal compliance and auditing.

### Stage 4: Report Generation
- Approved insights are assembled into the report structure.
- Personalization layer: the Member-Response Bridge is used to inject the member's own answers into the report. This happens at delivery time, not at report generation time — the core report is identical for everyone; only the "your answer" overlays are personalized.
- Superpower bridge: insights are matched to Superpower profiles via `superpower_bridge_tags`. The matching happens at the tag level — the report shows relevant expertise areas, and the member directory lookup happens when the member clicks through.

### Stage 5: Delivery
- Reports are delivered via email (with a link to the web version) and available in-app.
- The web version is the canonical version — interactive charts, Superpower bridges, and personalization all work best in-app.
- The email version is a summary with a compelling hook to drive traffic to the full web report.

---

## 5. Longitudinal Data Strategy

This is where Elev8's data asset becomes genuinely irreplaceable. After 12 months of weekly questions, the dataset supports analysis that no new entrant can replicate.

### Question Linking
- Maintain a question taxonomy that maps related questions across time.
- Example: Q12 (January) asks "How are you approaching AI infrastructure?" → Q38 (July) asks the same question → Q52 (December) asks again. The system can now show 12-month sentiment evolution.
- Tag questions with `related_questions` at creation time. Retroactive linking should also be supported.

### Prediction Tracking
- For prediction-type questions ("Will your company increase AI investment in Q3?"), track the actual outcome.
- Produce "prediction accuracy" reports: "6 months ago, 62% of you predicted X. Here's what actually happened." This is extremely engaging content and reinforces Signal's credibility.

### Cohort Analysis
- Track how specific segments change over time. "L9+ leaders shifted from 45% prioritizing AI in January to 78% in December."
- These cohort trends are the highest-value insights in the entire system — they reveal executive sentiment shifts before they become visible in public data.

### Annual Intelligence Report
- At the 12-month mark, produce the "State of Tech Leadership" report — a compilation of the year's most significant trends, predictions, and shifts.
- This report serves dual purposes: extraordinary value for members (nobody else has this data) and a public-facing teaser for member acquisition (the sneak peek version).

---

## 6. Analytics for Product Health

Beyond the intelligence reports for members, the data team must track product health metrics:

### Engagement Analytics
- **Vote participation rate** by week, by segment, by question type
- **Time-to-vote** distribution (from email delivery to vote submission)
- **Report engagement** (open rate, scroll depth, time on page, click-through to Superpower profiles)
- **Drop-off analysis** at each step of the Signal-to-Superpower bridge

### Cohort Retention
- **4-week active rate** — what percentage of members voted in all 4 weeks of a given month?
- **Decay curves** — at what week do members typically start disengaging? What question types correlate with re-engagement?
- **Segment-level retention** — do certain seniority levels or domains retain better than others?

### Acquisition Funnel
- **Non-member vote rate** — how many non-members encounter Signal and vote?
- **Sneak peek engagement** — how long do non-members spend on the teaser report?
- **Conversion rate** — what percentage of non-member voters apply for membership?
- **Attribution** — what brought the non-member to Signal? (Member referral, event, website, partner)

### Ecosystem Flow
- **Signal-to-Superpower conversion** — what percentage of report readers initiate an exchange?
- **Signal-to-Breakfast correlation** — do members who engage with Signal insights also attend Elevate Breakfasts on the same topic?
- **Cross-program engagement** — are the most active Signal voters also the most active in other programs?

---

## 7. Data Governance

### Access Control Tiers
- **Tier 1 (Public):** Anonymized, aggregated insights in the sneak peek. Minimum cohort size: 25.
- **Tier 2 (Member):** Full insights reports with segment breakdowns. Minimum cohort size: 10. Personalized with own-answer overlays.
- **Tier 3 (Elev8 Internal):** Product health metrics, engagement analytics, funnel data. No individual member identification in dashboards.
- **Tier 4 (Restricted):** Member-Response Bridge, identity-linked data. Access limited to designated personnel. Full audit logging.

### Data Retention Policy
- **Member responses:** Retained for the duration of membership plus 12 months post-departure (for longitudinal analysis integrity).
- **Non-member votes:** Retained for 6 months if they don't convert. Auto-deleted after.
- **Insights reports:** Retained indefinitely (they are Elev8's intellectual property and core asset).
- **Product analytics:** Raw event data retained for 24 months. Aggregated metrics retained indefinitely.

### Partner Data Boundaries
- Strategic partners (including Coupang) NEVER receive individual member data.
- Partners may receive aggregated, anonymized intelligence reports — the same tier as member-facing reports, with additional anonymization safeguards applied.
- There must be no data pipeline, API, or export mechanism that allows partner systems to access the Identity Store or Member-Response Bridge. This is an architectural requirement, not a policy one.

---

## 8. Technical Recommendations

### Database
- PostgreSQL for the primary data stores (Identity, Response, Bridge, Question, Insight).
- Consider a time-series optimized layer (TimescaleDB extension or similar) for longitudinal analytics.
- Full encryption at rest for the Identity Store and Bridge table.

### Analytics Layer
- Separate the operational database from the analytics database. Reports should be generated from a read replica or analytics warehouse, never from the production database.
- Consider a lightweight analytics framework (dbt + a warehouse) for insight generation pipelines.

### Real-Time Computation
- Post-vote comparison must be computed in under 2 seconds. This is a simple aggregation on the Response Store — no complex joins required.
- Consider materialized views or pre-computed aggregations for the most common segment breakdowns.

### Report Generation
- Semi-automated: the pipeline produces data, charts, and draft insights. A human editor reviews, adds narrative, and approves.
- Over time, increase automation — but always maintain human editorial oversight. The quality bar for this audience demands it.

---

## Related Documents

- **company.md** — Strategic context, mission, programs, and design principles
- **legal-compliance.md** — Legal constraints on data handling (PIPA, cross-border, anonymization requirements)
- **cognitive-psychology.md** — Behavioral science informing how data should be presented
- **product-owner.md** — Tactical build sequence and acceptance criteria
- **product-manager.md** — Product strategy and metrics architecture
- **ux-design.md** — How data visualizations and reports should be designed
- **data-analytics.md** (this document) — Data architecture, intelligence pipeline, and anonymization
- **community-ops.md** — Operational workflows generating and consuming data
- **growth-marketing.md** — Acquisition metrics and funnel analytics
