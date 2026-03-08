# Elev8 — Product Owner Perspective: Building & Scaling Elev8 Signal

*This document is part of the Elev8 product team's foundational context. It provides the perspective of a world-class Product Owner who has successfully built and scaled community engagement products, survey-to-insight platforms, and exclusive membership experiences similar to Elev8 Signal. Read alongside company.md (strategic context), legal-compliance.md (legal constraints), cognitive-psychology.md (behavioral design), and product-manager.md (product strategy).*

---

## Why This Perspective Matters

Elev8 Signal is not a standard survey tool. It is a weekly engagement engine, an intelligence platform, a member acquisition funnel, and the discovery layer for the entire Elev8 ecosystem — all in one. A Product Owner who has scaled similar products knows that the difference between a platform leaders use once and one they rely on every week comes down to ruthless prioritization, obsessive attention to the micro-interactions, and an unwavering focus on delivering value before asking for anything.

This document translates Elev8's strategic vision into tactical product guidance — the backlog priorities, user story frameworks, acceptance criteria patterns, and build-sequence decisions that will determine whether Signal succeeds or fails in its first 90 days.

---

## 1. The MVP Trap: What to Build First (and What to Resist)

**The most common mistake** with products like Signal is building too many features at launch. Community engagement platforms fail not because they lack features but because the core loop isn't tight enough to create a habit.

**The Signal core loop is:**
1. Member receives a question → 2. Member votes (30 seconds) → 3. Member sees immediate peer comparison → 4. Member receives insights report → 5. Member discovers a gap → 6. Member connects with a Superpower giver

**Build Sequence — Phase 1 (Weeks 1-4): The Habit Loop**
- The weekly question delivery mechanism (email + in-app)
- The voting interface (one tap, under 10 seconds to complete)
- Immediate post-vote feedback ("You voted X. Here's how your peers are trending...")
- Member email verification and authentication
- Basic analytics dashboard (internal — who voted, response rates, trends)

