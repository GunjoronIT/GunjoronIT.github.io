/* ==========================================================
   Supabase ক্লায়েন্ট (লাইব্রেরি ছাড়া, সরাসরি fetch)
   এই key টি "publishable" key — ব্রাউজারে থাকা নিরাপদ।
   আসল নিরাপত্তা দেয় ডাটাবেজের RLS policy (supabase/01-schema.sql)।
   ⚠ কখনো "secret" key বা "service_role" key এখানে বসাবেন না।
   ========================================================== */
const SUPABASE_URL = 'https://nunbnzvjffdqofmuecal.supabase.co';
const SUPABASE_KEY = 'sb_publishable_8YOx8hliB8femYfILsIVAw_7ec2PRxi';

const sb = (() => {
  const SKEY = 'gj-admin-session';
  let session = null;
  try { session = JSON.parse(localStorage.getItem(SKEY) || 'null'); } catch (e) {}

  const save = s => {
    session = s;
    try { s ? localStorage.setItem(SKEY, JSON.stringify(s)) : localStorage.removeItem(SKEY); } catch (e) {}
  };
  const baseHeaders = () => ({
    apikey: SUPABASE_KEY,
    Authorization: 'Bearer ' + (session && session.access_token ? session.access_token : SUPABASE_KEY)
  });

  async function parse(res) {
    const txt = await res.text();
    let data = null;
    try { data = txt ? JSON.parse(txt) : null; } catch (e) { data = txt; }
    if (!res.ok) {
      const err = new Error((data && (data.message || data.msg || data.error_description || data.error)) || res.statusText);
      err.status = res.status; err.code = data && data.code; err.data = data;
      throw err;
    }
    return data;
  }

  async function ensureFresh() {
    if (!session) return;
    const exp = session.expires_at || 0;
    if (exp - Math.floor(Date.now() / 1000) > 60) return;
    try { await refresh(); } catch (e) { save(null); }
  }
  async function refresh() {
    const r = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=refresh_token', {
      method: 'POST', headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: session.refresh_token })
    });
    const d = await parse(r); save(d); return d;
  }

  return {
    get session() { return session; },
    get user() { return session && session.user; },

    /* ---- Auth ---- */
    async signIn(email, password) {
      const r = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
        method: 'POST', headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const d = await parse(r); save(d); return d;
    },
    signOut() { save(null); },

    /* ---- Database (PostgREST) ----
       qs উদাহরণ: 'select=*&order=sort_order.asc' */
    async select(table, qs = 'select=*') {
      await ensureFresh();
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`, { headers: baseHeaders() });
      return parse(r);
    },
    async insert(table, row) {
      await ensureFresh();
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST', headers: { ...baseHeaders(), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify(row)
      });
      return parse(r);
    },
    async update(table, match, patch) {
      await ensureFresh();
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${match}`, {
        method: 'PATCH', headers: { ...baseHeaders(), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify(patch)
      });
      return parse(r);
    },
    async remove(table, match) {
      await ensureFresh();
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${match}`, { method: 'DELETE', headers: baseHeaders() });
      return parse(r);
    },

    async rpc(fn, args = {}) {
      await ensureFresh();
      const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
        method: 'POST', headers: { ...baseHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(args)
      });
      return parse(r);
    },

    /* ---- Storage ---- */
    async upload(bucket, path, file) {
      await ensureFresh();
      const r = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
        method: 'POST',
        headers: { ...baseHeaders(), 'Content-Type': file.type || 'application/octet-stream', 'x-upsert': 'true', 'cache-control': 'max-age=31536000' },
        body: file
      });
      await parse(r);
      return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
    }
  };
})();
