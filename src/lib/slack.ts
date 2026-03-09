const WEBHOOKS = {
  signalVotes: process.env.SLACK_WEBHOOK_SIGNAL_VOTES,
  youtubeQuestions: process.env.SLACK_WEBHOOK_YOUTUBE_QUESTIONS,
} as const;

type SlackChannel = keyof typeof WEBHOOKS;

export async function sendSlackNotification(
  channel: SlackChannel,
  message: string
) {
  const webhookUrl = WEBHOOKS[channel];
  if (!webhookUrl) {
    console.warn(`Slack webhook for "${channel}" not set — skipping`);
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });
  } catch (error) {
    console.error(`Slack notification to "${channel}" failed:`, error);
  }
}
