# Elev8 — Legal & Compliance: Critical Considerations for Product Design

*This document is part of the Elev8 product team's foundational context. It covers the legal and compliance constraints that must inform every product decision. Read alongside company.md (strategic context) and cognitive-psychology.md (behavioral design principles).*

---

## Why This Matters

Elev8 operates across Korea and the US, collects data from senior executives at major technology companies, and sits in a sensitive space between community and talent acquisition. Every feature the product team builds has legal implications — often across two jurisdictions with different rules. Legal and compliance is not a post-launch concern. It is a foundational design input.

The product team should treat the following areas as hard constraints, not suggestions. A single compliance failure could destroy the trust that the entire Elev8 model depends on.

---

## 1. Korea's Personal Information Protection Act (PIPA)

Korea's PIPA is one of the strictest data privacy laws in the world — in many ways more stringent than GDPR. Signal collects email addresses tied to survey responses from senior tech leaders. Under PIPA, Elev8 needs explicit, informed consent for collecting, processing, and storing personal information. The product must include properly designed consent flows, data processing agreements, and privacy notices that are PIPA-compliant. Getting this wrong in Korea can result in criminal penalties — including imprisonment for responsible officers — not just fines. For a community built on trust, a data breach or compliance violation would be existential.

**Product implication:** Every data collection touchpoint (Signal votes, Superpower profiles, event registrations, membership applications) must include PIPA-compliant consent mechanisms. These cannot be afterthoughts — they must be designed into the core user experience.

---

## 2. Cross-Border Data Transfer

Elev8 members are in the US, Korea, Singapore, Japan, and China. Signal data (emails, survey responses, behavioral data) likely flows between servers in different countries. Korea's PIPA has strict rules about transferring personal data outside of Korea — it requires either consent from the data subject, adequate safeguards, or specific contractual arrangements. A US-hosted database receiving Korean member data needs proper legal architecture.

**Product implication:** The product team must know exactly where data is stored, processed, and transferred. Data flow architecture must be designed with legal compliance as a first-order requirement, not retrofitted later.

---

## 3. Non-Member Data Collection (The FOMO Mechanism)

Signal prompts non-members to enter their email and fill out a membership request form. This means Elev8 is collecting personal data from people who are NOT yet members and have NOT agreed to membership terms. Under both PIPA and US state privacy laws (California's CCPA/CPRA, etc.), this requires its own consent framework, data retention limits, and deletion policies.

**Product implication:** The non-member signup flow needs its own privacy notice and consent mechanism — separate from the member terms. The system must track how long non-member data is retained and automatically handle deletion if they don't convert within the defined retention period.

---

## 4. Survey Data as Sensitive Business Intelligence

Signal aggregates opinions from Directors and VPs at Google, Meta, Nvidia, Samsung, and other major companies. Even anonymized, this data could be considered commercially sensitive. If a Signal insights report reveals that "73% of senior AI leaders at top US tech companies are planning infrastructure investments in Q3," that's potentially market-moving intelligence.

**Product implication:** Insights reports must be designed with anonymization safeguards that prevent re-identification. In a small, curated community, a combination of role + company + domain could identify a specific individual. The product must enforce minimum aggregation thresholds (e.g., no insight based on fewer than X responses) and strip identifying combinations. Legal counsel should advise on whether any securities regulations apply to distributing aggregated executive sentiment data.

---

## 5. Employment Law and the "Open to Opportunities" Signal

The Superpower Exchange includes a discreet "Open to Opportunities" flag. In the US, this is relatively straightforward. In Korea, employment relationships and non-compete/non-solicitation agreements work differently. Korean labor law has specific provisions around notice periods, non-compete clauses, and confidentiality that could be implicated when a member signals openness to leave their current company.

**Product implication:** The "Open to Opportunities" feature needs legal review specific to Korean employment law. The UI must include appropriate disclaimers, and the feature should be designed so that neither Elev8 nor the member inadvertently violates employment obligations.

---

## 6. Anti-Solicitation and Unfair Trade Practices

Because Elev8 has a strategic partnership with Coupang, there is a risk that competitors of member companies could argue that Elev8 is a disguised recruiting operation that unfairly solicits their employees. Korea's Fair Trade Commission and Unfair Competition Prevention Act could be relevant.

**Product implication:** The product must be designed with clear boundaries: Coupang should never have direct access to member data through the platform. Career moves must always be member-initiated, not pushed. The community's independence from Coupang must be not just narratively positioned but legally documented and architecturally enforced. There should be no backend data pipeline from Elev8 Signal to Coupang's recruiting systems.

---

## 7. Intellectual Property in Superpower Exchanges

When a CTO shares their "playbook for engineering org design at 200-500 engineers" through a Superpower Exchange, who owns that intellectual property? Their current employer could argue that proprietary methodologies were shared without authorization.

**Product implication:** The terms of participation must clearly state that members share general expertise and personal experience — not proprietary company information. The platform should include appropriate disclaimers at exchange touchpoints. Elev8's terms must limit liability if a member inadvertently shares something they shouldn't.

---

## 8. Terms of Service — Dual Jurisdiction

Elev8 needs Terms of Service that work under both Korean and US law. Korea has strong consumer protection laws that can override contractual limitations that would be enforceable in the US. This is particularly important for an invite-only community where membership can be revoked.

**Product implication:** The onboarding flow, membership agreement, and dispute resolution mechanisms must be designed for dual-jurisdiction enforceability. The product team should work with legal to ensure that ToS acceptance flows, membership revocation processes, and data handling procedures are compliant in both countries.

---

## 9. Anti-Discrimination and Heritage-Based Membership

Elev8's current membership criteria focus on Korean-heritage professionals. While this is a legitimate affinity community (similar to NSBE for Black engineers or SHPE for Hispanic professionals), the framing matters legally — especially as Elev8 expands to include strategic partners who may use the community for talent sourcing. US employment discrimination laws (Title VII, state laws) prohibit using race or national origin in hiring decisions.

**Product implication:** The membership criteria and the talent pipeline function must be structured so that strategic partners' hiring decisions remain legally defensible. The platform should never surface members to partners based on ethnicity or national origin as a filtering criterion. Career opportunities must be presented based on skills, experience, and domain expertise — not heritage.

---

## 10. Regulatory Compliance for Future Monetization

As Elev8 grows and potentially monetizes (membership fees, corporate partnership packages, event sponsorships), Korean and US tax, corporate, and commercial regulations will apply. Korea has specific rules about membership organizations, subscription services, and cross-border commercial activities.

**Product implication:** Payment flows, subscription management, and partnership billing should be designed with future compliance requirements in mind. Getting the architecture right now is far cheaper than rebuilding later.

---

## Summary: The Legal Design Principle

Every feature that collects data, crosses borders, surfaces insights, or facilitates career mobility has legal implications in both Korea and the US. PIPA compliance, cross-border data transfer rules, anonymization safeguards, employment law constraints, and anti-solicitation boundaries must be designed into features from the start — not retrofitted after launch.

A compliance failure doesn't just create legal risk — it destroys the trust that everything else depends on. For Elev8, trust is the product. Legal compliance is trust protection.

---

## Related Documents

- **company.md** — What Elev8 is, mission, founder story, programs, vision, and product design principles
- **legal-compliance.md** (this document) — 10 critical legal and compliance areas that constrain product design
- **cognitive-psychology.md** — Behavioral science principles for designing features for senior executive users
