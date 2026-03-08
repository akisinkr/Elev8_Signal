# Elev8 — UX/Design Agent: Interaction Design & Design System for Elev8 Signal

*This document is part of the Elev8 product team's foundational context. It provides the perspective of a world-class UX designer who has built premium membership platforms and executive-facing products. Read alongside company.md, legal-compliance.md, cognitive-psychology.md, product-owner.md, and product-manager.md.*

---

## Why This Perspective Matters

Elev8 members use products built by the best design teams in the world — Google, Apple, Meta, Nvidia. Their baseline expectation for visual quality, interaction smoothness, and information hierarchy is extraordinarily high. A product that looks or feels like a typical B2B SaaS tool will immediately signal that Elev8 is not at their level. Design is not decoration for this audience — it is credibility.

---

## 1. Design Philosophy: Premium, Not Corporate

**The aesthetic target:** Think The Information meets Bloomberg meets a private members' club. Clean, confident, information-dense where needed, spacious where it matters. Never flashy. Never startup-y. Never corporate-template.

**What premium looks like for this audience:**
- Generous whitespace — these leaders operate in visually cluttered environments all day. Elev8 should feel like a breath of fresh air.
- Typographic confidence — one excellent typeface family used with discipline. No decorative fonts. Weight, size, and spacing do the heavy lifting.
- Restrained color palette — a single accent color used sparingly. Dark mode as default or prominent option (executives often work late).
- Zero stock imagery — no generic handshake photos, no diverse-team-around-table stock art. Use data visualizations, member-generated content, or nothing.
- No badges, gamification icons, or achievement animations — these are for consumer apps. Elev8 members would find them patronizing.

**What to avoid:**
- Startup aesthetics (bright gradients, playful illustrations, casual copy)
- Enterprise SaaS aesthetics (dense dashboards, gray-on-gray, feature-heavy navigation)
- Social media aesthetics (feeds, likes, reactions, comment threads)
- Anything that makes Elev8 feel like LinkedIn, Slack, or a typical community platform

---

## 2. Information Architecture: Three Layers Deep, Never More

Senior executives process information differently from typical users. They scan, decide, and act — or they leave. The IA must support this behavior.

**Layer 1: The Weekly Surface (Signal Vote)**
This is where 80% of members spend 80% of their time. One question, one vote, one immediate comparison. This layer should be reachable within 2 seconds of opening the app or email.

- No navigation required to vote
- No login friction (magic link or persistent session)
- No distractions — the question dominates the viewport

**Layer 2: The Intelligence Layer (Insights Report)**
For members who want to go deeper. The report should be scannable in under 3 minutes but reward deeper reading.

- Executive summary at the top (the "so what" in 3 sentences)
- Key findings with data visualizations (not tables — charts that tell a story)
- Personal context ("You answered X. Here's how that compares.")
- Contextual bridges to Superpower profiles (not generic CTAs but specific, relevant connections)

**Layer 3: The Action Layer (Superpower Directory & Exchange)**
For members who want to act on what they've learned. This layer must reduce vulnerability and make requesting help feel like connecting with a peer, not admitting weakness.

- Superpower profiles should lead with expertise, not biography
- The "Request Exchange" action should feel like scheduling a peer conversation, not asking for a favor
- Pre-populated context from the Signal insight that triggered the visit reduces friction and awkwardness

**Navigation principle:** A member should never be more than 2 taps from any layer. The weekly vote is Layer 1. Tapping an insight takes you to Layer 2. Tapping a Superpower profile takes you to Layer 3. Back is always one tap.

---

## 3. The Signal Voting Experience: Micro-Interaction Design

The vote is the core habit. It must be the most polished, delightful 30-second interaction in the product.

### The Question Card
- Full-viewport on mobile. No scroll required to see the question and all options.
- The question text should be typographically prominent — large, high-contrast, breathing room.
- Answer options should be large tap targets (minimum 48px height, ideally 56px+). Remember: these users may be voting on a phone in a car, between meetings, or at dinner.
- No "submit" button. Tapping an option IS submitting. One tap, done.

### The Post-Vote Reveal
This is the moment that creates the habit. The 2-second gap between "I voted" and "here's how my peers voted" should feel like a small reveal — satisfying, informative, conversation-worthy.

- Animate the transition from question to results. Not flashy — a smooth, confident expansion that reveals the aggregate data.
- Show the member's answer highlighted within the distribution.
- Use percentage bars, not pie charts. Percentages are faster to read and compare.
- Include a one-line contextual insight: "You're aligned with 72% of VPs in your domain" or "Only 18% of leaders share your view — you're in the contrarian minority."
- The tone of this line matters enormously. It should feel like insight from a trusted advisor, not a notification from an app.

