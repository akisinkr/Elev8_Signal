# Superpower Exchange: Matching Logic Reference Document

Compiled from all source documents in the Superpower Exchange design system.
This document consolidates every section related to matching logic, matching criteria, superpower-to-challenge pairing, match quality scoring, and curation frameworks.

---

## 1. Matching Philosophy

### Why Human-Curated Matching

The Superpower Exchange is built on one foundational belief: **the best leaders already have what other leaders need -- they just lack the mechanism to find each other.**

> "The Superpower Exchange is built on a simple premise: the best leaders already have what other leaders need -- they just lack the mechanism to find each other."
>
> -- Source: elev8-superpower-exchange.md, Section 1

Matching is **human-curated by Elev8 staff**, not algorithmic. The design documents are explicit about why:

> "Matching is human-curated by Elev8 staff, not algorithmic. Here's why: an algorithm sees 'CFO' and 'fundraising' as keywords. An Elev8 curator sees that this particular CFO navigated a down round while managing a co-founder departure -- and knows exactly which three members have faced that specific situation."
>
> -- Source: elev8-superpower-exchange.md, Section 3.3

> "Manual matching IS the MVP. 'Let's add a matching algorithm to help curators' is the #1 scope creep risk. Human curation is the quality signal we're testing."
>
> -- Source: elev8-mvp-must-have-benefits.md, "What We're NOT Building" table

### Core Design Principles

From the program design document:

> - **Reciprocity over charity.** Everyone gives and receives. No passengers.
> - **Depth over breadth.** One deep exchange beats ten shallow introductions.
> - **Human curation over algorithmic guessing.** Elev8 staff match members based on context, not keywords.
> - **Low friction, high signal.** Respect for executive time at every touchpoint.
>
> -- Source: elev8-superpower-exchange.md, Section 1

### The Core Pairing Principle

A match pairs someone who **has done it** with someone who **needs to do it now**:

> "A good match pairs someone who has done it with someone who needs to do it now -- across these dimensions."
>
> -- Source: 01-tech-leader-profiler.md, Section 1 (Matching Dimensions)

The MVP benefits brief frames the bar the matching must clear:

> "This is the entire product trial. A generic or obviously bad first match means the member is gone -- permanently. The reluctant adopter's bar is 'be better than texting my existing 5 people.' Specificity is the only way to clear it."
>
> -- Source: elev8-mvp-must-have-benefits.md, Must-Have Benefit #1

### North Star

> "Every Elev8 member gives one superpower and gains access to dozens. The community becomes a living, breathing advisory board -- on-demand, peer-validated, and built on trust."
>
> -- Source: elev8-superpower-exchange.md, Section 1

---

## 2. Matchable Superpower Framework

### The 4-Component Formula

A matchable superpower has four components. This formula is the foundation of how profiles are structured for matching:

```
[Specific Capability] + [Proven Context] + [Measurable Outcome] + [Stage/Scale Marker]
```

> -- Source: 01-tech-leader-profiler.md, Section 1

Each component serves a specific matching function:

| Component | Purpose | Matching Value |
|---|---|---|
| **Specific Capability** | What you actually do differently | Enables skill-to-need matching |
| **Proven Context** | Where you've done it (industry, company stage, constraints) | Enables situational matching |
| **Measurable Outcome** | What happened as a result | Establishes credibility, not just claims |
| **Stage/Scale Marker** | Company size, funding stage, team size, or regulatory environment | Enables peer-relevance matching |

> -- Source: 01-tech-leader-profiler.md, Section 1

**Example of a matchable statement:**

> "Scaled an engineering org from 20 to 200 engineers through Series B-D while maintaining sub-2-week release cycles and cutting attrition below 8%."
>
> -- Source: 01-tech-leader-profiler.md, Section 1

**What is unmatchable vs. matchable:**

> **Unmatchable**: "I'm good at strategy"
> **Matchable**: "Scaled an engineering org from 20 to 200 through Series B-D while cutting attrition below 8%."
>
> -- Source: PRODUCT-SPEC.md, Section 4

### The Three Failure Modes (What Makes a Superpower Unmatchable)

Senior tech leaders fail at self-describing their superpowers in three predictable ways:

| Failure Mode | Example | Why It Fails |
|---|---|---|
| **Too broad** | "I'm good at strategy" | Not differentiating. Every leader says this. |
| **Too humble** | "I just help teams work better" | No signal for matching. Undersells real expertise. |
| **Too jargon-heavy** | "I build event-driven microservice architectures" | Technical flex, not a matchable outcome. |

> -- Source: 01-tech-leader-profiler.md, Section 1

### What Makes a Superpower Credible

Drawing from executive coaching research (Gallup CliftonStrengths, 360-degree assessment methodology, and the Appreciative Inquiry model):

