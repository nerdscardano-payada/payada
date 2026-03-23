const WORDLIST_URL = 'https://raw.githubusercontent.com/bitcoin/bips/master/bip-0039/english.txt';

Deno.serve(async (req) => {
  try {
    const { prefix = '' } = await req.json();
    const normalized = String(prefix).trim().toLowerCase();

    if (!normalized) {
      return Response.json({ words: [] });
    }

    const response = await fetch(WORDLIST_URL);
    const text = await response.text();
    const words = text
      .split('\n')
      .map((word) => word.trim())
      .filter(Boolean)
      .filter((word) => word.startsWith(normalized))
      .slice(0, 8);

    return Response.json({ words });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});