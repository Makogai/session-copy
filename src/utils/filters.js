/**
 * Two capture modes:
 * - Login transfer (default): allowlist-style — only keys/cookies that plausibly carry auth/session.
 * - Full sync: denylist-only — larger payloads, closer to “copy everything that isn’t obviously junk”.
 */

/** Max value size in full-sync mode per storage entry. */
export const MAX_STORAGE_VALUE_CHARS = 200_000;

/** Max value size in login-transfer mode (JWT stacks can be large). */
export const MAX_LOGIN_STORAGE_VALUE_CHARS = 120_000;

// ─── Full-sync: deny noisy keys (keep most else) ───────────────────────────

const LS_DENY_PREFIXES = [
  'cache/',
  'statsig.',
  'conversation-history',
  'debug',
  'loglevel:',
  'webpack',
  'hot',
  'workbox-',
  'firebase:',
  'firebaseui::',
  'google_pub_',
  'topicsLastReferenceTime',
  'theme:',
  'sidebar:',
  'telemetry',
  'sentry.',
  '__$__',
  'persist:',
  'redux.',
  'queryClient',
  'tanstack',
  'i18next',
  'AAT:',
  'AMP_',
  'amplitude',
  'segment.',
  'analytics',
  'intercom-',
  'li_',
  'visitor',
  'visitorId',
  'ph_phc_',
  'hb_',
  'localforage/',
  'idb://',
  'logrocket',
  'datadog',
  'fullstory',
  'heap.',
  'mixpanel',
  'gtm.',
  'ga_',
  '_gcl',
  'browser.tabs'
];

const LS_DENY_SUBSTRINGS = [
  'experiment',
  'feature-flag',
  'feature_flag',
  'flagsmith',
  'launchdarkly',
  'unleash',
  'growthbook'
];

const COOKIE_DENY_NAMES = new Set([
  '_cf_bm',
  '_cfuvid',
  '__cf_bm',
  'cf_clearance'
]);

const COOKIE_DENY_PREFIXES = [
  '_cf',
  'ajs_',
  'mp_',
  'intercom',
  '__stripe_mid',
  'amplitude',
  'analytics',
  '_ga',
  '_gid',
  '_gat',
  '__hssc',
  '__hssrc',
  '__hstc',
  '_fbp',
  '_fbc',
  'hubspotutk',
  '__zlcmid',
  'ph_'
];

/**
 * @param {string} key
 * @param {string} value
 * @param {'local'|'session'} kind
 */
export function shouldKeepStorageFull(key, value, kind) {
  if (!key || typeof value !== 'string') return false;
  if (value.length > MAX_STORAGE_VALUE_CHARS) return false;

  const prefixes = kind === 'session' ? LS_DENY_PREFIXES : LS_DENY_PREFIXES;
  const lower = key.toLowerCase();
  for (const p of prefixes) {
    if (lower.startsWith(p.toLowerCase())) return false;
  }
  for (const s of LS_DENY_SUBSTRINGS) {
    if (lower.includes(s)) return false;
  }
  return true;
}

/**
 * @param {chrome.cookies.Cookie} c
 * @param {{ strict?: boolean }} [opts]
 */
export function shouldKeepCookieFull(c, opts = {}) {
  const name = c.name || '';
  if (COOKIE_DENY_NAMES.has(name)) return false;

  for (const p of COOKIE_DENY_PREFIXES) {
    if (name.startsWith(p)) return false;
  }

  if (opts.strict) {
    if (name.startsWith('_hj')) return false;
    if (name.startsWith('rl_')) return false;
  }

  return true;
}

// ─── Login-transfer: tight allowlist + explicit denies ──────────────────────

/** OpenAI web: only these persisted client keys are needed for auth/session restore. */
const OPENAI_LS_EXACT = new Set([
  'oai/apps/auth',
  'oai/apps/session',
  'oai/apps/user',
  'oai/apps/csrf'
]);

/** Keys that are never auth even if they match fuzzy patterns. */
const STORAGE_LOGIN_DENY_RE = [
  /conversation/i,
  /draft/i,
  /connector/i,
  /connectors\//i,
  /upload/i,
  /imagegen/i,
  /survey/i,
  /dictation/i,
  /debugsettings/i,
  /experiment/i,
  /theme/i,
  /banner/i,
  /upsell/i,
  /onboarding/i,
  /memorycitation/i,
  /gizmo/i,
  /codex/i,
  /chattheme/i,
  /recentupload/i,
  /searchsettings/i,
  /modelpicker/i,
  /messagecount/i,
  /\butm\b/i,
  /tooltip/i,
  /nux/i,
  /sidebar/i,
  /pending/i,
  /capexpires/i,
  /loggedinusermessagecount/i,
  /noauth/i,
  /lastpage/i,
  /appdirectory/i,
  /hasdismissed/i,
  /hasseen/i,
  /ownerdomain/i,
  /l\d+dk1\//i // codex onboarding noise keys like oai/apps/l1239dk1/...
];

