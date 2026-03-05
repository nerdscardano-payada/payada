import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { guild_id, bot_token } = await req.json();

        if (!guild_id || !bot_token) {
            return Response.json({ success: false, message: 'Missing guild_id or bot_token.' }, { status: 400 });
        }

        const res = await fetch(`https://discord.com/api/v10/guilds/${guild_id}`, {
            headers: { Authorization: `Bot ${bot_token}` }
        });

        if (res.ok) {
            const guild = await res.json();
            return Response.json({ success: true, message: `Connected to server: "${guild.name}" with ${guild.member_count || '?'} members.` });
        } else if (res.status === 401) {
            return Response.json({ success: false, message: 'Invalid bot token. Please double-check it in the Discord Developer Portal.' });
        } else if (res.status === 403) {
            return Response.json({ success: false, message: "Bot doesn't have access to this server. Make sure the bot is added to your server." });
        } else if (res.status === 404) {
            return Response.json({ success: false, message: 'Server not found. Check the Guild ID and make sure the bot is in the server.' });
        } else {
            const body = await res.text();
            return Response.json({ success: false, message: `Discord error (${res.status}): ${body}` });
        }
    } catch (error) {
        return Response.json({ success: false, message: `Server error: ${error.message}` }, { status: 500 });
    }
});