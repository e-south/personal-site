import { parseArgs } from 'node:util';

import { loadCliEnv, parsePositiveInt, requireEnv, requireUrl } from './env';

type StatsArgs = {
  'campaign-id'?: string;
  from?: string;
  to?: string;
};

const args = parseArgs({
  options: {
    'campaign-id': { type: 'string' },
    from: { type: 'string' },
    to: { type: 'string' },
  },
});

const values = args.values as StatsArgs;
loadCliEnv();

const campaignIdRaw = values['campaign-id'];
if (!campaignIdRaw) {
  console.error('Provide --campaign-id <id>.');
  process.exit(1);
}
const campaignId = String(parsePositiveInt(campaignIdRaw, '--campaign-id'));
const baseUrl = requireUrl('LISTMONK_URL');
const apiUser = requireEnv('LISTMONK_API_USER');
const apiToken = requireEnv('LISTMONK_API_TOKEN');
const authHeader =
  'Basic ' + Buffer.from(`${apiUser}:${apiToken}`).toString('base64');

const endpoint =
  values.from || values.to
    ? `${baseUrl}/api/analytics/campaigns/${campaignId}`
    : `${baseUrl}/api/campaigns/${campaignId}/stats`;

const url = new URL(endpoint);
if (values.from) url.searchParams.set('from', values.from);
if (values.to) url.searchParams.set('to', values.to);

const fetchJson = async (input: string) => {
  const response = await fetch(input, {
    headers: { Authorization: authHeader },
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Request failed (${response.status}): ${message || response.statusText}`,
    );
  }
  return response.json();
};

const summarize = (payload: Record<string, unknown>) => {
  const stats = (payload.data ?? payload) as Record<string, unknown>;
  const summary = {
    sent:
      stats.sent ?? stats.sent_count ?? stats.total_sent ?? stats.total ?? null,
    views: stats.views ?? stats.views_count ?? stats.total_views ?? null,
    clicks: stats.clicks ?? stats.clicks_count ?? stats.total_clicks ?? null,
    bounces: stats.bounces ?? stats.bounce_count ?? stats.total_bounces ?? null,
    links: stats.links ?? stats.link_stats ?? stats.link_clicks ?? null,
  };

  console.log(JSON.stringify(summary, null, 2));
};

fetchJson(url.toString())
  .then((payload) => summarize(payload))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
