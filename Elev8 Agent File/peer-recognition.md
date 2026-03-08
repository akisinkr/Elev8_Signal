# Elev8 — Peer Recognition & Badge System: The Elev8 Credential

*This document defines Elev8's peer-validated recognition system — a three-layer badge framework that transforms community participation into verifiable professional credentials. This system is a core differentiator: unlike LinkedIn endorsements (which anyone can click) or conference speaker badges (which prove attendance, not expertise), Elev8 badges are earned through real, substantive peer interactions with verified senior tech leaders.*

*Read alongside company.md (strategic context), cognitive-psychology.md (behavioral design), product-owner.md (build guidance), ux-design.md (visual design), and community-ops.md (operational workflows).*

---

## Why This System Matters

Pain point #4 in company.md states: "Senior leaders want to be recognized as true domain experts — but it is hard to earn that recognition unless they are given explicit opportunities to prove themselves." The badge system solves this directly.

The insight behind Elev8's recognition system is simple: **the most credible endorsement of expertise is not a self-claimed credential or a recruiter's assessment — it is the private, honest vote of a peer who just spent 45 minutes in a real conversation with you.**

When a Director at Google and a VP at Samsung complete a Superpower Exchange and both independently confirm that the other demonstrated exceptional expertise — that validation is more meaningful than any certification, conference talk, or LinkedIn endorsement. It's real. It's specific. It's earned through substance, not clicks.

---

## The Three-Layer Badge System

### Layer A: Verified Superpower Badge

**What it is:** When peers confirm your declared Superpower through positive exchange votes, you earn a "Verified Superpower" badge. This is the most meaningful badge in the system — it says "this person claims expertise in X, and peers who have actually interacted with them confirm it's real."

**How it's earned:** After completing a 1:1 Exchange or Superpower Session where you served as the expertise giver, the other participant(s) vote on your performance. When you accumulate 2 positive peer recommendations specifically related to your declared Superpower, the Verified Superpower badge is activated on your profile.

**What it shows:**
- Your declared Superpower name (e.g., "Engineering Org Design at Scale")
- A "Verified" indicator
- Recency: "Last validated: [date]" — showing when your most recent positive validation occurred

**Why recency matters:** Badges never expire — once earned, they're permanent. But showing the last validation date serves two purposes: it signals to other members that this expertise is actively demonstrated (not a historical claim), and it motivates badge holders to keep participating in exchanges to keep their validation current.

### Layer B: Domain Expertise Badges

**What they are:** Earned when you receive positive votes in exchanges *outside* your declared Superpower. These badges reveal the breadth of your expertise beyond your primary focus.

**How they're earned:** During a 1:1 Exchange or Superpower Session, you may demonstrate deep knowledge in an area adjacent to or different from your declared Superpower. When you accumulate 2 positive peer recommendations in a specific domain outside your Superpower, a Domain Expertise badge is activated.

**Example:** Your Superpower is "Engineering Org Design at Scale" but during a Challenge Circle, you also demonstrated exceptional knowledge of "AI Infrastructure Implementation." After 2 peers validate this, you earn an "AI Infrastructure" Domain badge.

**What it shows:**
- Domain name (e.g., "AI Infrastructure," "Executive Hiring," "Board Communication")
- Recency: "Last validated: [date]"
- Members can accumulate multiple Domain badges over time — there is no limit

**Why this matters:** Senior leaders often have deep expertise in 3-5 areas, not just one. The Domain badge system allows the community to discover and validate this breadth organically. It also means the Superpower directory becomes richer over time — a member who started with one Superpower becomes discoverable for multiple expertise areas.

### Layer C: Tier Progression

**What it is:** An overall credibility tier based on cumulative positive exchanges across all formats, regardless of specific domain. This shows depth of contribution to the community.

**The three tiers:**

| Tier | Threshold | What It Signals |
|------|-----------|----------------|
| **Rising** | [X]+ positive peer recommendations | "This member is actively contributing and peers are responding positively." |
| **Trusted** | [X]+ positive peer recommendations | "This member has consistently demonstrated expertise across multiple exchanges. A proven contributor." |
| **Master** | [X]+ positive peer recommendations | "This member is among the most validated experts in the Elev8 community. Exceptional depth and breadth of contribution." |