> 1. **Specificity over superlatives** -- "I rebuilt our security posture after a breach that made national news" beats "I'm a cybersecurity expert"
> 2. **Situational constraints** -- The harder the constraint, the more impressive the outcome. "Under SOC2 and HIPAA compliance" or "with a $0 tooling budget" adds real signal
> 3. **Repeatability signal** -- Has this person done it more than once, or in more than one context? That separates a lucky break from a genuine superpower
> 4. **Peer recognition** -- In programs like YPO and Vistage, the most valued members are those whose advice others actively seek. The superpower should describe what people come to you for, not what your title says
>
> -- Source: 01-tech-leader-profiler.md, Section 1

### Defining Characteristics of a Superpower

| A Superpower Is... | A Superpower Is NOT... |
|---|---|
| Specific and earned through direct experience | A generic skill like "leadership" or "strategy" |
| Something others already seek you out for | Something you're merely interested in |
| Demonstrable through outcomes and stories | A credential or certification |
| Narrow enough to be genuinely differentiated | So broad that thousands share it |

> -- Source: elev8-superpower-exchange.md, Section 2

### The 7 Superpower Archetypes

Members map to one or more of these archetypes, which form the basis for both challenge category tiles in the UI and matching logic:

| # | Archetype | Core Capability |
|---|---|---|
| 1 | **Org Scaler** | Grew eng org through hypergrowth without it falling apart |
| 2 | **Platform Rebuilder** | Rebuilt technical foundation without stopping the business |
| 3 | **AI-to-Production Leader** | Shipped production AI/ML systems at scale, often under regulation |
| 4 | **Security Transformer** | Rebuilt security posture from reactive to strategic |
| 5 | **Product-Engineering Bridge** | Made product and engineering actually work together |
| 6 | **M&A Integrator** | Merged two technical orgs without losing the best people |
| 7 | **Founder-to-Operator** | Built the thing, then learned to run the thing |

> -- Source: PRODUCT-SPEC.md, Section 4; 01-tech-leader-profiler.md, Section 2

Each archetype includes a "Who needs them" field that directly informs matching. For example:

> **Org Scaler -- Who needs them**: Any leader about to cross a team-size threshold (20, 50, 100, 200)
>
> **AI-to-Production Leader -- Who needs them**: Leaders who've been told "we need an AI strategy" and are past the demo phase
>
> **Security Transformer -- Who needs them**: Leaders navigating their first major security transformation, or integrating AI security into an existing program
>
> -- Source: 01-tech-leader-profiler.md, Section 2

### Superpower Extraction Methodology: The 3-Prompt Method

The 3-prompt method replaces "What's your superpower?" and is designed to extract matchable data. Total time: under 2 minutes.

**Prompt 1 -- The Phone-a-Friend Test** (extracts the superpower through peer recognition):

> "When a fellow leader is in deep trouble -- the kind where they're texting people at 11pm -- what do they text YOU about?"
>
> *Pick the one thing. Not your title, not your resume. The actual problem people bring to you when it really matters.*
>
> -- Source: 01-tech-leader-profiler.md, Section 3; PRODUCT-SPEC.md, Section 5

Why this works for matching:
> "It bypasses self-assessment bias entirely. It asks what others already recognize, which is more accurate and more credible. The '11pm text' framing signals specificity -- nobody texts at 11pm about 'general strategy.'"
>
> -- Source: 01-tech-leader-profiler.md, Section 3

**Prompt 2 -- The War Story** (extracts context, constraints, and measurable outcomes):

> "Tell us about one time you did that -- the hardest version. What was the situation, what made it brutal, and what happened?"
>
> *Keep it to 2-3 sentences. Think: the version you'd tell over a drink, not on a panel.*
>
> -- Source: 01-tech-leader-profiler.md, Section 3; PRODUCT-SPEC.md, Section 5

**Prompt 3 -- The Match Trigger** (generates the explicit "I can help with..." statement):

> "If another member is going through something similar right now, what would you want them to know -- and what's the first thing you'd tell them?"
>
> *This is what we'll use to connect you with members who need exactly what you know.*
>
> -- Source: 01-tech-leader-profiler.md, Section 3; PRODUCT-SPEC.md, Section 5

### Post-Prompt Processing: From Answers to Matchable Profile

After capturing the three responses, a human curator (or AI-assisted process) synthesizes into a structured profile:

```
SUPERPOWER PROFILE
==================
Name: [Leader name]
Role: [Current title, company]
Archetype: [Primary archetype from the 7 above]

MATCHABLE STATEMENT:
[1-2 sentence synthesis using the formula:
Specific Capability + Proven Context + Measurable Outcome + Stage/Scale Marker]

MATCH TRIGGERS (situations where this person adds value):
- [Trigger 1]
- [Trigger 2]
- [Trigger 3]

PROOF POINTS:
- [Quantified outcome 1]
- [Quantified outcome 2]
```

**Example completed profile:**