/** Plausible auth/session storage keys (non–OpenAI-specific). */
const STORAGE_LOGIN_ALLOW_RE = [
  /^oai\/apps\/(auth|session|user|csrf)(\/|$)/,
  /next[-_]?auth/i,
  /authjs/i,
  /supabase\.auth/i,
  /firebase:(auth|authuser)/i,
  /amplify-signin/i,
  /cognito/i,
  /okta/i,
  /workos/i,
  /keycloak/i,
  /clerk\./i,
  /auth0/i,
  /passport/i,
  /(\/|^)(auth|session|oauth|openid|oidc|pkce|csrf|xsrf)(\/|\.|$)/i,
  /(access|refresh|id)[_-]?token/i,
  /jwt/i,
  /bearer/i,
  /login/i,
  /sign-?in/i,
  /credential/i,
  /identity/i,
  /^sb-[a-z0-9]+-auth-token$/i
];

/**
 * @param {string} key
 * @param {string} value
 * @param {'local'|'session'} _kind
 */
export function shouldKeepStorageLoginTransfer(key, value, _kind, host) {
  if (!key || typeof value !== 'string') return false;
  if (value.length > MAX_LOGIN_STORAGE_VALUE_CHARS) return false;

  if (OPENAI_LS_EXACT.has(key)) return true;

  if (key.startsWith('oai/apps/')) {
    for (const re of STORAGE_LOGIN_DENY_RE) {
      if (re.test(key)) return false;
    }
    for (const re of STORAGE_LOGIN_ALLOW_RE) {
      if (re.test(key)) return true;
    }
    return false;
  }

  for (const re of STORAGE_LOGIN_DENY_RE) {
    if (re.test(key)) return false;
  }
  for (const re of STORAGE_LOGIN_ALLOW_RE) {
    if (re.test(key)) return true;
  }
  return false;
}

const COOKIE_LOGIN_DENY_NAMES = new Set([
  ...COOKIE_DENY_NAMES,
  'oai-did',
  'oai-hlib',
  'oai_consent_analytics',
  'oai_consent_marketing',
  'oai_consent_personalization',
  'oai-allow-ne',
  'oai-last-model-config',
  'oai-nav-state',
  'oai-chat-web-route',
  '__cflb',
  '_puid',
  '_dd_s',
  '_account_is_fedramp',
  '__stripe_mid'
]);

/** Short-lived OpenAI client cookies sometimes paired with NextAuth (keep small). */
const COOKIE_LOGIN_EXACT_ALLOW = new Set(['oai-sc', 'oai-gn']);

const COOKIE_LOGIN_DENY_PREFIXES = [
  ...COOKIE_DENY_PREFIXES,
  'oai_consent',
  'conv_key_',
  '_dd',
  '__hstc',
  'hubspot'
];

/** Prefixes that strongly suggest session / CSRF (first-party). */
const COOKIE_LOGIN_ALLOW_PREFIXES = ['__Host-', '__Secure-'];

const COOKIE_LOGIN_ALLOW_SUBSTRINGS = [
  'csrf',
  'xsrf',
  'oauth',
  'openid',
  'supabase',
  'workos',
  'okta',
  'keycloak',
  'clerk',
  'auth0',
  'firebase',
  'refresh_token',
  'access_token',
  'id_token'
];

/** Names that look like session identifiers without needing the word “session” alone. */
const COOKIE_LOGIN_ALLOW_NAME_RES = [
  /next[-_]?auth/i,
  /session([._-](token|id|key))?$/i,
  /_session$/i,
  /^PHPSESSID$/i,
  /^JSESSIONID$/i,
  /^connect\.sid$/i,
  /\bsess(ion)?id\b/i,
  /\bsid\b/i
];

/**
 * @param {chrome.cookies.Cookie} c
 * @param {{ strict?: boolean }} [_opts] unused in login mode (kept for API compatibility)
 */
export function shouldKeepCookieLoginTransfer(c, _opts = {}) {
  const name = c.name || '';

  if (COOKIE_LOGIN_DENY_NAMES.has(name)) return false;
  for (const p of COOKIE_LOGIN_DENY_PREFIXES) {
    if (name.startsWith(p)) return false;
  }

  for (const p of COOKIE_LOGIN_ALLOW_PREFIXES) {
    if (name.startsWith(p)) return true;
  }

  if (name === 'oai-client-auth-info') return true;
  if (COOKIE_LOGIN_EXACT_ALLOW.has(name)) return true;

  const lower = name.toLowerCase();
  for (const s of COOKIE_LOGIN_ALLOW_SUBSTRINGS) {
    if (lower.includes(s)) return true;
  }
  for (const re of COOKIE_LOGIN_ALLOW_NAME_RES) {
    if (re.test(name)) return true;
  }
  return false;
}

// ─── Dispatch (used by capture) ─────────────────────────────────────────────

/**
 * @param {string} key
 * @param {string} value
 * @param {'local'|'session'} kind
 * @param {{ loginOnlyMode?: boolean }} opts
 */
export function shouldKeepStorageEntry(key, value, kind, opts = {}) {
  const login = opts.loginOnlyMode !== false;
  if (login) return shouldKeepStorageLoginTransfer(key, value, kind, opts.host);
  return shouldKeepStorageFull(key, value, kind);
}

/**
 * @param {chrome.cookies.Cookie} c
 * @param {{ strict?: boolean; loginOnlyMode?: boolean }} [opts]
 */
export function shouldKeepCookie(c, opts = {}) {
  const login = opts.loginOnlyMode !== false;
  if (login) return shouldKeepCookieLoginTransfer(c, opts);
  return shouldKeepCookieFull(c, opts);
}