### The Transition to Report
After seeing the post-vote comparison, the member should see a clear but non-intrusive path to the full insights report.

- "See the full analysis" link below the results — not a popup, not a modal, not a push notification
- If the report isn't ready yet (voting window still open): "Full report available [date]. We'll notify you."
- Never make the member feel like they need to do more right now. The vote is complete. Value was delivered. Anything else is optional.

---

## 4. The Insights Report: Editorial Design Principles

The report is Elev8's flagship content product. It should feel like a premium publication — not a dashboard, not a PDF, not a newsletter.

### Layout Principles
- Single-column layout on mobile. Two-column max on desktop. No three-column layouts.
- Each finding gets its own "card" or section with generous vertical spacing between findings.
- Data visualizations should be large enough to be meaningful on mobile — no tiny charts that require pinching.
- Progressive disclosure: the key insight is visible immediately; supporting data expands on tap/click.

### Data Visualization Standards
- Every chart must have a clear title that states the insight, not just the metric. "72% of leaders are prioritizing AI infrastructure" not "AI infrastructure adoption rates."
- Use horizontal bar charts for comparisons, trend lines for longitudinal data, and single large numbers for standout statistics.
- Color should encode meaning, not decoration. One color for "your answer," one for "majority," one for "minority." That's it.
- Always include the sample size and member composition context: "Based on responses from 127 members across 42 companies."

### Personalization
- The member's own answer should be visually anchored in every relevant chart — a small indicator or highlight that says "you are here."
- If the member's answer is notably different from the majority, call it out with curious (not judgmental) framing: "Your perspective stands apart — 78% of your peers see this differently."

### The Superpower Bridge (within the report)
- At the end of each finding, include a contextual prompt: "Want to go deeper? [3] members have direct expertise in [topic]."
- The member names/profiles should be partially visible (name + title + superpower headline) with a clear "Connect" action.
- This bridge must feel editorial — like a reporter citing an expert source — not transactional.

---

## 5. The Superpower Directory: Designing for Vulnerability

This is the most psychologically sensitive part of the product. A Director at Google deciding whether to request help from a VP at Samsung is navigating status, vulnerability, and trust simultaneously.

### Profile Design
- Lead with the superpower, not the person. "Navigating down-round fundraising" is more inviting than "John Kim, CFO at XYZ."
- Show credibility signals subtly: company, title, years of experience — but below the superpower.
- Include a brief "What I can help with" section and a "What I'm working through" section. Both sides visible. This normalizes mutual vulnerability.
- No profile photos unless the member opts in. Some leaders in this community are discreet about external affiliations.

### The Exchange Request Flow
- Pre-populate context: "I'm interested in connecting about [AI infrastructure implementation] — this came up in this week's Signal report."
- Frame the request as a peer exchange, not a help request: "Request a conversation" not "Ask for help."
- Let the requester specify their preferred format (async brief, call, etc.) and their own superpower — reinforcing that this is reciprocal.
- The confirmation should feel warm and human: "We'll connect you with [Name] within 48 hours" — not a ticket number.

---

## 6. The Non-Member Experience: Designing FOMO

The non-member sneak peek must accomplish three things in under 60 seconds: establish credibility, create desire, and make applying feel like the obvious next step.

### The Voting Experience (Non-Member)
- Identical to the member experience up to the point of results. Non-members can vote but see gated results.
- After voting, show a blurred or partially revealed version of the results with: "See how 150+ tech leaders at Google, Meta, and Samsung answered."
- The membership application prompt should appear at this exact moment — peak curiosity, peak engagement.

### The Sneak Peek Report
- Show the report structure (section headers, chart types, design quality) but blur or redact the specific data.
- Include one fully visible finding — the most provocative or surprising one. This proves value and creates desire for the rest.
- Show member company logos (with permission) as social proof: "Intelligence from leaders at [logos]."
- The application CTA should be prominent but not desperate. "Apply for membership" not "Sign up now!" This is an exclusive community, not a SaaS trial.

---

## 7. Mobile-First, Executive-Optimized

These leaders check email and make quick decisions on their phones between meetings, in transit, and late at night. Mobile is not a secondary experience — it is the primary experience for the core habit loop.

