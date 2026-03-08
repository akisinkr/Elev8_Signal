# Elev8 — Community Operations Agent: Member Lifecycle, Engagement & Curation Workflows

*This document is part of the Elev8 product team's foundational context. It provides the perspective of a world-class community operations leader who has built and scaled invite-only executive communities. Read alongside company.md, legal-compliance.md, cognitive-psychology.md, product-owner.md, product-manager.md, ux-design.md, and data-analytics.md.*

---

## Why This Perspective Matters

Elev8's product is ultimately people — not software. The webapp supports the community; it does not replace the human curation, relationship management, and operational care that make the community trustworthy. The product team must understand the operational workflows that the platform needs to support, because every product decision either enables or constrains the community operations team's ability to deliver the "must-have" experience.

---

## 1. The Member Lifecycle: 7 Stages

Every member moves through a predictable lifecycle. The product must support each stage with appropriate features, data, and touchpoints.

### Stage 1: Identification (Pre-Invitation)
**Who does this:** Elev8 team, existing members (referrals)
**What happens:** Potential members are identified through Andrew's network, existing member recommendations, corporate partner pipelines, event attendees, and Signal non-member voters who apply.

**Product needs:**
- A prospect tracker: name, title, company, domain, source, referral chain, status
- Integration with Signal non-member data (who voted, how engaged they were)
- Notes field for qualitative context ("Met at Nvidia roundtable, strong AI infrastructure background, highly recommended by Member X")

### Stage 2: Vetting & Invitation
**Who does this:** Elev8 team (human decision, never automated)
**What happens:** Prospects are vetted against membership criteria (seniority, company tier, domain relevance). If approved, a personalized invitation is sent — not a mass email, not a template.

**Product needs:**
- Vetting checklist: seniority level confirmed, company tier confirmed, domain identified, at least one existing member connection identified
- Invitation tracking: who was invited, when, by whom, current status (sent, opened, accepted, declined, expired)
- Personalized invitation templates that the team can customize (not fully automated — the personal touch is essential)
- Invitation acceptance flow that feels premium and human, not like a SaaS signup

### Stage 3: Onboarding (Days 1-30)
**Who does this:** Elev8 team with product support
**What happens:** The critical 30-day window where a skeptical new member either becomes an advocate or disengages. This is the highest-leverage stage in the entire lifecycle.

