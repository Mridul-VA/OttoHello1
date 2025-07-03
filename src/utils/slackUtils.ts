// Production Slack integration utilities
interface SlackUser {
  id: string;
  name: string;
  real_name: string;
  profile?: {
    email?: string;
    display_name?: string;
    real_name?: string;
  };
}

// 🔴 Final API Call – Vercel serverless proxy
export async function fetchSlackUsers(): Promise<SlackUser[]> {
  try {
    console.log('[SLACK] Fetching users via serverless function...');

    const response = await fetch('/api/fetchSlackUsers'); // hitting your API route

    if (response.ok) {
      const data = await response.json();
      console.log(`[SLACK] Successfully fetched ${data.users.length} users from Slack`);
      return data.users;
    } else {
      console.error('[SLACK] HTTP Error:', response.status, response.statusText);
      return [];
    }
  } catch (error) {
    console.error('[SLACK] Error fetching users:', error);
    return [];
  }
}

// Send Slack notification directly from client
export async function sendSlackNotification(
  userId: string,
  visitorName: string,
  purpose: string
): Promise<boolean> {
  try {
    const slackToken = import.meta.env.VITE_SLACK_BOT_TOKEN;
    const webhookUrl = import.meta.env.VITE_SLACK_WEBHOOK_URL;

    const currentTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const message = `👋 *Visitor Alert*

*${visitorName}* is here to see you!

📋 *Purpose:* ${purpose}
🏢 *Location:* Reception Desk
⏰ *Time:* ${currentTime}

Please come to reception when convenient. Thank you! 🙏`;

    if (slackToken && slackToken.startsWith('xoxb-')) {
      console.log(`[SLACK] Sending direct message to user ${userId}...`);

      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${slackToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: userId,
          text: message,
          unfurl_links: false,
          unfurl_media: false,
          username: 'OttoHello Visitor System',
          icon_emoji: ':wave:',
        }),
      });

      const result = await response.json();
      if (result.ok) {
        console.log(`[SLACK] Direct message sent successfully to ${userId}`);
        return true;
      } else {
        console.error('[SLACK] Direct message failed:', result.error);
      }
    }

    if (webhookUrl && webhookUrl.startsWith('https://hooks.slack.com/')) {
      console.log('[SLACK] Sending webhook notification...');

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message,
          username: 'OttoHello Visitor System',
          icon_emoji: ':wave:',
        }),
      });

      if (response.ok) {
        console.log('[SLACK] Webhook notification sent successfully');
        return true;
      } else {
        console.error('[SLACK] Webhook failed:', response.status, response.statusText);
      }
    }

    console.log(`[SLACK DEMO] Would send notification:`, {
      userId,
      visitorName,
      purpose,
      message
    });

    return true;

  } catch (error) {
    console.error('[SLACK] Error sending notification:', error);
    return false;
  }
}

// Utility function to find user by name
export function findSlackUserByName(users: SlackUser[], name: string): SlackUser | undefined {
  const searchName = name.toLowerCase().trim();

  let user = users.find(user =>
    user.real_name.toLowerCase() === searchName ||
    user.name.toLowerCase() === searchName ||
    user.profile?.display_name?.toLowerCase() === searchName
  );

  if (user) return user;

  user = users.find(user =>
    user.real_name.toLowerCase().includes(searchName) ||
    user.name.toLowerCase().includes(searchName) ||
    user.profile?.display_name?.toLowerCase().includes(searchName) ||
    user.profile?.email?.toLowerCase().includes(searchName)
  );

  if (user) return user;

  const nameParts = searchName.split(' ');
  if (nameParts.length > 1) {
    user = users.find(user => {
      const userNameParts = user.real_name.toLowerCase().split(' ');
      return nameParts.some(part =>
        userNameParts.some(userPart => userPart.includes(part))
      );
    });
  }

  return user;
}

export function isSlackConfigured(): boolean {
  const token = import.meta.env.VITE_SLACK_BOT_TOKEN;
  const webhook = import.meta.env.VITE_SLACK_WEBHOOK_URL;

  return (token && token.startsWith('xoxb-')) ||
    (webhook && webhook.startsWith('https://hooks.slack.com/'));
}

export function getSlackStatus(): { configured: boolean; hasBot: boolean; hasWebhook: boolean } {
  const token = import.meta.env.VITE_SLACK_BOT_TOKEN;
  const webhook = import.meta.env.VITE_SLACK_WEBHOOK_URL;

  const hasBot = !!(token && token.startsWith('xoxb-'));
  const hasWebhook = !!(webhook && webhook.startsWith('https://hooks.slack.com/'));

  return {
    configured: hasBot || hasWebhook,
    hasBot,
    hasWebhook
  };
}
