export const shouldKeepLS = key => (
  !key.startsWith('cache/') &&
  !key.startsWith('statsig.') &&
  !key.startsWith('conversation-history') &&
  !key.startsWith('debug')
);

export const shouldKeepCookie = c => (
  !c.httpOnly &&                      // cannot set from content script anyway
  c.name !== '_cf_bm' &&              // Cloudflare anti-bot
  c.name !== '_cfuvid'
);