**Product needs:**
- Onboarding status tracker: which steps has the member completed? (Welcome message received → Superpower Call scheduled → Superpower Call completed → Profile created → First match proposed → First exchange completed)
- Superpower Call scheduling integration (calendar booking, not email back-and-forth)
- Superpower profile creation tool (team writes it from the call, member reviews and approves)
- First-match recommendation engine (surfaces the 3-5 best matches based on the new member's superpower and stated challenges)
- Automated reminders for the team (not the member) when a new member stalls at any stage

**Critical design principle:** During onboarding, every communication to the member should feel personal and human. Automated emails are acceptable only for logistics (scheduling confirmations). All substantive communication should come from a named Elev8 team member.

### Stage 4: Activation (Days 31-90)
**Who does this:** Member with Elev8 facilitation
**What happens:** The member has completed their first exchange and is beginning to see value. The goal is to deepen engagement and create multiple touchpoints.

**Product needs:**
- Activity dashboard for the team: which members are active, which are at risk of disengaging?
- Second and third match proposals based on updated information from the first exchange
- Event invitation pipeline (Elevate Breakfasts, Roundtables) targeted by domain and challenge alignment
- Signal participation tracking (is the member voting weekly?)
- Gentle re-engagement prompts for the team when a member misses 2+ consecutive Signal votes

### Stage 5: Sustained Engagement (Ongoing)
**Who does this:** Member (self-directed) with ecosystem support
**What happens:** The member is an active community participant — voting weekly, exchanging superpowers, attending events, and referring peers.

**Product needs:**
- Member health score: a composite metric combining Signal participation, exchange activity, event attendance, and referral activity. NOT visible to members — this is an internal tool for the ops team to identify who needs attention.
- Quarterly re-commitment flow: a brief check-in where members confirm their continued engagement, update their superpower, and share any new challenges.
- Contribution balance tracker: is this member giving and receiving in roughly equal measure? (See Superpower Exchange safeguards in company.md)
- Anniversary and milestone recognition: subtle acknowledgments at 6-month and 12-month marks.

### Stage 6: Leadership & Amplification
**Who does this:** Highly engaged members with Elev8 support
**What happens:** The most engaged members become community leaders — hosting Elevate Breakfasts, leading Superpower Sessions, mentoring newer members, and referring high-quality prospects.

**Product needs:**
- Host management tools for Elevate Breakfasts (venue, invitee list, challenge theme, post-event feedback)
- Superpower Session scheduling and promotion tools
- Mentorship arc tracking (90-day cycles with midpoint and endpoint check-ins)
- Referral tracking with attribution (which members are referring, who converts, quality of referrals)

### Stage 7: Transition & Alumni
**Who does this:** Elev8 team
**What happens:** Members may become less active due to career transitions, geographic moves, role changes, or shifting priorities. The goal is graceful transition, not abandonment.

**Product needs:**
- Inactivity detection: flag members who haven't engaged in 60+ days for personal outreach
- Graceful pause option: members can pause their membership for 90 days without losing their profile or history
- Alumni status: members who leave the community retain a read-only profile and can be re-invited later
- Exit interview tracking: when members leave, capture why — this data is critical for improving retention

---

## 2. The Curation Engine: Human-Powered, Tool-Supported

Elev8's core differentiator is human curation — not algorithmic matching. The product must amplify the curation team's capabilities without replacing their judgment.

### What the Curation Team Does
- Reviews every Challenge Brief and matches members based on contextual understanding
- Identifies emerging themes across Signal data, exchange requests, and event conversations
- Spots members who are underengaged and proactively reaches out
- Designs Elevate Breakfast groupings based on shared challenges
- Monitors contribution balance and addresses imbalances privately

### What the Product Should Provide
- **Curation dashboard:** A single view showing all active Challenge Briefs, pending matches, in-progress exchanges, and upcoming events. The curator should never need to check multiple tools.
- **Match recommendation engine:** Surface the top 3-5 potential matches for each Challenge Brief, ranked by relevance, recency, context similarity, and reciprocity potential. The curator makes the final decision — the tool provides the shortlist.
- **Theme detection:** Aggregate Signal data, Challenge Brief topics, and exchange feedback to surface emerging themes. "AI infrastructure" has been mentioned in 12 Challenge Briefs and 3 Signal questions this month — this should be flagged as a potential Elevate Breakfast topic.
- **Member context cards:** When a curator opens a member's profile, they should see everything relevant in one view: Superpower, recent Signal votes, exchange history, event attendance, contribution balance, and any notes from previous interactions.
- **Communication tools:** Integrated messaging for curation-related communication (match proposals, re-engagement outreach, event invitations). These should feel personal even when using templates — the member should never suspect they received a mass message.

---

## 3. Event Operations

### Tech Leadership Roundtable Operations
- **Pre-event:** Identify and confirm the visiting tech executive. Curate the guest list (10-20 members selected for relevance to the guest's domain). Send personalized invitations with context about the guest and why each member was selected.
- **During event:** No product involvement needed — this is a live dinner experience.
- **Post-event:** Collect brief feedback (2-3 questions max). Update member profiles with new connections made. Identify follow-up Superpower Exchange opportunities.

**Product needs:** Event management module — create event, set guest and theme, manage invitations, track RSVPs, collect post-event feedback, update member interaction history.

### Elevate Breakfast Operations
- **Pre-event:** Identify the challenge theme (from Signal data and curation insights). Select and invite 8-12 members who share the challenge. Confirm a member host. Coordinate venue.
- **During event:** No product involvement.
- **Post-event:** Capture key takeaways (host submits a brief summary). Propose follow-up Superpower Exchanges between attendees. Feed insights back into Signal question planning.

**Product needs:** Challenge-to-event pipeline — the system should suggest potential breakfast themes based on aggregated data and allow the ops team to convert a theme into an event with a curated invitee list.

---

## 4. Communication Cadence: Less Is More

Senior executives are drowning in communication. Elev8's communication must be the opposite of noise — every message must be high-signal, personally relevant, and respectful of time.

### Weekly (Non-Negotiable)
- **Signal question:** One email, one question, one tap to vote. This is the only weekly communication every member receives.

### As-Needed (Triggered by Activity)
- **Match proposals:** When a relevant Superpower match is identified (via Challenge Brief or Signal-to-Superpower bridge)
- **Event invitations:** Only for events relevant to the member's domain and challenges
- **Exchange logistics:** Scheduling confirmations, exchange reminders

### Quarterly
- **Re-commitment check-in:** Brief, personal, from a named team member
- **Quarterly insights compilation:** A summary of the quarter's most significant Signal findings

### Annual
- **"State of Tech Leadership" report:** The annual compilation
- **Membership anniversary acknowledgment:** Brief, warm, not over-the-top

### Never
- "We miss you" guilt emails
- Feature announcements
- Partner promotions
- Newsletter-style roundups
- Anything that feels like marketing

**Product implication:** The notification system must have hard limits. No member should receive more than 3 non-Signal emails in any given week. If multiple triggers fire in the same week, the system should queue and prioritize.

---

## 5. Quality Assurance: The Experience Audit

Every quarter, the ops team should conduct an experience audit — walking through the entire member journey from invitation to sustained engagement, evaluating every touchpoint for quality, relevance, and trust.

### Audit Checklist
- **Invitation experience:** Does it still feel personal and premium?
- **Onboarding flow:** Is every new member completing their Superpower Call within 7 days? First exchange within 21 days?
- **Signal experience:** Are vote participation rates stable or growing? Are members engaging with the insights report?
- **Exchange quality:** What is the average satisfaction score? Are matches improving over time?
- **Event quality:** Are post-event feedback scores above 4.5/5? Are members requesting more events?
- **Communication quality:** Audit 10 random member communications — do they feel personal, relevant, and respectful?
- **Trust indicators:** Has any member expressed concern about data use, Coupang involvement, or solicitation? How was it handled?

**Product need:** An internal quality dashboard that tracks these metrics over time. The ops team should see trends, not just snapshots.

---

## 6. Scaling Without Losing Soul

The hardest challenge in community operations is scaling human curation. Here's the playbook:

### Phase 1 (0-100 members): Fully Human
- Andrew and 1-2 team members handle all curation personally
- Every match, every invitation, every communication is personally crafted
- This is where you learn what works — and what you can eventually systematize

### Phase 2 (100-300 members): Tool-Assisted Human
- Introduce the curation dashboard and match recommendation engine
- Templates for common communications (but always personalized before sending)
- Automated tracking of member health scores and engagement triggers
- The curator still makes every match decision — the tool accelerates their work

### Phase 3 (300-1000 members): Curated at Scale
- Expand the curation team (1 curator per ~150 active members)
- Introduce regional or domain-specific curators who develop deep expertise in their segment
- More sophisticated recommendation engines that learn from curator decisions
- Maintain human approval for all matches and member-facing communications

### Phase 4 (1000+ members): Federated Curation
- Empower trusted senior members as community leaders who facilitate exchanges within their domain
- The ops team shifts from direct curation to curator enablement — training, quality assurance, and exception handling
- Technology handles routing and logistics; humans handle judgment and relationships

**Product implication:** Build the platform for Phase 2 now, but architect it for Phase 4. The curation dashboard should be designed to support multiple curators with domain specialization from the start, even if only one person uses it initially.

---

## 7. Crisis Playbooks

### Trust Breach (Perceived or Real)
**Scenario:** A member suspects their Signal response was shared inappropriately, or perceives Elev8 as a recruiting operation rather than a genuine community.
**Response:** Immediate personal outreach from Andrew or senior team member. Full transparency about what happened (or didn't). If the concern is about Coupang, reiterate the structural independence and offer specific evidence (e.g., "Coupang has never had access to your data").
**Product need:** Audit trail — the ability to show a member exactly what data was collected, how it was used, and who accessed it.

### Member Conflict
**Scenario:** A Superpower Exchange goes poorly — personality clash, bad advice, or a breach of confidentiality.
**Response:** Elev8 team mediates privately. Both members are heard. If a confidentiality breach occurred, the offending member receives a formal warning and potential membership review.
**Product need:** Exchange feedback mechanism that allows members to flag issues confidentially.

### Public Exposure
**Scenario:** An Elev8 member publicly references the community (on LinkedIn, in media) in a way that reveals internal dynamics or the Coupang relationship.
**Response:** Private conversation with the member about community guidelines. Draft community guidelines that address public disclosure expectations.
**Product need:** Community guidelines acknowledgment as part of onboarding — members agree to discretion about internal community dynamics.

---

## Related Documents

- **company.md** — Strategic context, mission, programs, and design principles
- **legal-compliance.md** — Legal constraints on member data and communications
- **cognitive-psychology.md** — Behavioral science informing member engagement
- **product-owner.md** — Tactical build sequence and acceptance criteria
- **product-manager.md** — Product strategy and roadmap
- **ux-design.md** — Design standards for member-facing interfaces
- **data-analytics.md** — Data architecture supporting curation and engagement tracking
- **community-ops.md** (this document) — Member lifecycle, curation workflows, and operations
- **growth-marketing.md** — Acquisition and brand strategy feeding the member pipeline
