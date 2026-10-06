/*
 * Simple sign-in screen for the GitHub Pages prototype. Keeps casual visitors out; it is NOT
 * real security (GitHub Pages can't do server-side auth, so the page is still downloadable).
 * Set the username/password with set-password.sh, which stores only a SHA-256 hash here.
 */
(function () {
  const GATE_HASH = '69b879b8e9d2fa3c6cbd13a79c7f1dd3447d93b9f84f60b8d85e1c7a80829633';
  const KEY = 'jh-booking-proto-ok';
  let ok = false;
  try {
    ok = GATE_HASH !== '' && sessionStorage.getItem(KEY) === GATE_HASH;
  } catch (e) {
    /* storage blocked — ask every time */
  }
  if (ok) return;

  const hide = document.createElement('style');
  hide.textContent = 'body{display:none!important}';
  document.documentElement.appendChild(hide);

  async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  function mount() {
    const wrap = document.createElement('div');
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-label', 'Sign in');
    wrap.style.cssText =
      'position:fixed;inset:0;display:grid;place-items:center;background:#f4f5f6;font-family:Figtree,Helvetica,Arial,sans-serif;color:#2a2a2a;z-index:2147483647';
    wrap.innerHTML = `
      <form style="width:320px;max-width:calc(100vw - 32px);background:#fff;border:1px solid #e7e7e7;border-radius:12px;padding:24px;box-shadow:0 12px 40px rgba(16,24,40,.12)">
        <h1 style="margin:0 0 4px;font-size:18px;font-weight:600">Booking prototype</h1>
        <p style="margin:0 0 16px;font-size:13px;color:#5f5f5f">Sign in to view.</p>
        <label style="display:block;font-size:13px;font-weight:600;margin:0 0 4px" for="g-u">Username</label>
        <input id="g-u" autocomplete="username" style="width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid #747474;border-radius:4px;font:inherit;margin:0 0 12px">
        <label style="display:block;font-size:13px;font-weight:600;margin:0 0 4px" for="g-p">Password</label>
        <input id="g-p" type="password" autocomplete="current-password" style="width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid #747474;border-radius:4px;font:inherit;margin:0 0 8px">
        <p id="g-e" role="alert" style="min-height:18px;margin:0 0 8px;font-size:13px;color:#c11a0e"></p>
        <button style="width:100%;padding:9px;border:none;border-radius:4px;background:#085ce5;color:#fff;font:inherit;font-weight:600;cursor:pointer">Sign in</button>
      </form>`;
    document.documentElement.appendChild(wrap);
    const err = wrap.querySelector('#g-e');
    wrap.querySelector('#g-u').focus();
    wrap.querySelector('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!GATE_HASH) {
        err.textContent = 'Sign-in is not set up yet.';
        return;
      }
      const u = wrap.querySelector('#g-u').value.trim();
      const p = wrap.querySelector('#g-p').value;
      if ((await sha256(`${u}:${p}`)) !== GATE_HASH) {
        err.textContent = 'Wrong username or password.';
        return;
      }
      try {
        sessionStorage.setItem(KEY, GATE_HASH);
      } catch (e2) {
        /* fine — signed in for this page view only */
      }
      wrap.remove();
      hide.remove();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
