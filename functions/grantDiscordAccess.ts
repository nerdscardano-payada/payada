import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { paymentId } = await req.json();

    if (!paymentId) {
      return Response.json({ error: 'Missing paymentId' }, { status: 400 });
    }

    const sr = base44.asServiceRole;

    // Get payment record
    const payments = await sr.entities.Payment.filter({ id: paymentId });
    const payment = payments[0];
    if (!payment) return Response.json({ error: 'Payment not found' }, { status: 404 });

    if (payment.status !== 'confirmed') {
      return Response.json({ error: 'Payment not confirmed yet' }, { status: 400 });
    }

    const discordUsername = payment.payer_discord_username;
    if (!discordUsername) {
      return Response.json({ skipped: true, reason: 'No Discord username on payment' });
    }

    // Find active Discord plugin for this merchant + payment link
    const plugins = await sr.entities.MerchantPlugin.filter({
      merchant_id: payment.merchant_id,
      plugin_type: 'discord_gate',
      enabled: true
    });

    const plugin = plugins.find(p =>
      !p.payment_link_ids?.length || p.payment_link_ids.includes(payment.payment_link_id)
    );

    if (!plugin) {
      return Response.json({ skipped: true, reason: 'No active Discord plugin for this merchant/link' });
    }

    const { guild_id, role_id, bot_token, welcome_message } = plugin;
    const DISCORD_API = 'https://discord.com/api/v10';
    const headers = {
      'Authorization': `Bot ${bot_token}`,
      'Content-Type': 'application/json'
    };

    // Step 1: Look up Discord user by username
    // Discord's search endpoint: GET /guilds/{guild_id}/members/search?query={username}
    const searchRes = await fetch(
      `${DISCORD_API}/guilds/${guild_id}/members/search?query=${encodeURIComponent(discordUsername)}&limit=5`,
      { headers }
    );

    if (!searchRes.ok) {
      const err = await searchRes.text();
      return Response.json({ error: `Discord search failed: ${err}` }, { status: 500 });
    }

    const members = await searchRes.json();

    // Match by username (case-insensitive) or global_name
    const cleanInput = discordUsername.replace(/^@/, '').toLowerCase();
    const member = members.find(m =>
      m.user?.username?.toLowerCase() === cleanInput ||
      m.user?.global_name?.toLowerCase() === cleanInput
    );

    if (!member) {
      return Response.json({
        error: `Discord user "${discordUsername}" not found in server. Make sure they have joined the server first.`
      }, { status: 404 });
    }

    const userId = member.user.id;

    // Step 2: Assign role
    const roleRes = await fetch(
      `${DISCORD_API}/guilds/${guild_id}/members/${userId}/roles/${role_id}`,
      { method: 'PUT', headers }
    );

    if (!roleRes.ok && roleRes.status !== 204) {
      const err = await roleRes.text();
      return Response.json({ error: `Failed to assign role: ${err}` }, { status: 500 });
    }

    // Step 3: Send welcome DM if configured
    if (welcome_message) {
      try {
        const dmRes = await fetch(`${DISCORD_API}/users/@me/channels`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ recipient_id: userId })
        });
        if (dmRes.ok) {
          const dmChannel = await dmRes.json();
          await fetch(`${DISCORD_API}/channels/${dmChannel.id}/messages`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ content: welcome_message })
          });
        }
      } catch {
        // DM failed silently — role was still granted
      }
    }

    // Log to notification
    const amountLabel = payment.payment_type === 'cnt'
      ? `${Number(payment.merchant_amount_cnt ?? payment.received_amount_cnt ?? payment.expected_amount_cnt ?? 0).toLocaleString()} ${payment.cnt_ticker || 'CNT'}`
      : `₳ ${Number(payment.received_amount_ada || 0).toFixed(2)}`;

    await sr.entities.Notification.create({
      merchant_id: payment.merchant_id,
      type: 'payment_confirmed',
      title: 'Discord access granted',
      message: `${discordUsername} received Discord role after payment of ${amountLabel}`,
      resource_type: 'payment',
      resource_id: paymentId,
      severity: 'info'
    });

    return Response.json({
      success: true,
      discord_user_id: userId,
      username: member.user.username,
      role_assigned: role_id
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});