*(Exact thresholds to be determined based on community size and engagement patterns. Placeholder values will be calibrated during the pilot phase.)*

**Tier progression is cumulative and permanent.** Once you reach "Trusted," you never drop back to "Rising." However, the recency signals on individual badges still indicate how recently a member has been active.

---

## The Voting Mechanism

### When Voting Happens

Voting is triggered after two exchange formats:

**1:1 Exchange:** Both participants receive a voting prompt within 24 hours of the exchange being marked complete. Both parties vote on each other — the exchange is reciprocal by design.

**Superpower Session:** All attendees (5-8 members) receive a voting prompt within 24 hours. They vote on the session presenter only. The presenter does not vote on attendees in this format.

Voting is NOT triggered for Async Briefs (too lightweight to evaluate expertise depth) or Challenge Circles (collaborative format makes individual attribution unclear). However, Challenge Circle participants can be nominated for Domain badges through a separate curator-initiated process if their contribution was notably exceptional.

### The Three Voting Dimensions

After each qualifying exchange, the voter answers three questions:

**Dimension 1: Expertise Depth**
"How deep was this person's knowledge on the topic discussed?"
- Exceptional — among the most knowledgeable people I've spoken with on this topic
- Strong — clearly experienced and knowledgeable
- Adequate — helpful but not notably deep
- Limited — did not demonstrate significant expertise in this area

**Dimension 2: Practical Value**
"How actionable was what you gained from this exchange?"
- Immediately actionable — I can apply specific insights right away
- Useful context — broadened my understanding meaningfully
- General interest — interesting but not directly applicable
- Not relevant — did not address my needs

**Dimension 3: Peer Recommendation (The Badge Trigger)**
"Would you recommend this person as a go-to expert in this domain?"
- Yes — I would confidently recommend them
- Not yet — promising but I'd want to see more
- Not in this area — their strength may be elsewhere

**Only a "Yes" on Dimension 3 counts as a positive peer recommendation** — this is the metric that triggers badge progress and tier advancement.

Dimensions 1 and 2 are internal quality signals used by the Elev8 curation team to monitor exchange quality, improve matching, and identify members who might need support. They do not directly affect badges.

### Voting Privacy

**Individual votes are never visible to the person being voted on.** Only the Elev8 admin team can see who voted what. Members see only:
- Their badge status (earned or not yet earned)
- Their tier level
- The recency date of their most recent positive validation
- Their total number of positive recommendations (as a cumulative count)

They do NOT see:
- Who specifically voted for them
- How any individual person rated them
- Which exchanges produced positive vs. neutral votes
- The detailed breakdown of Dimensions 1 and 2

This privacy is essential. Senior leaders will not vote honestly if they know their specific feedback is visible to the person. And they will not participate as Superpower givers if they feel they're being publicly scored. The badge system must feel like recognition, not evaluation.

---

## The Combined Profile Display

A member's profile in the Superpower directory would show their complete badge portfolio:

```
🔷 Trusted                                    (cumulative tier)

✓ Verified Superpower:
  Engineering Org Design at Scale
  Last validated: 2 weeks ago

Domain Expertise:
  • AI Infrastructure Implementation          Last validated: 1 month ago
  • Executive Hiring Strategy                 Last validated: 3 months ago
  • Board Communication                       Last validated: 5 months ago

12 peer recommendations earned
```

**Design notes for the product team (see ux-design.md for full visual standards):**
- The tier badge should be visually prominent but not garish. A subtle icon or color indicator, not a flashy medal.
- Verified Superpower should be the most visually emphasized element — it's the core identity.
- Domain badges should be listed in recency order (most recently validated first).
- The cumulative recommendation count adds social proof without revealing specific voters.

---

## The Shareable External Credential

Members can share their Elev8 credentials externally through two mechanisms:

### 1. Digital Credential Card
A visually polished, shareable image/card that summarizes the member's Elev8 credentials. Designed for:
- LinkedIn "Featured" section or posts
- Personal websites or portfolios
- Email signatures (as a linked badge)
- Conference speaker bios

