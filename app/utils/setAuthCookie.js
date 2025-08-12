// utils/setAuthCookie.js
function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('token', token, {
    httpOnly: true,
    secure: true, // Must be true with SameSite=None in prod
    sameSite: 'none', // Allow cross-site cookies
    maxAge: 60 * 60 * 1000, // 1 hour
  });
}

module.exports = { setAuthCookie };