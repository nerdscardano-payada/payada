Deno.serve(async (req) => {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return Response.json({ error: "RESEND_API_KEY is not configured" }, { status: 500 });
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "PayADA Contact <onboarding@resend.dev>",
        to: ["support@payada.io"],
        reply_to: email,
        subject: `[Contact] ${subject} — from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`
      })
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      return Response.json({ error: resendData.message || "Failed to send email" }, { status: 500 });
    }

    return Response.json({ success: true, id: resendData.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});