**The credential card includes:**
- The member's name and current title/company
- Their Elev8 tier (Rising / Trusted / Master)
- Their Verified Superpower
- Domain Expertise badges
- Total peer recommendations
- The Elev8 brand mark
- A link to their public profile URL

**The credential card does NOT include:**
- Any information about Coupang
- Individual voter names or details
- Dimension 1 and 2 scores
- Any information that could identify other members

**Design principle:** The card should look like it belongs next to a Stanford degree or a McKinsey alumni badge — premium, understated, and instantly recognizable to those who know what Elev8 is. It should NOT look like a gamification badge or a SaaS achievement.

### 2. Public Profile URL
Each member gets a unique public profile page (e.g., `elev8urimpact.com/m/[name]`) that displays their verified credentials. This page is:

- **Opt-in:** Members choose whether to activate a public profile. It is not created by default.
- **Controlled:** Members choose which badges and information to display on their public profile. They can show their Verified Superpower but hide specific Domain badges if they prefer.
- **Verifiable:** Anyone visiting the URL can see that these credentials are peer-validated within Elev8's curated community. The page explains what Elev8 is and what peer validation means — providing context for people who don't yet know the community.
- **SEO-conscious:** The public profile should be designed to rank well when someone searches for the member's name + area of expertise. This serves the member's personal brand and Elev8's organic discovery.

**What the public profile shows:**
- Member name, title, company
- Elev8 tier with explanation ("Trusted — validated by [X]+ senior tech leaders through direct peer exchanges")
- Verified Superpower with description
- Domain Expertise badges
- Total peer recommendations count
- A brief description of what Elev8 is and what peer validation means
- "Want to learn more about Elev8?" link (subtle member acquisition touchpoint)

**What the public profile does NOT show:**
- Other members' names or identities
- Specific exchange details
- Voting scores or breakdowns
- Any proprietary community data

---

## The Virtuous Cycle: How Badges Drive the Ecosystem

The badge system isn't just a recognition feature — it's an engagement engine that reinforces every other part of the Elev8 ecosystem.

**Signal → Gap Awareness → Exchange → Badge → More Exchanges**

1. A member reads the Signal insights report and discovers they're behind on AI infrastructure.
2. They browse the Superpower directory and see members with Verified Superpower badges in AI Infrastructure — the badge gives them confidence that this person is genuinely expert.
3. They complete a 1:1 Exchange. Both participants vote.
4. The giver earns progress toward their badge. The receiver gains actionable knowledge.
5. The giver, motivated by badge progress and the recognition it represents, participates in more exchanges.
6. The receiver, having experienced genuine value, is more likely to give their own Superpower in future exchanges — starting their own badge journey.

**Badges also drive the programs they're earned in:**

- **More Superpower Sessions:** Members who want to earn Domain badges or advance their tier are motivated to present Superpower Sessions (which generate the most votes per event — 5-8 attendees voting at once).
- **Higher quality exchanges:** Knowing that peers will vote on expertise depth and practical value raises the bar for preparation and engagement.
- **More referrals:** Members with strong badge portfolios become natural ambassadors — their public credential card creates curiosity and FOMO among non-members.
- **Better matching:** The accumulation of Domain badges enriches the Superpower directory, making matches more precise over time.

---

## Badge System Safeguards

### Safeguard 1: Vote Integrity
**Risk:** Members trade positive votes as favors ("I'll rate you well if you rate me well").
**Mitigation:** Votes are private and the specific impact of any individual vote is invisible to the other party. Members know that positive votes exist but cannot trace them to specific people or exchanges. Additionally, the Elev8 curation team monitors for patterns — if two members consistently exchange only with each other and always vote positively, the system flags this for review.

### Safeguard 2: Badge Inflation
**Risk:** As the community grows, badges become too easy to earn and lose their meaning.
**Mitigation:** The 2-recommendation threshold is deliberately low for the current community size (100-150 members). As the community scales, thresholds should be periodically reviewed. Additionally, because badges show recency ("Last validated: [date]"), even an easily earned badge loses its signal if not recently validated.