```
SUPERPOWER PROFILE
==================
Name: Sarah Chen
Role: CTO, HealthBridge (Series D, 300 engineers)
Archetype: AI-to-Production Leader

MATCHABLE STATEMENT:
Built and shipped three production LLM systems under FDA/HIPAA regulation
at a Series C healthtech. Reduced clinical documentation time by 60% while
maintaining compliance. Expert in AI evaluation frameworks and regulatory
navigation for ML systems.

MATCH TRIGGERS:
- Leader needs to move AI from prototype to production
- Navigating healthcare or regulatory AI compliance
- Building MLOps/LLMOps infrastructure for the first time

PROOF POINTS:
- 3 production LLM systems shipped under regulatory scrutiny
- 60% reduction in clinical documentation time
- FDA and HIPAA compliance maintained across all systems
```

> -- Source: 01-tech-leader-profiler.md, Section 3

### The Superpower Card (Member-Facing Output)

The Superpower Card is the auto-generated 1-2 sentence statement built from the member's onboarding input. It follows a consistent structure: **[What they do] + [The specific context or result].**

Examples:

> **CTO Archetype**: "Builds engineering orgs that ship at startup speed past 200 people. Has done it three times, twice through IPO."
>
> **CISO Archetype**: "Builds security programs that don't slow down engineering. Specializes in making SOC2 and HIPAA compliance invisible to the dev team."
>
> **Head of AI Archetype**: "Ships production ML systems inside companies that have never had ML. Has built three AI teams from zero, all now running autonomously."
>
> -- Source: 03-copy-strategist.md, Section 2; PRODUCT-SPEC.md, Section 5

### Quality Signal for Extracted Superpowers

> "A well-extracted superpower profile should pass the 'Would I text this person?' test: if a curator reads the profile and can immediately imagine a specific scenario where they'd connect this person with another member, it's working."
>
> -- Source: 01-tech-leader-profiler.md, Section 4

---

## 3. Profile Fields Used for Matching

### Day 1 -- Required (Collected in Onboarding)

| Field | How Collected | Purpose | Onboarding Step |
|---|---|---|---|
| Name, photo, title, company | LinkedIn SSO (auto) | Identity | Phase 1 -- Claim Your Spot |
| Company stage | Dropdown: Seed / Series A / Series B / Series C+ / Public / Enterprise | Match relevance | Step A2 (Identity Confirmation) or Step B2 |
| Team size | Dropdown: 1-10 / 11-50 / 51-200 / 200+ | Match relevance | Step A2 (Identity Confirmation) or Step B2 |
| Primary superpower (1) | 3-prompt story method or guided tiles (6 archetype-based options + "Something else" free text) | Core matching | Step A3 (Superpower) or Step B1 |
| Expertise depth | Single select: Practitioner / Advisor / Battle-tested (10+ years) | Match quality | Step A3 (Superpower) or Step B1 |
| Primary challenge (1) | Category tile (8 categories mapped to archetypes) + optional free text (280 char max) + urgency | Core matching | Step A1 (Challenge) or Step B3 |
| Challenge urgency | Single select: This week / This month / This quarter | Prioritization | Step A1 (Challenge) or Step B3 |
| Exchange format preference | Checkboxes: 30-min call / Async chat / Email thread / Workshop | Scheduling | Step A4 (Availability) or Step B4 |
| Monthly availability | Slider: 1-10 hours (default: 2) | Capacity planning | Step A4 (Availability) or Step B4 |

> -- Source: PRODUCT-SPEC.md, Section 3; 04-flow-architect.md, Section 4

### The 8 Challenge Category Tiles (Mapped to Archetypes)

| Tile Label | Archetype Source |
|---|---|
| Scaling the org | Org Scaler |
| Rebuilding the platform | Platform Rebuilder |
| Shipping AI / ML to prod | AI-to-Production Leader |
| Security & compliance | Security Transformer |
| Product & eng alignment | Product-Engineering Bridge |
| Post-M&A integration | M&A Integrator |
| Founder-to-operator | Founder-to-Operator |
| Something else | Free text escape valve |

> -- Source: screens-02-profile.md, Screen 1 (Challenge Screen)

### Week 1 -- Prompted (After First Exchange)

| Field | Purpose | Trigger |
|---|---|---|
| Career North Star: immediate goal (0-6 months) | Better matching for next round | "Now that you've had your first exchange, what's your #1 priority this quarter?" |
| Second superpower | Broader matching | "People often have more than one superpower. Want to add another?" |
| Second challenge | More match opportunities | "Any other challenges on your plate?" |
| Industry vertical | Vertical-specific matching | Auto-detected from company, confirm |
| Preferred meeting times | Scheduling optimization | "When do you usually take calls?" |

> -- Source: PRODUCT-SPEC.md, Section 3; 04-flow-architect.md, Section 4

### Month 1 -- Organic (After 3 Exchanges)

| Field | Purpose | Trigger |
|---|---|---|
| Career North Star: mid-long term (1-3 years) | Aspirational matching, event curation | "Where do you want to be in 2-3 years?" |
| Exchange preferences (learned) | Algorithm refinement | System auto-suggests based on ratings |
| Willingness to mentor | Unlocks mentor track | "Would you be open to longer-term advisory relationships?" |
| Roundtable topic preferences | Community programming | "What topics would you attend a small-group session on?" |

