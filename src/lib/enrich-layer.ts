/**
 * Enrich Layer API client — fetches real LinkedIn profile data.
 * API: https://enrichlayer.com/api/v2/profile?url=<LINKEDIN_URL>
 * Auth: Bearer $ENRICH_LAYER_API_KEY
 * Credits: 1 per unique profile lookup (200 available)
 */

export interface LinkedInExperience {
  company: string | null;
  title: string | null;
  description: string | null;
  starts_at: { day: number; month: number; year: number } | null;
  ends_at: { day: number; month: number; year: number } | null;
  location: string | null;
  company_linkedin_profile_url: string | null;
}

export interface LinkedInEducation {
  school: string | null;
  degree_name: string | null;
  field_of_study: string | null;
  starts_at: { day: number; month: number; year: number } | null;
  ends_at: { day: number; month: number; year: number } | null;
}

export interface LinkedInProfile {
  full_name: string | null;
  occupation: string | null;
  headline: string | null;
  summary: string | null;
  country: string | null;
  city: string | null;
  state: string | null;
  location_str: string | null;
  experiences: LinkedInExperience[];
  education: LinkedInEducation[];
  skills: string[];
  languages: string[];
  certifications: { name: string; authority: string | null }[];
  recommendations: string[];
  articles: { title: string; link: string }[];
  personal_emails: string[];
  connections: number | null;
  follower_count: number | null;
  profile_pic_url: string | null;
}

/**
 * Fetch a LinkedIn profile from Enrich Layer API.
 * Retries up to 3 times on 403/429 with exponential backoff.
 */
export async function fetchLinkedInProfile(linkedinUrl: string): Promise<LinkedInProfile | null> {
  const apiKey = process.env.ENRICH_LAYER_API_KEY;
  if (!apiKey) {
    console.error("ENRICH_LAYER_API_KEY not set");
    return null;
  }

  const url = `https://enrichlayer.com/api/v2/profile?url=${encodeURIComponent(linkedinUrl)}`;
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "User-Agent": "curl/8.0",
        },
        signal: AbortSignal.timeout(30000),
      });

      if (res.status === 403 || res.status === 429) {
        if (attempt < maxRetries - 1) {
          const wait = 10000 * (attempt + 1);
          console.log(`Enrich Layer rate limited (${res.status}), waiting ${wait / 1000}s...`);
          await new Promise((r) => setTimeout(r, wait));
          continue;
        }
        console.error(`Enrich Layer failed after ${maxRetries} attempts: ${res.status}`);
        return null;
      }

      if (!res.ok) {
        console.error(`Enrich Layer error: ${res.status} ${res.statusText}`);
        return null;
      }

      const data = await res.json();

      // Normalize the response into our typed interface
      return {
        full_name: data.full_name || null,
        occupation: data.occupation || null,
        headline: data.headline || null,
        summary: data.summary || null,
        country: data.country || null,
        city: data.city || null,
        state: data.state || null,
        location_str: data.location_str || null,
        experiences: (data.experiences || []).map((e: Record<string, unknown>) => ({
          company: e.company || null,
          title: e.title || null,
          description: e.description || null,
          starts_at: e.starts_at || null,
          ends_at: e.ends_at || null,
          location: e.location || null,
          company_linkedin_profile_url: e.company_linkedin_profile_url || null,
        })),
        education: (data.education || []).map((e: Record<string, unknown>) => ({
          school: e.school || null,
          degree_name: e.degree_name || null,
          field_of_study: e.field_of_study || null,
          starts_at: e.starts_at || null,
          ends_at: e.ends_at || null,
        })),
        skills: Array.isArray(data.skills) ? data.skills : [],
        languages: extractLanguages(data),
        certifications: (data.certifications || []).map((c: Record<string, unknown>) => ({
          name: c.name || "",
          authority: c.authority || null,
        })),
        recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
        articles: (data.articles || []).map((a: Record<string, unknown>) => ({
          title: a.title || "",
          link: a.link || "",
        })),
        personal_emails: Array.isArray(data.personal_emails) ? data.personal_emails : [],
        connections: typeof data.connections === "number" ? data.connections : null,
        follower_count: typeof data.follower_count === "number" ? data.follower_count : null,
        profile_pic_url: data.profile_pic_url || null,
      };
    } catch (error) {
      console.error(`Enrich Layer request failed (attempt ${attempt + 1}):`, error);
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)));
        continue;
      }
      return null;
    }
  }

  return null;
}