### Safeguard 3: Negative Vote Anxiety
**Risk:** Members avoid participating as Superpower givers because they fear negative votes.
**Mitigation:** Members never see negative votes. They only see the positive — their badges and cumulative recommendation count. A neutral or negative vote simply doesn't add to their count. There is no downside to participating, only upside. This is critical for maintaining participation motivation.

### Safeguard 4: Domain Badge Accuracy
**Risk:** A member earns a Domain badge in an area where they had one good exchange but aren't genuinely expert.
**Mitigation:** The 2-recommendation threshold means at least two separate peers independently confirmed the expertise. Over time, the recency signal self-corrects: if a member earned an AI Infrastructure badge based on two exchanges 18 months ago and hasn't validated it since, the "Last validated: 18 months ago" label communicates that this may not reflect current expertise.

### Safeguard 5: Tier Gaming
**Risk:** Members optimize for volume of exchanges (to advance tiers) rather than quality.
**Mitigation:** Only "Yes" votes on Dimension 3 (Peer Recommendation) count toward tier advancement. Members cannot advance simply by doing many exchanges — they must be genuinely recommended as go-to experts by their peers. Dimension 1 (Expertise Depth) and Dimension 2 (Practical Value) provide additional quality signals for the curation team to monitor.

### Safeguard 6: External Credential Misuse
**Risk:** A member misrepresents their Elev8 credentials externally — claiming a badge they don't have or inflating their profile.
**Mitigation:** The public profile URL is the canonical source of truth. Anyone can verify a member's credentials by visiting their profile page. The credential card includes the profile URL so claims can always be checked. If misrepresentation is reported, the Elev8 team addresses it directly with the member.

---

## Implementation Approach

### Phase 1: Foundation (Months 1-3)
- Build the post-exchange voting flow (3 dimensions)
- Implement the Verified Superpower badge (Layer A)
- Add basic tier tracking (Layer C) — display tier but don't heavily promote it yet
- Voting data feeds into the Elev8 admin dashboard for curation insights
- No external credential features yet — focus on internal value

### Phase 2: Expansion (Months 4-6)
- Launch Domain Expertise badges (Layer B)
- Implement the combined profile display in the Superpower directory
- Launch the digital credential card (shareable image)
- Begin testing the Signal-to-badge discovery flow (seeing badge-holders in insights reports)

### Phase 3: External (Months 7-9)
- Launch public profile URLs
- Integrate credential card sharing with LinkedIn
- Analyze badge data: which superpowers are most validated? Which domains are emerging? Where are gaps?
- Use badge data to improve matching quality and identify community needs

---

## Metrics

| Metric | Target (Year 1) | Measurement |
|--------|-----------------|-------------|
| Post-exchange voting completion rate | 80%+ of exchanges produce votes from both parties | Voting log |
| Verified Superpower badge rate | 60%+ of active members earn their Verified Superpower within 6 months | Badge tracking |
| Domain badge accumulation | Average of 1.5 Domain badges per active member within 12 months | Badge tracking |
| Tier distribution | 60% Rising, 30% Trusted, 10% Master after 12 months | Tier tracking |
| External credential activation | 40%+ of badge holders activate a public profile | Profile settings |
| Credential card sharing | 20%+ of badge holders share their credential card at least once | Share tracking |
| Badge-driven exchange motivation | Members with badges participate in 2x more exchanges than those without | Engagement correlation |

---

## Related Documents

- **company.md** — Strategic context, mission, and the recognition gap (pain point #4)
- **legal-compliance.md** — Privacy requirements for voting data and public profiles
- **cognitive-psychology.md** — Behavioral science behind recognition, status, and motivation
- **product-owner.md** — Build sequence and acceptance criteria for badge features
- **product-manager.md** — How badges fit into the product roadmap and competitive moat
- **ux-design.md** — Visual design standards for badges, profiles, and credential cards
- **data-analytics.md** — Voting data schema and anonymization requirements
- **community-ops.md** — Curation team's role in monitoring vote integrity and badge quality
- **growth-marketing.md** — How external credentials drive organic member acquisition
- **peer-recognition.md** (this document) — The complete badge system design