> -- Source: PRODUCT-SPEC.md, Section 3; 04-flow-architect.md, Section 4

### Progressive Disclosure Summary

```
Day 1:  [===========]  Core identity + 1 superpower + 1 challenge + availability
         (REQUIRED -- 3.5 min)

Week 1: [===============]  Career goal + 2nd superpower + 2nd challenge + scheduling prefs
         (PROMPTED -- 2 min, post-first-exchange)

Month 1:[====================]  Long-term goals + mentor track + event prefs + referrals
         (ORGANIC -- 3 min spread across multiple touchpoints)
```

> -- Source: 04-flow-architect.md, Section 4

---

## 4. Match Quality Criteria

### Primary Matching Criteria (in Priority Order)

From the program design document, matching criteria are ranked:

> 1. **Challenge relevance** -- Has the match solved this specific problem?
> 2. **Recency** -- Did they solve it in the last 3 years (not 15 years ago in a different era)?
> 3. **Context similarity** -- Similar company stage, industry dynamics, or organizational complexity?
> 4. **Reciprocity potential** -- Can the requesting member offer something back?
>
> -- Source: elev8-superpower-exchange.md, Section 3.3

### The Five Matching Dimensions (for Human Curators)

Inspired by Vistage's peer group composition methodology -- matching 12-16 leaders from noncompeting industries with comparable accomplishment levels:

| Dimension | Description |
|---|---|
| **Functional expertise** | Engineering, Product, Security, AI/ML, Data, Platform |
| **Challenge type** | Scaling, turnaround, greenfield build, M&A integration, regulatory navigation |
| **Company stage** | Seed/A, B-C growth, D+ scale, public/enterprise |
| **Industry vertical** | Fintech, healthtech, SaaS, marketplace, infra, deeptech |
| **Leadership moment** | First-time in role, repeat exec, founder-to-operator transition |

> -- Source: 01-tech-leader-profiler.md, Section 1

### Curation Review Criteria (Application Approval)

Before a member enters the matching pool, the Elev8 team applies these criteria:

> 1. Is the member genuinely senior (VP+, C-suite, Head of)?
> 2. Is the superpower specific enough to be matchable?
> 3. Is the challenge real and actionable (not "general networking")?
> 4. Does referrer vouch for quality?
>
> -- Source: PRODUCT-SPEC.md, Section 6 (Phase 4); 04-flow-architect.md, Phase 4

### Superpower Identification & Validation Process (3 Inputs)

Self-assessment alone is unreliable. The identification process uses three inputs:

> 1. **Structured Reflection** -- The onboarding call uses specific prompts ("When did someone last fly across the country to get your advice? What was it about?") to surface genuine expertise.
> 2. **Peer Validation** -- At least two members review and confirm the superpower framing.
> 3. **Exchange Feedback** -- After every exchange, both participants rate relevance and depth. Over time, this creates a validated expertise signal.
>
> -- Source: elev8-superpower-exchange.md, Section 3.2

### Cross-Functional Matching as a Differentiator

The system deliberately matches across functional lines, not just within them:

