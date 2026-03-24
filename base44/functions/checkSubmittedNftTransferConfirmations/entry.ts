import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const BLOCKFROST_API_KEY = Deno.env.get('BLOCKFROST_API_KEY');
const BLOCKFROST_URL = 'https://cardano-mainnet.blockfrost.io/api/v0';
const DEFAULT_CONFIRMATIONS_REQUIRED = 2;
const MAX_LOGS_PER_RUN = 100;

async function getLatestBlockHeight() {
  const response = await fetch(`${BLOCKFROST_URL}/blocks/latest`, {
    headers: { project_id: BLOCKFROST_API_KEY },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch latest block height: ${response.status}`);
  }

  const data = await response.json();
  return data.height;
}

async function getTransaction(txHash) {
  const response = await fetch(`${BLOCKFROST_URL}/txs/${txHash}`, {
    headers: { project_id: BLOCKFROST_API_KEY },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch transaction ${txHash}: ${response.status}`);
  }

  return await response.json();
}

async function processSubmittedTransfers(base44, confirmationsRequired) {
  const sr = base44.asServiceRole;
  const submittedLogs = await sr.entities.NftTransferLog.filter(
    { status: 'submitted' },
    '-updated_date',
    MAX_LOGS_PER_RUN
  );

  if (submittedLogs.length === 0) {
    return {
      latestBlockHeight: null,
      checkedCount: 0,
      confirmedCount: 0,
      pendingCount: 0,
      skippedCount: 0,
      confirmedLogIds: [],
    };
  }

  const latestBlockHeight = await getLatestBlockHeight();
  let confirmedCount = 0;
  let pendingCount = 0;
  let skippedCount = 0;
  const confirmedLogIds = [];

  for (const log of submittedLogs) {
    if (!log.tx_hash) {
      skippedCount += 1;
      continue;
    }

    const tx = await getTransaction(log.tx_hash);
    if (!tx?.block_height) {
      pendingCount += 1;
      continue;
    }

    const confirmations = latestBlockHeight - tx.block_height;
    if (confirmations >= confirmationsRequired) {
      await sr.entities.NftTransferLog.update(log.id, {
        status: 'confirmed',
        completed_at: new Date().toISOString(),
        error_message: null,
      });
      confirmedCount += 1;
      confirmedLogIds.push(log.id);
      continue;
    }

    pendingCount += 1;
  }

  return {
    latestBlockHeight,
    checkedCount: submittedLogs.length,
    confirmedCount,
    pendingCount,
    skippedCount,
    confirmedLogIds,
  };
}

Deno.serve(async (req) => {
  try {
    if (!BLOCKFROST_API_KEY) {
      return Response.json({ error: 'Missing BLOCKFROST_API_KEY' }, { status: 500 });
    }

    const base44 = createClientFromRequest(req);
    const isAuthenticated = await base44.auth.isAuthenticated();

    if (isAuthenticated) {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    }

    const body = await req.json().catch(() => ({}));
    const confirmationsRequired = Number(body?.confirmationsRequired ?? DEFAULT_CONFIRMATIONS_REQUIRED);

    if (!Number.isFinite(confirmationsRequired) || confirmationsRequired < 0) {
      return Response.json({ error: 'Invalid confirmationsRequired value' }, { status: 400 });
    }

    const result = await processSubmittedTransfers(base44, confirmationsRequired);
    return Response.json({ success: true, confirmationsRequired, ...result });
  } catch (error) {
    console.error('NFT transfer confirmation check failed:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});