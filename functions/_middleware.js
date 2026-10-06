/*
 * Cloudflare Pages Function: browser-native sign-in (HTTP Basic auth) for every page.
 * Set BASIC_USER and BASIC_PASS in Cloudflare → Pages project → Settings → Variables and Secrets.
 * Credentials never live in the repo. If they aren't set, the site stays locked.
 */
export async function onRequest({ request, env, next }) {
  const user = env.BASIC_USER;
  const pass = env.BASIC_PASS;
  const header = request.headers.get('Authorization') || '';
  if (user && pass && header.startsWith('Basic ')) {
    let decoded = '';
    try {
      decoded = atob(header.slice(6));
    } catch {
      decoded = '';
    }
    const i = decoded.indexOf(':');
    if (i > -1 && decoded.slice(0, i) === user && decoded.slice(i + 1) === pass) {
      const res = await next();
      const out = new Response(res.body, res);
      out.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return out;
    }
  }
  return new Response('Sign in required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Booking prototype", charset="UTF-8"',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