function extractLanguages(data: Record<string, unknown>): string[] {
  // Try languages array first
  const langs = data.languages;
  if (Array.isArray(langs) && langs.length > 0) {
    if (typeof langs[0] === "string") return langs as string[];
    if (typeof langs[0] === "object" && langs[0] !== null) {
      return langs.map((l: Record<string, unknown>) => String(l.name || "")).filter(Boolean);
    }
  }

  // Fallback to languages_and_proficiencies
  const lp = data.languages_and_proficiencies;
  if (Array.isArray(lp) && lp.length > 0) {
    return lp.map((l: Record<string, unknown>) => String(l.name || "")).filter(Boolean);
  }

  return [];
}

export type LinkedInCompleteness = "rich" | "basic" | "minimal";

interface CompletenessResult {
  tier: LinkedInCompleteness;
  score: number; // 0-100
}

/**
 * Assess how complete a LinkedIn profile is.
 * Used for dynamic weighting in Xray Phase 3.
 */
export function assessLinkedInCompleteness(profile: LinkedInProfile): CompletenessResult {
  let score = 0;
  const checks = [
    { weight: 10, pass: !!profile.summary },
    { weight: 15, pass: profile.experiences.length >= 3 },
    { weight: 10, pass: profile.experiences.length >= 1 },
    { weight: 10, pass: profile.experiences.some((e) => !!e.description) },
    { weight: 10, pass: profile.education.length >= 1 },
    { weight: 10, pass: profile.skills.length >= 3 },
    { weight: 5, pass: profile.skills.length >= 1 },
    { weight: 10, pass: profile.recommendations.length >= 1 },
    { weight: 5, pass: profile.languages.length >= 1 },
    { weight: 5, pass: profile.certifications.length >= 1 },
    { weight: 5, pass: !!profile.headline },
    { weight: 5, pass: profile.articles.length >= 1 },
  ];

  for (const check of checks) {
    if (check.pass) score += check.weight;
  }

  let tier: LinkedInCompleteness;
  if (score >= 65) tier = "rich";
  else if (score >= 35) tier = "basic";
  else tier = "minimal";

  return { tier, score };
}

/**
 * Format LinkedIn profile data as a readable text block for Claude prompts.
 */
export function formatLinkedInForPrompt(profile: LinkedInProfile): string {
  const sections: string[] = [];

  sections.push(`Name: ${profile.full_name || "Unknown"}`);
  if (profile.headline) sections.push(`Headline: ${profile.headline}`);
  if (profile.occupation) sections.push(`Current Role: ${profile.occupation}`);
  if (profile.location_str) sections.push(`Location: ${profile.location_str}`);
  if (profile.summary) sections.push(`\nSummary:\n${profile.summary}`);

  if (profile.experiences.length > 0) {
    sections.push("\nExperience:");
    for (const exp of profile.experiences.slice(0, 8)) {
      const period = formatPeriod(exp.starts_at, exp.ends_at);
      sections.push(`  - ${exp.title || "Unknown Role"} at ${exp.company || "Unknown Company"} ${period}`);
      if (exp.description) {
        sections.push(`    ${exp.description.slice(0, 300)}`);
      }
    }
  }

  if (profile.education.length > 0) {
    sections.push("\nEducation:");
    for (const edu of profile.education) {
      const degree = [edu.degree_name, edu.field_of_study].filter(Boolean).join(" in ");
      sections.push(`  - ${edu.school || "Unknown School"}${degree ? ` — ${degree}` : ""}`);
    }
  }

  if (profile.skills.length > 0) {
    sections.push(`\nSkills: ${profile.skills.slice(0, 20).join(", ")}`);
  }

  if (profile.languages.length > 0) {
    sections.push(`Languages: ${profile.languages.join(", ")}`);
  }

  if (profile.certifications.length > 0) {
    sections.push("\nCertifications:");
    for (const cert of profile.certifications.slice(0, 5)) {
      sections.push(`  - ${cert.name}${cert.authority ? ` (${cert.authority})` : ""}`);
    }
  }

  if (profile.recommendations.length > 0) {
    sections.push(`\nRecommendations (${profile.recommendations.length} total):`);
    for (const rec of profile.recommendations.slice(0, 3)) {
      sections.push(`  "${rec.slice(0, 200)}"`);
    }
  }

  if (profile.connections) {
    sections.push(`\nConnections: ${profile.connections}+`);
  }

  return sections.join("\n");
}

function formatPeriod(
  start: { day: number; month: number; year: number } | null,
  end: { day: number; month: number; year: number } | null
): string {
  if (!start) return "";
  const s = `${start.month || ""}/${start.year}`;
  const e = end ? `${end.month || ""}/${end.year}` : "Present";
  return `(${s} — ${e})`;
}
