import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req, { skipAuth: true });
    const { paymentId, txHash, accessLinkId } = await req.json();

    if ((!paymentId && !txHash) || !accessLinkId) {
      return Response.json({ error: 'Missing paymentId or txHash, and accessLinkId' }, { status: 400 });
    }

    const sr = base44.asServiceRole;

    // Find the access link first
    let link;
    try {
      link = await sr.entities.CommunityAccessLink.get(accessLinkId);
    } catch { /* not found */ }
    if (!link) return Response.json({ error: 'Access link not found' }, { status: 404 });

    // Find payment by id or txHash
    let payment;
    if (paymentId) {
      try {
        payment = await sr.entities.Payment.get(paymentId);
      } catch { /* not found */ }
    } else if (txHash) {
      const payments = await sr.entities.Payment.filter({ tx_hash: txHash });
      payment = payments[0];
    }

    // If payment not yet recorded (tx still indexing), return invite link directly
    if (!payment) {
      return Response.json({ success: true, platform: link.platform, invite_link: link.invite_link, note: 'Payment still indexing, using static invite' });
    }

    // Payment found but not yet confirmed — still allow access for wallet-direct flow
    // (recordWalletPayment may mark it confirmed slightly later)

    // For non-discord platforms, just return the invite_link
    if (link.platform !== 'discord') {
      return Response.json({ success: true, platform: link.platform, invite_link: link.invite_link });
    }

    // Discord: assign role via bot
    const discordUsername = payment.payer_discord_username;
    if (!discordUsername) {
      return Response.json({ success: true, platform: 'discord', invite_link: link.invite_link, note: 'No Discord username provided' });
    }

    const { discord_guild_id, discord_role_id, discord_bot_token, welcome_message } = link;
    if (!discord_guild_id || !discord_role_id || !discord_bot_token) {
      return Response.json({ success: true, platform: 'discord', invite_link: link.invite_link, note: 'Discord bot not fully configured' });
    }

    const DISCORD_API = 'https://discord.com/api/v10';
    const headers = { 'Authorization': `Bot ${discord_bot_token}`, 'Content-Type': 'application/json' };

    const searchRes = await fetch(
      `${DISCORD_API}/guilds/${discord_guild_id}/members/search?query=${encodeURIComponent(discordUsername.replace(/^@/, ''))}&limit=5`,
      { headers }
    );

    if (!searchRes.ok) {
      return Response.json({ success: true, invite_link: link.invite_link, note: 'Discord search failed, use invite link' });
    }

    const members = await searchRes.json();
    const cleanInput = discordUsername.replace(/^@/, '').toLowerCase();
    const member = members.find(m =>
      m.user?.username?.toLowerCase() === cleanInput ||
      m.user?.global_name?.toLowerCase() === cleanInput
    );

    if (!member) {
      return Response.json({ success: true, invite_link: link.invite_link, note: `User "${discordUsername}" not found in server` });
    }

    const userId = member.user.id;
    await fetch(`${DISCORD_API}/guilds/${discord_guild_id}/members/${userId}/roles/${discord_role_id}`, { method: 'PUT', headers });

    if (welcome_message) {
      try {
        const dmRes = await fetch(`${DISCORD_API}/users/@me/channels`, { method: 'POST', headers, body: JSON.stringify({ recipient_id: userId }) });
        if (dmRes.ok) {
          const dmChannel = await dmRes.json();
          await fetch(`${DISCORD_API}/channels/${dmChannel.id}/messages`, { method: 'POST', headers, body: JSON.stringify({ content: welcome_message }) });
        }
      } catch { /* DM failed silently */ }
    }

    await sr.entities.Notification.create({
      merchant_id: payment.merchant_id,
      type: 'payment_confirmed',
      title: 'Community access granted',
      message: `${discordUsername} received Discord access for "${link.title}" — ₳${payment.received_amount_ada?.toFixed(2)}`,
      resource_type: 'payment',
      resource_id: payment.id,
      severity: 'info'
    });

    return Response.json({ success: true, platform: 'discord', discord_user_id: userId, role_assigned: discord_role_id });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});