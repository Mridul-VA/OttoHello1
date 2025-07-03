import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const slackToken = process.env.VITE_SLACK_BOT_TOKEN;

    if (!slackToken || !slackToken.startsWith('xoxb-')) {
      return res.status(400).json({ error: 'Invalid or missing Slack token' });
    }

    const response = await fetch('https://slack.com/api/users.list', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${slackToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Slack API error' });
    }

    const data = await response.json();

    if (!data.ok) {
      return res.status(500).json({ error: data.error || 'Slack API response error' });
    }

    const users = data.members
      .filter((user: any) =>
        !user.deleted &&
        !user.is_bot &&
        !user.is_app_user &&
        user.real_name &&
        user.name !== 'slackbot'
      )
      .map((user: any) => ({
        id: user.id,
        name: user.name,
        real_name: user.real_name || user.profile?.real_name || user.profile?.display_name || user.name,
        profile: user.profile,
      }));

    res.status(200).json({ users });
  } catch (error) {
    console.error('[API ERROR]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
