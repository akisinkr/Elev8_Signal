import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GenerateInsightParams {
  question: string;
  options: { label: string; answer: string }[];
  distribution: { answer: string; label: string; count: number; percentage: number }[];
  whyResponses: string[];
  totalVotes: number;
}

export interface RelatedArticle {
  title: string;
  url: string;
  source: string;
  lang: "en" | "kr";
}

export interface BilingualInsight {
  en: string[];
  kr: string[];
  articles?: RelatedArticle[];
}

export async function generateSignalInsight({
  question,
  options,
  distribution,
  whyResponses,
  totalVotes,
}: GenerateInsightParams): Promise<BilingualInsight> {
  const optionsSummary = options
    .map((o) => {
      const dist = distribution.find((d) => d.answer === o.answer);
      return `${o.answer}. ${o.label} — ${dist?.count ?? 0} votes (${dist?.percentage ?? 0}%)`;
    })
    .join("\n");

  const whySection =
    whyResponses.length > 0
      ? `\n\nSelected "why" responses from voters:\n${whyResponses.map((w) => `- "${w}"`).join("\n")}`
      : "";

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: `You are a strategic analyst for Elev8 — an invite-only leadership community of senior tech executives (VPs, C-suite, founders). You're writing exclusive insights that ONLY Elev8 members can access.

Your job: Analyze poll results and produce 5 sharp, career-actionable insights.

Tone & style:
- Write like a trusted advisor whispering alpha to a peer — direct, confident, zero fluff
- Address the reader as a fellow leader ("your peers", "this group", "the room")
- Reference specific percentages to ground each point
- Each insight should be 1-2 sentences max — punchy, not wordy
- Make every point something a leader could act on THIS WEEK
- Mix data interpretation with strategic implication
- Make it feel exclusive: "What ${totalVotes} senior leaders revealed..." energy

The 5 insights should cover:
1. The dominant signal — what the majority clearly believes
2. The contrarian edge — what the minority view reveals (often the real alpha)
3. The hidden pattern — what the "why" responses expose beneath the numbers
4. The career move — a specific action leaders should consider based on this data
5. The forward look — where this trend is heading and what to watch for

CRITICAL: Return ONLY valid JSON in this exact format, no other text:
{
  "en": ["insight 1", "insight 2", "insight 3", "insight 4", "insight 5"],
  "kr": ["인사이트 1", "인사이트 2", "인사이트 3", "인사이트 4", "인사이트 5"]
}

The Korean version should be a natural Korean translation — not literal, but localized for Korean tech executives. Use 존댓말 (formal polite) style.`,
    messages: [
      {
        role: "user",
        content: `Poll question: "${question}"

Total votes: ${totalVotes}

Results:
${optionsSummary}
${whySection}

Generate the 5 bilingual insights as JSON.`,
      },
    ],
  });

  const block = message.content[0];
  if (block.type !== "text") {
    throw new Error("Unexpected response from Claude");
  }

  // Extract JSON from response (handle potential markdown wrapping)
  let jsonStr = block.text.trim();
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  const parsed = JSON.parse(jsonStr) as BilingualInsight;

  if (!Array.isArray(parsed.en) || !Array.isArray(parsed.kr)) {
    throw new Error("Invalid insight format from Claude");
  }

  return parsed;
}

export interface PolishedSignalQuestion {
  polishedQuestion: string;
  options: [string, string, string, string, string];
}

export async function polishSignalQuestion({
  rawQuestion,
  context,
}: {
  rawQuestion: string;
  context?: string;
}): Promise<PolishedSignalQuestion> {
  const contextSection = context
    ? `\n\nThe submitter explained why this matters: "${context}"`
    : "";

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: `You are an expert survey designer for Elev8 — an invite-only leadership community of senior tech executives (VPs, C-suite, founders).

Your job: Take a rough question submitted by a member and polish it into a clear, thought-provoking survey question with 5 answer options.

Guidelines:
- The polished question should be concise, specific, and relevant to senior tech leaders
- Keep the original intent — don't change what they're asking, just make it sharper
- Generate exactly 5 mutually exclusive answer options that cover the full range of reasonable responses
- Options should be concrete and actionable, not vague
- Each option should be 1-2 short sentences max

CRITICAL: Return ONLY valid JSON in this exact format, no other text:
{
  "polishedQuestion": "The polished survey question",
  "options": ["Option A", "Option B", "Option C", "Option D", "Option E"]
}`,
    messages: [
      {
        role: "user",
        content: `Raw question from a member: "${rawQuestion}"${contextSection}

Polish this into a survey question with 5 answer options.`,
      },
    ],
  });

  const block = message.content[0];
  if (block.type !== "text") {
    throw new Error("Unexpected response from Claude");
  }

  let jsonStr = block.text.trim();
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  const parsed = JSON.parse(jsonStr) as PolishedSignalQuestion;

  if (!parsed.polishedQuestion || !Array.isArray(parsed.options) || parsed.options.length !== 5) {
    throw new Error("Invalid polished question format from Claude");
  }

  return parsed;
}