**Build Sequence — Phase 2 (Weeks 5-8): The Value Delivery**
- The insights report generation and delivery
- Report personalization (showing the member's answer relative to peers)
- The non-member sneak peek experience with FOMO gating
- The membership request form triggered from the sneak peek

**Build Sequence — Phase 3 (Weeks 9-12): The Ecosystem Bridge**
- The Signal-to-Superpower bridge (browsing relevant experts from within the report)
- 1:1 exchange request flow initiated from the insights report
- Challenge identification engine (aggregating Signal data to identify Elevate Breakfast topics)

**What to resist building in the first 90 days:**
- Complex member profiles (keep it minimal — name, title, company, domain, superpower)
- Social features (comments, reactions, threads — these dilute the core loop)
- Notification customization (ship with sensible defaults, optimize later)
- Admin dashboards beyond basic analytics
- Integration with external tools (Slack, calendar, etc.)

---

## 2. User Stories That Actually Matter

Not all user stories are equal. For Signal, the stories that determine product-market fit are the ones tied to the core habit loop. Everything else is noise until the loop works.

### Tier 1: Must Ship (Core Loop)

**As a member**, I want to receive one clear, relevant question each week so that I can share my perspective in under 30 seconds without it feeling like a burden.

*Acceptance criteria:*
- Question arrives at a consistent day/time each week
- The question is immediately understandable without additional context
- Voting requires a single tap/click — no multi-step process
- Total time from opening to completing the vote is under 30 seconds
- Member receives confirmation that their vote was recorded

**As a member**, I want to see how my answer compares to my peers immediately after voting so that I get instant value from participating.

*Acceptance criteria:*
- Post-vote comparison appears within 2 seconds of submitting
- Shows percentage breakdown of how other members responded
- Does not reveal individual identities — only aggregate data
- Feels insightful, not just statistical (e.g., framing matters — "You're aligned with 68% of VPs" vs. just showing numbers)

**As a member**, I want to receive an insights report that turns the raw data into actionable intelligence so that I understand what my peer group is thinking and where I stand.

*Acceptance criteria:*
- Report is delivered within 48 hours of the voting window closing
- Report contains analysis, not just charts — what the data means, not just what it shows
- My personal response is contextualized within the broader data
- Report is scannable in under 3 minutes but has depth for those who want to dig in
- Report is visually polished — this audience has high design standards

### Tier 2: Must Ship (Acquisition Funnel)

**As a non-member**, I want to see a preview of Signal's value so that I understand what I'm missing and feel motivated to apply for membership.

*Acceptance criteria:*
- Non-member can access a teaser of the insights report without logging in
- Teaser reveals enough structure and quality to demonstrate value
- Teaser withholds the specific data, key insights, and actionable takeaways
- Membership application prompt appears at the moment of peak curiosity
- The transition from teaser to application is frictionless (pre-filled where possible)

**As a non-member**, I want to participate in the weekly vote so that I get a taste of the experience before committing to membership.

*Acceptance criteria:*
- Non-member can vote using their email address
- After voting, they see a gated version of the comparison (e.g., "Join to see how 150+ tech leaders at Google, Meta, and Samsung answered")
- Email is captured with proper consent for follow-up
- Non-member receives a follow-up email within 24 hours with the sneak peek and membership CTA

### Tier 3: Must Ship (Ecosystem Bridge)

**As a member**, I want to discover which peers have expertise related to an insight that surprised me so that I can learn from them through a Superpower Exchange.

*Acceptance criteria:*
- Insights report includes contextual links to relevant Superpower profiles
- Links are curated, not just keyword-matched (e.g., if the insight is about AI infrastructure, show members who have actually implemented AI infrastructure — not just anyone with "AI" in their profile)
- Clicking through shows a brief Superpower summary and an "Request Exchange" button
- The exchange request pre-populates context from the Signal insight that triggered it

---

## 3. The Question Engine: The Most Underestimated Component

The weekly question is the atomic unit of the entire Elev8 ecosystem. If the question is boring, irrelevant, or predictable, nothing else matters — members will stop engaging within 4-6 weeks.

**What makes a great Signal question:**
- **Timely:** Connected to something happening in the industry right now
- **Opinionated:** Forces a choice between two or more defensible positions (not just "rate on a scale of 1-5")
- **Peer-relevant:** Every member should think "I want to know how other leaders at my level answered this"
- **Actionable:** The aggregated answers should produce an insight that changes behavior or thinking
- **Non-obvious:** The "right" answer should not be clear — uncertainty drives engagement

**What kills a Signal question:**
- Questions with an obviously "correct" answer (no curiosity about peers' responses)
- Questions that are too broad ("What's the biggest challenge in tech?")
- Questions that feel like market research for a company (triggers suspicion)
- Questions that repeat themes too frequently (habituation)
- Questions that require too much thought for a weekly micro-interaction

**Question sequencing strategy:**
- Rotate between question types: opinion, prediction, self-assessment, peer comparison, "what would you do" scenarios
- Follow a Signal question with a related Elevate Breakfast or Superpower Session — create the feeling that the ecosystem responds to what members care about
- Every 4th question should be a "prediction" type (these generate the most compelling insights reports because you can track accuracy over time)

---

## 4. Backlog Prioritization Framework

For a product serving senior executives, the standard prioritization frameworks (RICE, MoSCoW) need to be adapted. Here's the framework that works for products like Signal:

**The Trust-Value-Habit (TVH) Framework:**

Score every backlog item on three dimensions:

**Trust Impact (-2 to +2):** Does this feature build or erode member trust?
- +2: Actively builds trust (e.g., transparent data usage disclosure)
- +1: Neutral to slightly positive
- 0: No trust impact
- -1: Could create skepticism (e.g., excessive data collection)
- -2: Actively erodes trust (e.g., anything that feels like surveillance)

**Value Delivery (1-5):** How much "must-have" value does this deliver to the member?
- 5: Member would feel at a serious disadvantage without it
- 4: Clearly valuable, saves significant time or provides unique insight
- 3: Useful but not essential
- 2: Nice to have
- 1: Minimal perceived value

**Habit Formation (1-5):** Does this strengthen or weaken the weekly engagement loop?
- 5: Directly reinforces the core habit loop
- 4: Supports the habit loop indirectly
- 3: Neutral — doesn't affect engagement patterns
- 2: Could distract from the core loop
- 1: Actively competes with or fragments the core loop

**Priority Score = Trust Impact × 2 + Value Delivery + Habit Formation**

Any item with a negative Trust Impact should be flagged for review regardless of other scores. Trust is not tradeable — you cannot compensate for trust erosion with value delivery.

---

## 5. Sprint Cadence and Stakeholder Communication

**Recommended sprint cadence: 1-week sprints for the first 12 weeks, then 2-week sprints.**

Rationale: The first 90 days are about finding the core loop. One-week sprints force rapid iteration and prevent over-building. After the core loop is validated (measured by week-over-week retention of voting behavior), switch to 2-week sprints for deeper feature development.

**Weekly stakeholder update (during Phase 1) should include:**
- Voting participation rate (target: 60%+ of members vote weekly)
- Time-to-vote (target: under 30 seconds from email open)
- Post-vote engagement (did they look at the comparison? How long?)
- Report engagement (open rate, time spent, scroll depth)
- Non-member conversion (how many non-members entered email, how many applied)
- Qualitative feedback (direct quotes from members about the experience)

**Do not report on:**
- Feature completion percentages (nobody cares how many tickets were closed)
- Technical metrics that don't connect to member behavior
- Vanity metrics (total page views, total users — only active engagement matters)

---

## 6. Quality Bar: What "Done" Means for This Audience

Senior executives at Google, Meta, Nvidia, and Samsung use world-class products every day. Their baseline expectation for product quality is extremely high. "Good enough" for a typical B2B SaaS is embarrassing for this audience.

**"Done" for Elev8 Signal means:**
- **Visual polish:** Every screen, email, and report must look like it was designed by a top-tier design team. No default Bootstrap/Tailwind aesthetics. No stock illustrations. The design should feel exclusive and premium — matching the caliber of the membership.
- **Copy quality:** Every word of UI copy, email subject line, and report narrative should be written at a level that respects executive intelligence. No jargon. No filler. No "Hey there!" casualness. Clear, confident, substantive.
- **Performance:** Pages load in under 2 seconds. Votes register instantly. Reports render without lag. Senior leaders have zero patience for slow products.
- **Mobile-first:** These leaders check email and make quick decisions on their phones. The voting experience must be flawless on mobile. The report must be readable on mobile. If it only works well on desktop, it's not done.
- **Error handling:** No broken states, no cryptic error messages, no "something went wrong." If something fails, fail gracefully with a clear explanation and a path forward.

---

## 7. Red Flags to Watch For

From experience building similar products, here are the early warning signs that something is going wrong:

**Voting participation drops below 40% in week 4-6.** This means the questions aren't compelling enough, the timing is off, or the immediate post-vote feedback isn't delivering enough value to justify the habit.

**Members vote but don't open the insights report.** This means the report isn't delivering on the promise of the vote. The gap between "I voted" and "I got value" is too long or the report isn't compelling enough.

**Non-members enter email but don't apply for membership.** The sneak peek is either showing too much (no FOMO) or too little (no credibility). Calibrate the reveal.

**Members read the report but don't click through to Superpower profiles.** The bridge between insight and action is too weak. The CTAs may be poorly placed, the framing may not reduce the vulnerability barrier, or the Superpower directory may not feel relevant.

**The team starts building features nobody asked for.** In the absence of clear member feedback, teams default to building what's technically interesting. Every feature in the first 90 days should be directly traceable to a member behavior you're trying to create or reinforce.

---

## 8. The Non-Negotiable Principles

These should be printed and pinned above every team member's desk:

**1. The question is the product.** If the weekly question isn't compelling, nothing else matters. Invest disproportionate effort in question design.

**2. Value before ask.** Never ask a member for anything (data, time, feedback) without delivering value first. The post-vote comparison is value. The insights report is value. A Superpower match is value. Always give before you take.

**3. Respect the 30-second window.** A VP at Google will give you 30 seconds. If you can't deliver value in that window, you've lost them for the week — and possibly forever.

**4. The report is a product, not a deliverable.** The insights report is not a PDF attachment. It is a carefully designed product experience that should feel as polished as a Bloomberg terminal or a McKinsey deck. Treat it accordingly.

**5. Every metric should answer: "Is the habit forming?"** The only thing that matters in the first 90 days is whether members are building a weekly habit around Signal. Every metric, every standup, every retro should center on this question.

---

## Related Documents

- **company.md** — What Elev8 is, mission, founder story, programs, vision, and product design principles
- **legal-compliance.md** — 10 critical legal and compliance areas that constrain product design
- **cognitive-psychology.md** — Behavioral science principles for designing features for senior executive users
- **product-owner.md** (this document) — Tactical product guidance for building and scaling Elev8 Signal
- **product-manager.md** — Strategic product vision, roadmap, positioning, and growth strategy for Elev8 Signal
