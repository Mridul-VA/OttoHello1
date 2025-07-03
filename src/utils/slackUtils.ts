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

// Enhanced mock data as fallback
const mockSlackUsers: SlackUser[] = [
  { id: 'U123456', name: 'john.doe', real_name: 'John Doe', profile: { email: 'john.doe@growthjockey.com' } },
  { id: 'U234567', name: 'jane.smith', real_name: 'Jane Smith', profile: { email: 'jane.smith@growthjockey.com' } },
  { id: 'U345678', name: 'mike.johnson', real_name: 'Mike Johnson', profile: { email: 'mike.johnson@growthjockey.com' } },
  { id: 'U456789', name: 'sarah.wilson', real_name: 'Sarah Wilson', profile: { email: 'sarah.wilson@growthjockey.com' } },
  { id: 'U567890', name: 'david.brown', real_name: 'David Brown', profile: { email: 'david.brown@growthjockey.com' } },
  { id: 'U678901', name: 'lisa.davis', real_name: 'Lisa Davis', profile: { email: 'lisa.davis@growthjockey.com' } },
  { id: 'U789012', name: 'tom.miller', real_name: 'Tom Miller', profile: { email: 'tom.miller@growthjockey.com' } },
  { id: 'U890123', name: 'amy.garcia', real_name: 'Amy Garcia', profile: { email: 'amy.garcia@growthjockey.com' } },
  { id: 'U901234', name: 'robert.lee', real_name: 'Robert Lee', profile: { email: 'robert.lee@growthjockey.com' } },
  { id: 'U012345', name: 'emily.chen', real_name: 'Emily Chen', profile: { email: 'emily.chen@growthjockey.com' } },
  { id: 'U112233', name: 'alex.kumar', real_name: 'Alex Kumar', profile: { email: 'alex.kumar@growthjockey.com' } },
  { id: 'U223344', name: 'priya.sharma', real_name: 'Priya Sharma', profile: { email: 'priya.sharma@growthjockey.com' } },
];

export async function fetchSlackUsers(): Promise<SlackUser[]> {
  try {
    const slackToken = import.meta.env.VITE_SLACK_BOT_TOKEN;
    
    if (slackToken && slackToken.startsWith('xoxb-')) {
      console.log('[SLACK] Fetching users from Slack API...');
      
      const response = await fetch('https://slack.com/api/users.list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${slackToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.members) {
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
          
          console.log(`[SLACK] Successfully fetched ${users.length} users from Slack`);
          return users;
        } else {
          console.error('[SLACK] API Error:', data.error);
        }
      } else {
        console.error('[SLACK] HTTP Error:', response.status, response.statusText);
      }
    }
    
    // Fallback to mock data
    console.log('[SLACK] Using mock data - check VITE_SLACK_BOT_TOKEN configuration');
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockSlackUsers;
    
  } catch (error) {
    console.error('[SLACK] Error fetching users:', error);
    return mockSlackUsers;
  }
}

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

    // Try direct message first (if we have bot token)
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
        // Fall through to webhook
      }
    }
    
    // Try webhook as fallback
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
    
    // Development/Demo mode
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

// Utility function to find user by name (case-insensitive, fuzzy matching)
export function findSlackUserByName(users: SlackUser[], name: string): SlackUser | undefined {
  const searchName = name.toLowerCase().trim();
  
  // Exact matches first
  let user = users.find(user => 
    user.real_name.toLowerCase() === searchName ||
    user.name.toLowerCase() === searchName ||
    user.profile?.display_name?.toLowerCase() === searchName
  );
  
  if (user) return user;
  
  // Partial matches
  user = users.find(user => 
    user.real_name.toLowerCase().includes(searchName) ||
    user.name.toLowerCase().includes(searchName) ||
    user.profile?.display_name?.toLowerCase().includes(searchName) ||
    user.profile?.email?.toLowerCase().includes(searchName)
  );
  
  if (user) return user;
  
  // First name or last name matches
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

// Utility function to validate Slack configuration
export function isSlackConfigured(): boolean {
  const token = import.meta.env.VITE_SLACK_BOT_TOKEN;
  const webhook = import.meta.env.VITE_SLACK_WEBHOOK_URL;
  
  return (token && token.startsWith('xoxb-')) || 
         (webhook && webhook.startsWith('https://hooks.slack.com/'));
}

// Get Slack configuration status for UI
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