export async function generateRelatedArticles(
  question: string,
  insightPoints: string[]
): Promise<RelatedArticle[]> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
      },
    ],
    system: `You are a research assistant for Elev8, an invite-only community of senior tech executives. Find 3-5 highly relevant, recent news articles or reports related to the given topic.

Requirements:
- Focus ONLY on US and Korea (South Korea) markets
- Mix of English and Korean language articles
- Prioritize: tech industry news, leadership insights, business strategy, career development
- Sources should be credible (major publications, industry reports, reputable tech media)
- Articles should be recent (within last 3 months if possible)

After searching, return ONLY valid JSON in this exact format, no other text:
{
  "articles": [
    { "title": "Article Title", "url": "https://...", "source": "Publication Name", "lang": "en" },
    { "title": "기사 제목", "url": "https://...", "source": "매체명", "lang": "kr" }
  ]
}`,
    messages: [
      {
        role: "user",
        content: `Find 3-5 recent articles related to this topic:

Question: "${question}"

Key themes from our executive poll:
${insightPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}

Search for relevant articles and return as JSON.`,
      },
    ],
  });

  // Extract text from response (may include tool use blocks)
  let responseText = "";
  for (const block of message.content) {
    if (block.type === "text") {
      responseText += block.text;
    }
  }

  if (!responseText.trim()) {
    return [];
  }

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed.articles)) {
        return parsed.articles.filter(
          (a: RelatedArticle) => a.title && a.url && a.source
        );
      }
    }
  } catch {
    // If parsing fails, return empty
  }

  return [];
}

export interface KoreanTranslation {
  questionKr: string;
  optionAKr: string;
  optionBKr: string;
  optionCKr: string;
  optionDKr: string;
  optionEKr: string;
}

export async function translateSignalToKorean({
  question,
  optionA,
  optionB,
  optionC,
  optionD,
  optionE,
}: {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string;
}): Promise<KoreanTranslation> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: `You are a bilingual expert translating survey questions for Elev8 — an invite-only leadership community of senior tech executives (VPs, C-suite, founders) based in Korea and the US.

Your job: Translate the English survey question and its 5 answer options into natural, well-contexted Korean.

Translation guidelines:
- Use 존댓말 (formal polite) but keep it conversational — not stiff corporate Korean
- Preserve the wit, edge, and tone of the English version — don't flatten the personality
- Use natural Korean phrasing and word order, NOT direct translation
- Keep the same level of engagement: thought-provoking, slightly provocative, fun yet substantive
- The audience is top-tier senior leaders — match that gravitas without being boring
- If the English uses metaphors or idioms, find equivalent Korean expressions rather than translating literally
- Technical terms can stay in English where Korean leaders would naturally use them (e.g., AI, ROI, KPI)

CRITICAL: Return ONLY valid JSON in this exact format, no other text:
{
  "questionKr": "한국어 질문",
  "optionAKr": "선택지 A",
  "optionBKr": "선택지 B",
  "optionCKr": "선택지 C",
  "optionDKr": "선택지 D",
  "optionEKr": "선택지 E"
}`,
    messages: [
      {
        role: "user",
        content: `Translate this survey question and options into Korean:

Question: "${question}"

A. ${optionA}
B. ${optionB}
C. ${optionC}
D. ${optionD}
E. ${optionE}`,
      },
    ],
  });

  const block = message.content[0];
  if (block.type !== "text") {
    throw new Error("Unexpected response from Claude");
  }

  let jsonStr = block.text.trim();
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  const parsed = JSON.parse(jsonStr) as KoreanTranslation;

  if (!parsed.questionKr || !parsed.optionAKr || !parsed.optionBKr || !parsed.optionCKr || !parsed.optionDKr || !parsed.optionEKr) {
    throw new Error("Invalid Korean translation format from Claude");
  }

  return parsed;
}