> "A CISO gets product strategy coaching from a CPO. A Head of ML gets board communication tips from a CTO. This cross-functional pairing creates uniquely versatile leaders -- the kind companies promote to CEO."
>
> -- Source: 05-value-designer.md, Section 5 ("Hard to Get" Differentiator #4)

### Mentorship Match Criteria

Mentorship matches follow a specific principle:

> "Mentorship matches are based on challenge alignment, not title prestige. A CTO struggling with board communication is matched with a CEO who excels at board management -- not with another CTO who happens to be more senior."
>
> -- Source: elev8-superpower-exchange.md, Section 4.3

### MVP Match Notification Format

The MVP benefits brief specifies how a match is delivered:

> "After intake (superpower + current challenge), a curator reviews and delivers one match with: name, title, company, match reason, and a pre-recorded voice note intro. The notification reads: 'You've been paired with [Name], [Title] at [Company]. They're dealing with [specific challenge]. You've done this before.'"
>
> -- Source: elev8-mvp-must-have-benefits.md, Must-Have Benefit #1

---

## 5. Match Scenarios & Archetypes

### Concrete Match Scenarios from the Value Designer Document

These five scenarios from the first 30 days illustrate what a good match looks like in practice:

**Day 3: "The Someone Gets It Moment"**

> Marcus (Head of Engineering, Series C fintech) has been battling a re-org decision for weeks -- should he split platform and product engineering or keep them unified? Within 72 hours of completing his Superpower Profile, the system matches him with Elena (VP Engineering, post-IPO payments company) who made the exact same call 18 months ago. In a 25-minute async voice exchange, Elena shares her decision framework, the org chart she used, and the two mistakes she would undo. Marcus restructures his team the following Monday with a plan his CEO calls "the most thoughtful re-org proposal I've seen here."
>
> -- Source: 05-value-designer.md, Section 1

**Day 7: "The I Would Have Made a $1M Mistake Moment"**

> Priya (CISO, enterprise SaaS) is evaluating two SIEM vendors for a $1.2M annual contract. She posts a Superpower Request: "Anyone ripped out Splunk for a cloud-native SIEM in the last year?" Within 48 hours she's connected to David (CISO, healthtech) who completed that exact migration 8 months ago. David shares: actual cost overruns (40% above vendor quote), the hidden data egress fees, and the one integration that broke their SOC workflow for 3 weeks. Priya renegotiates the contract with specific leverage points David provided, saving $380K in year-one costs and avoiding a 3-week SOC disruption.
>
> -- Source: 05-value-designer.md, Section 1

**Day 12: "The Board-Ready in One Call Moment"**

> Sarah (CISO, mid-market fintech) has her first board-level security presentation in two weeks. She has never presented to a board before. Through Superpower Exchange, she connects with James (former CISO, now board member at two public companies) who navigated an identical board-level security audit 6 months ago. James shares his actual board deck structure, the three questions directors always ask, and the one metric that makes audit committees feel confident. Sarah walks into her board meeting prepared. The board approves her $2.4M security budget with zero pushback.
>
> -- Source: 05-value-designer.md, Section 1

**Day 18: "The Career Door Opens Moment"**

> Tomas (Head of ML, growth-stage AI company) mentions during a Superpower Exchange session that he is thinking about his first CTO role but does not know how to position his ML-heavy background for a broader technical leadership mandate. His exchange partner, Wei (CTO, public cloud company), not only coaches him on the narrative but introduces him to two CTOs who made the ML-to-CTO transition -- and to a board member at a company actively searching for a CTO with AI depth. Within 60 days Tomas is in final-round interviews.
>
> -- Source: 05-value-designer.md, Section 1

**Day 25: "The I'm Not Alone Moment"**

> Aisha (CPO, B2B enterprise) has been quietly struggling with a toxic dynamic with her co-founder CTO who overrides product decisions in engineering standups. She has no one at her company to talk to about it. In a confidential Superpower Exchange with Raj (CPO, who left a similar situation and is now thriving at a larger company), she gets both emotional validation and a tactical playbook: how to document the pattern, how to frame it for the CEO, and when to decide it is time to move on. Aisha uses the framework to have a direct conversation with her CEO. The dynamic shifts within two weeks.
>
> -- Source: 05-value-designer.md, Section 1

### Match Archetype Examples from Profiler Document

Each of the 7 archetypes includes a "Who needs them" section that directly defines the matching counterpart:

| Archetype | Example Matchable Statement | Who Needs Them |
|---|---|---|
| **Org Scaler** | "Grew engineering from 18 to 170 across three offices during Series B-D. Built the hiring process, manager layer, and platform team from scratch. Attrition stayed below 10% through all of it." | Any leader about to cross a team-size threshold (20, 50, 100, 200) |
| **Platform Rebuilder** | "Led a full platform migration from monolith to microservices at a 500-person fintech -- 18 months, zero downtime for customers, 40% reduction in cloud costs. Hardest part was keeping the team motivated through month 9." | Leaders staring at a codebase that's 3-5 years overdue for a rewrite |
| **AI-to-Production Leader** | "Built and shipped three production LLM-powered products at a Series C healthtech -- each under FDA and HIPAA scrutiny. Cut clinical documentation time by 60%." | Leaders who've been told "we need an AI strategy" and are past the demo phase |
| **Security Transformer** | "Took over security at a 400-person SaaS company three months after a breach that hit the press. Built a security org from 2 to 14, achieved SOC2 Type II in 9 months, and rebuilt customer trust." | Leaders navigating their first major security transformation |
| **Product-Engineering Bridge** | "As CPO at a marketplace startup, I inherited a product and engineering org that could barely ship a feature without a war room. Redesigned the operating model -- shared OKRs, dual-track discovery, and a 'build budget' framework." | Any leader experiencing product-engineering friction, especially after rapid growth |
| **M&A Integrator** | "Led technical integration for three acquisitions at an enterprise SaaS company -- $50M to $300M in ARR. Retained 85%+ of acquired engineering talent across all three." | Leaders going through their first acquisition (either side) |
| **Founder-to-Operator** | "I was CTO and employee #1. Wrote the first 200K lines of code. Then had to learn -- painfully -- to stop being the best engineer and start being the leader the engineering team needed." | Technical founders at Series A-B who know they need to "level up" |

> -- Source: 01-tech-leader-profiler.md, Section 2

---

## 6. Match Lifecycle

### End-to-End Flow: From Profile to Exchange to Next Match

**Phase 1: Member Submits Profile Data**

Members complete onboarding in under 4 minutes. Both paths (Challenge-First and Superpower-First) collect the same data in different order and converge at Match Preview.

> "Both paths collect the same data, just in different order. The member completes both sides regardless."
>
> -- Source: 04-flow-architect.md, Phase 1.5

**Phase 2: Match Preview (Pre-Approval)**

After completing the profile, 3 blurred match cards are shown. Each card includes:

```
[Blurred avatar]
[Title] at [Company stage + Industry]
[Superpower Card -- first sentence only]
Matched because: [reason pattern]
```

Match reason patterns used:

> - "they've solved your exact [X] challenge"
> - "they've built what you're trying to build"
> - "they've navigated the same [X] you're facing"
> - "they've been where you're headed"
> - "their superpower is your current gap"
>
> -- Source: 03-copy-strategist.md, Section 5; PRODUCT-SPEC.md, Section 6 (Phase 3)

**Phase 3: Human Curation Queue**

After the member completes onboarding, they enter a 48-hour review queue.

> "Our team reviews every application to ensure quality matches. You'll hear back within 48 hours."
>
> -- Source: PRODUCT-SPEC.md, Section 6 (Phase 4)

Fast-track rule:
> "Shorten curation to under 24 hours for members referred by high-trust referrers (who have 3+ successful exchanges). Auto-approve with a flag for manual review within 72 hours."
>
> -- Source: 04-flow-architect.md, Section 3 (Drop-Off Point #3)

**Phase 4: Approval and Match Reveal**

On approval, 3 unblurred match cards are revealed. The approval notification:

> "You're in. Meet your first match."
>
> -- Source: PRODUCT-SPEC.md, Section 6 (Phase 4); screens-04-post-approval.md, Screen 1

Each revealed card shows: full name (First + Last initial), title, company stage + industry, full Superpower Card text, match reason, and a "Connect" button.

**Phase 5: First Match Selection and Exchange**

| Step | Action | Timing |
|---|---|---|
| 5.1 | 3 unblurred match cards revealed | On approval |
| 5.2 | Member selects 1 match | Within 48h (nudge at 24h) |
| 5.3 | Intro sent to both with context | Immediate |
| 5.4 | Exchange happens (call, async, etc.) | Within 7 days (nudge at Day 3) |
| 5.5 | Both parties rate (value / would-repeat / chemistry) | 24h after exchange |
| 5.6 | Rating unlocks next match | Immediate |

> -- Source: PRODUCT-SPEC.md, Section 6 (Phase 5); 04-flow-architect.md, Phase 5

**Phase 6: Escalation and Replacement**

> "If member doesn't select a match in 48h: Nudge: 'Your top match [Title at Company] is available this week.'"
>
> "If exchange doesn't happen in 7 days: Nudge to both parties. If no response in 14 days, offer a replacement match."
>
> "If rating is low (<3/5): Elev8 team manually reviews. Reach out to the dissatisfied member. Adjust matching algorithm weight."
>
> -- Source: 04-flow-architect.md, Phase 5

**"Request a Different Match" Escape Valve:**

> Per spec Decision #5: "3 matches -- hand-picked feel, not a directory. Add 'Request a different match' escape valve."
>
> -- Source: PRODUCT-SPEC.md, Section 14 (Decision #5); screens-04-post-approval.md, Screen 2

When tapped, it opens a prompt: "Tell us what you're looking for" (optional free text, 140 char). Confirmation: "Got it. We'll find a better fit."

> -- Source: screens-04-post-approval.md, Screen 2

### Match Status Flow

A match progresses through these statuses:

1. **Blurred preview** (pre-approval) -- member sees 3 anonymized cards
2. **Revealed** (post-approval) -- 3 unblurred cards with full profiles
3. **Connected** -- member taps "Connect," intro sent to both parties
4. **Exchange scheduled** -- displayed on dashboard with date/time
5. **Exchange completed** -- logged to history
6. **Rated** -- both parties submit feedback; rating unlocks next match

> -- Source: synthesized from PRODUCT-SPEC.md Section 6; 04-flow-architect.md Phase 5; screens-04-post-approval.md Screens 2-3

### Exchange Formats

| Format | Description | Time Commitment | Best For |
|---|---|---|---|
| **Async Brief** | Written Q&A: one member submits 3 specific questions, the other responds in writing within 5 business days | 30-45 min total | Tactical questions with clear answers |
| **1:1 Exchange** | Curated video or phone conversation between two members | 45 min | Complex challenges requiring back-and-forth |
| **Superpower Session** | One member presents expertise to a small group (5-8 members) with Q&A | 60 min | Broadly applicable expertise |
| **Challenge Circle** | 4-5 members with complementary superpowers workshop one member's live challenge | 90 min | Multidimensional problems needing diverse perspectives |

> -- Source: elev8-superpower-exchange.md, Section 3.4

---

## 7. Curation Process

### How Matching Works (Curator Workflow)

> "Members submit a Challenge Brief (3-5 sentences describing what they need help with right now). Elev8 staff review the brief, cross-reference the superpower directory, and propose 1-3 matches with a written rationale for each. The member selects their preferred match. Elev8 makes the introduction. If no strong match exists, the brief is held and revisited when new members join or existing members update their superpowers."
>
> -- Source: elev8-superpower-exchange.md, Section 3.3

### Curator Decision Framework

Curators apply matching criteria in priority order:

1. **Challenge relevance** -- Has the match solved this specific problem?
2. **Recency** -- Did they solve it in the last 3 years?
3. **Context similarity** -- Similar company stage, industry dynamics, or organizational complexity?
4. **Reciprocity potential** -- Can the requesting member offer something back?

> -- Source: elev8-superpower-exchange.md, Section 3.3

And across these matching dimensions:

1. Functional expertise
2. Challenge type
3. Company stage
4. Industry vertical
5. Leadership moment

> -- Source: 01-tech-leader-profiler.md, Section 1

### Curator Role in the Product Spec

The product spec locks in the decision that curation is human:

> "Curation speed: 48h standard for everyone. Consistent, high-standards signal -- mitigate momentum loss with 'while you wait' content."
>
> -- Source: PRODUCT-SPEC.md, Section 14 (Decision #2)

> "Match count: 3 matches. Hand-picked feel, not a directory. Add 'Request a different match' escape valve."
>
> -- Source: PRODUCT-SPEC.md, Section 14 (Decision #5)

> "Exchange rating: Private -- Elev8 team only. Honest feedback, better matching data. Surface top contributors via other signals (exchange volume, member nominations)."
>
> -- Source: PRODUCT-SPEC.md, Section 14 (Decision #6)

### Safeguard Against Poor Matching Quality

> "All matching is human-curated by Elev8 staff who read Challenge Briefs, know member backgrounds, and apply contextual judgment. This is more expensive to operate but dramatically more effective. As the community scales, Elev8 will invest in better tooling for curators -- not in replacing them with algorithms."
>
> -- Source: elev8-superpower-exchange.md, Section 5 (Safeguard 4)

### Superpower Identification Process (Onboarding Call vs. In-App)

The program design document describes a 20-minute guided conversation for superpower identification:

> "Step 1: The Superpower Call (20 minutes) -- A guided conversation with an Elev8 team member -- not a form. The call covers: What do people consistently come to you for advice on? What is the most impactful problem you've solved in the last 3 years? What would you love help with right now?"
>
> "The Elev8 team captures the member's superpower, writes a one-paragraph summary, and identifies 2-3 initial matches."
>
> -- Source: elev8-superpower-exchange.md, Section 3.1

The product spec's in-app version streamlines this into the 3-prompt method within the onboarding flow, using guided tiles and free text instead of a live call.

> -- Source: PRODUCT-SPEC.md, Section 5

### Peer Validation Step

> "The draft superpower profile is shared with 2-3 existing members who know the new member (or have adjacent expertise). They confirm, refine, or suggest sharper framing. This prevents self-assessment blind spots and adds social proof."
>
> -- Source: elev8-superpower-exchange.md, Section 3.1

---

## 8. Feedback Loop

### Post-Exchange Rating System

After every exchange, both parties rate the exchange. The rating system is designed to be minimal and honest:

> "Both parties rate the exchange (value, would-repeat, chemistry)"
>
> -- Source: PRODUCT-SPEC.md, Section 6 (Phase 5, Step 5.5)

Ratings are private:

> "Exchange rating: Private -- Elev8 team only. Honest feedback, better matching data."
>
> -- Source: PRODUCT-SPEC.md, Section 14 (Decision #6)

### MVP Feedback Mechanism

The MVP simplifies feedback to its minimum viable form:

> "A 10-second post-exchange capture: 'Was this valuable?' yes/no + optional one-line note."
>
> "After an exchange winds down, one prompt: 'Was this valuable?' Two buttons + optional text field. No star ratings. No multi-question surveys. This feeds directly back to curators for the next matching cycle."
>
> -- Source: elev8-mvp-must-have-benefits.md, Must-Have Benefit #5

### How Feedback Improves Matching

**Direct curator input:**

> "Exchange Feedback -- After every exchange, both participants rate relevance and depth. Over time, this creates a validated expertise signal."
>
> -- Source: elev8-superpower-exchange.md, Section 3.2

**Low-rating intervention:**

> "If rating is low (<3/5): Elev8 team manually reviews. Reach out to the dissatisfied member. Adjust matching algorithm weight."
>
> -- Source: 04-flow-architect.md, Phase 5

**Profile enrichment trigger:**

> "Low match quality ratings = requires profile enrichment or manual matching intervention"
>
> -- Source: 05-value-designer.md, Section 6 (30-Day Success, Leading Indicators of Risk)

### Exchange Preferences Learned from Behavior

After 3 exchanges, the system auto-infers preferences:

> "System auto-suggests based on ratings: 'You seem to prefer 1:1 calls over async. Correct?'"
>
> -- Source: 04-flow-architect.md, Section 4 (Month 1)

Surfaced via:

> "Auto-inferred preferences confirmed via lightweight prompts ('We noticed X -- is that right?')"
>
> -- Source: 04-flow-architect.md, Section 4

### Quarterly Superpower Review

> "Superpowers are reviewed quarterly. Members can refine, pivot, or add a second superpower after their first 90 days."
>
> -- Source: elev8-superpower-exchange.md, Section 3.2

### Contribution Balance Monitoring (Informs Matching Priority)

The reciprocity gate directly affects matching access:

| Stage | Gate Type | Mechanism |
|---|---|---|
| Day 1 | Soft | Must define 1 superpower to see match preview |
| Week 1-2 | Medium | After receiving help, surfaced 1 inbound request. Decline = back of queue (not communicated) |
| Month 2+ | Hard | 2:1 rule: for every 2 exchanges received, 1 must be given. Ratio imbalance = "contribution pause" |

> -- Source: PRODUCT-SPEC.md, Section 8

Anti-alienation safeguards:

> - Never use the word "required." Always "unlock," "earn," "level up."
> - Celebrate giving publicly. Monthly "Top Contributors" recognition.
> - Make giving easy. Surface 3 curated requests with one-click accept.
> - Emergency override: If a member has a genuine urgent challenge (tagged "This week"), bypass the ratio gate.
>
> -- Source: 04-flow-architect.md, Section 5

### Outcome Tracking (Long-Term Feedback)

The value designer document specifies how outcomes are tracked and fed back:

> - **Milestone markers:** Members log career outcomes (promotion, board seat, successful migration, budget approved) and optionally link them to specific exchanges that contributed
> - **"Exchange Impact Score"** -- a private score showing the cumulative career value of exchanges, visible only to the member
> - **Quarterly Value Report** -- automated summary: "This quarter you had 8 exchanges. Members you helped reported: 2 vendor decisions influenced, 1 board presentation coached, 1 career introduction made."
>
> -- Source: 05-value-designer.md, Section 4

### Value Dashboard (In-Product Feedback Visibility)

> - **"Value Received" log** -- after each exchange, members tag the type of value received (decision input, introduction, career advice, emotional support, operational playbook)
> - **"Value Given" log** -- members see their impact on others, reinforcing contribution identity
> - **Estimated time saved** -- auto-calculated based on value type (e.g., "vendor decision input" = estimated 40 hours of independent research saved)
>
> -- Source: 05-value-designer.md, Section 4

### Re-Engagement Triggers Based on Matching Data

| Trigger | Action |
|---|---|
| New member joins who matches their superpower | "Someone new needs your expertise in [Topic]. Want to help?" |
| Their challenge category has new matches | "A new [Title] just joined who's solved [Challenge Category] at scale." |
| Quarterly check-in | "It's been 3 months. Has your challenge changed? Update your profile to get better matches." |

> -- Source: 04-flow-architect.md, Section 6 (Day 60+)

---

## Source File Index

| File | Key Sections Referenced |
|---|---|
| `01-tech-leader-profiler.md` | Matchable Superpower Formula (Section 1), Matching Dimensions (Section 1), 7 Superpower Archetypes (Section 2), 3-Prompt Extraction Method (Section 3), Post-Prompt Processing (Section 3), Quality Signals (Section 4) |
| `02-behavioral-designer.md` | Mirror of Relevance hook (Section 2, Hook #1), Proof of Asymmetry hook (Section 2, Hook #2), First Stake hook (Section 2, Hook #3), Emotional arc through matching (Section 3) |
| `03-copy-strategist.md` | Superpower Card templates (Section 2), Match Preview Card copy (Section 5), Match reason patterns (Section 5), Onboarding step copy (Section 1) |
| `04-flow-architect.md` | Complete onboarding flow architecture (Section 1), Progressive disclosure plan (Section 4), Reciprocity gate (Section 5), Drop-off risk analysis (Section 3), Re-engagement flow (Section 6) |
| `05-value-designer.md` | 5 value moment scenarios (Section 1), Immediate career value map (Section 2), "Hard to Get" differentiators (Section 5), In-product value visibility (Section 4), Success milestones (Section 6) |
| `PRODUCT-SPEC.md` | Member profile structure (Section 3), Superpower matchability formula (Section 4), 3-prompt method (Section 5), Onboarding flow (Section 6), Hook moments (Section 7), Reciprocity gate (Section 8), Product decisions (Section 14) |
| `screens-01-pre-entry.md` | Invite email wireframe (Screen 1), Claim Your Spot wireframe (Screen 2), Path Selection wireframe (Screen 3) |
| `screens-02-profile.md` | Challenge screen with archetype-mapped tiles (Screen 1), Identity confirmation (Screen 2), Superpower screen with match counter hook (Screen 3), Availability screen (Screen 4) |
| `screens-03-hooks.md` | Match Preview wireframe (Screen 1), Micro-Contribution wireframe (Screen 2), Curation Queue wireframe (Screen 3) |
| `screens-04-post-approval.md` | Approval notification (Screen 1), First match revealed with Connect buttons (Screen 2), Member dashboard (Screen 3) |
| `elev8-superpower-exchange.md` | Program philosophy (Section 1), Superpower definition (Section 2), Matching system (Section 3.3), Exchange formats (Section 3.4), Member journey personas (Section 4), Program safeguards (Section 5) |
| `elev8-mvp-must-have-benefits.md` | Must-have benefit #1: Match quality (Section 1), Must-have benefit #5: Outcome signal (Section 5), What's NOT in MVP (cut list), First-session experience phases |
