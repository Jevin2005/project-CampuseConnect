/**
 * Cookie Service
 * Ensures seamless authentication cookie delivery across both:
 * 1. Localhost development (HTTP, sameSite: 'lax', secure: false)
 * 2. Production cloud (HTTPS Vercel -> Render cross-domain, sameSite: 'none', secure: true)
 */

function getRefreshCookieOptions(req) {
  const isHttps = Boolean(
    (req && (req.secure || req.headers?.['x-forwarded-proto'] === 'https')) ||
    process.env.NODE_ENV === 'production' ||
    process.env.RENDER === 'true' ||
    (process.env.FRONTEND_URL && process.env.FRONTEND_URL.startsWith('https://'))
  );

  return {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };
}

function setRefreshCookie(res, refreshToken) {
  const options = getRefreshCookieOptions(res.req);
  res.cookie('refreshToken', refreshToken, options);
}

function clearRefreshCookie(res) {
  const options = getRefreshCookieOptions(res.req);
  const { maxAge, ...clearOptions } = options;
  res.clearCookie('refreshToken', clearOptions);
}

module.exports = {
  getRefreshCookieOptions,
  setRefreshCookie,
  clearRefreshCookie,
};