### Mobile-Specific Requirements
- The Signal vote must work flawlessly within email clients (Gmail, Outlook) or as a single-tap link to a mobile-optimized page.
- All tap targets minimum 48px. Prefer 56px for primary actions.
- Text must be readable without zooming: 16px minimum body text, 20px+ for headings.
- No horizontal scrolling. Ever. For anything.
- Loading states must be elegant — a subtle animation, not a spinner. No blank white screens.
- Offline tolerance: if a member taps to vote while in poor connectivity, the vote should queue and submit when connection returns.

### Desktop Experience
- Not an afterthought, but not the primary design target.
- Use the extra space for richer data visualizations and side-by-side comparisons in the insights report.
- Desktop is where members will spend more time in the Superpower directory and exchange request flows.

---

## 8. Design System Foundation

### Typography
- One type family. Recommend a humanist sans-serif (Inter, Söhne, or equivalent) — modern, readable, professional without being cold.
- Type scale: 14/16/20/24/32/40px with consistent line heights (1.4-1.6 for body, 1.2 for headings).
- Weight hierarchy: Regular for body, Medium for emphasis, Semibold for headings. No Bold or Heavy in body text.

### Color
- Primary: Deep navy or charcoal as the dominant brand color. Conveys authority and trust.
- Accent: One warm accent (amber, gold, or terracotta) used sparingly for CTAs and highlights.
- Semantic: Green for positive signals, red for alerts (used very rarely), blue for informational.
- Backgrounds: Off-white (#FAFAFA or similar) for light mode. True dark (#1A1A1A) for dark mode. Never pure white or pure black.
- Rule: No more than 3 colors visible in any single viewport.

### Spacing and Layout
- 8px grid system. All spacing in multiples of 8.
- Card-based layout for modular content (Signal questions, report findings, Superpower profiles).
- Maximum content width: 680px for text-heavy content (reports), 1200px for directory/dashboard views.
- Consistent padding: 16px on mobile, 24px on tablet, 32px on desktop.

### Iconography
- Minimal. Use icons only when they add clarity that text alone cannot provide.
- Outline style, consistent 1.5-2px stroke weight. No filled icons, no emoji-style icons.
- Prefer text labels over icons for navigation. These users don't want to guess what a symbol means.

### Motion and Animation
- Subtle and purposeful. Animation should clarify state changes, not entertain.
- Transition durations: 150-250ms for micro-interactions, 300-400ms for page transitions.
- Easing: ease-out for elements entering, ease-in for elements leaving. No bounce, no spring physics.
- The post-vote reveal animation is the ONE moment where slightly more elaborate motion is justified — it's the habit reward.

---

## 9. Accessibility as Premium

Accessibility is not a compliance checkbox for Elev8 — it is a quality signal. Several members may be in their 50s-60s, working in varied lighting conditions, using assistive technologies, or simply preferring high-contrast modes.

- WCAG 2.1 AA compliance as minimum. Aim for AAA on contrast ratios.
- All interactive elements must be keyboard-navigable.
- All data visualizations must have text alternatives.
- Color must never be the sole means of conveying information.
- Font sizes must be user-adjustable without breaking layout.
- Screen reader compatibility for all core flows (vote, report, directory, exchange request).

---

## 10. Design Red Lines

These are non-negotiable design constraints:

- **No social media patterns.** No feeds, no likes, no comments, no follower counts. Elev8 is not a social network.
- **No gamification.** No points, badges, streaks, leaderboards, or achievement unlocks. This audience finds them insulting.
- **No notification overload.** One email per week (the Signal question). One report delivery. Exchange-related notifications only. Nothing else without explicit opt-in.
- **No dark patterns.** No manipulative urgency ("only 2 spots left!"), no guilt-tripping ("you haven't logged in in 30 days"), no hidden opt-ins. Trust is the product.
- **No feature bloat.** If a screen has more than 3 possible actions, it has too many. Simplify until it hurts, then simplify more.

---

## Related Documents

- **company.md** — Strategic context, mission, programs, and design principles
- **legal-compliance.md** — Legal constraints affecting design (consent flows, data display, anonymization)
- **cognitive-psychology.md** — Behavioral science informing interaction design
- **product-owner.md** — Tactical build sequence and acceptance criteria
- **product-manager.md** — Product strategy, roadmap, and positioning
- **ux-design.md** (this document) — Interaction design, design system, and visual standards
- **data-analytics.md** — Data architecture and anonymization for report design
- **community-ops.md** — Operational workflows that the product must support
- **growth-marketing.md** — Acquisition and brand strategy informing the non-member experience
