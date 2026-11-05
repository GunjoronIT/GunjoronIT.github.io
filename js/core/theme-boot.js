/* ==========================================================
   থিম বুট — <head>-এ সিঙ্ক্রোনাসলি চলে, তাই ফ্ল্যাশ হয় না।
   সর্বশেষ সেভ করা সেটিংস localStorage-এ জমা থাকে; cms.js নতুন সেটিংস এনে আপডেট করে।
   ডিজাইন + অ্যানিমেশন প্রয়োগের ফাংশনও এখানে।
   ========================================================== */
(function () {
  var S = window.GJ_SCHEMA, KEY = 'gj-site-settings';
  var GJ = window.GJ = { settings: { texts: {}, design: {}, anim: {}, general: {} } };

  function def(list) { var o = {}; list.forEach(function (f) { o[f.k] = f.def; }); return o; }
  GJ.anim = def(S.anim);
  GJ.A = function (k) { return GJ.anim[k]; };

  function rgb(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return null;
    var n = parseInt(m[1], 16); return (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255);
  }
  var root = document.documentElement;

  GJ.applyDesign = function (d) {
    d = d || {}; var st = root.style, v = Object.assign(def(S.design), d);
    function setc(name, key, withRgb) {
      var c = rgb(v[key]) ? v[key] : null; if (!c) return;
      st.setProperty('--' + name, c); if (withRgb) st.setProperty('--' + name + '-rgb', rgb(c));
    }
    setc('green', 'green', 1); setc('blue', 'blue', 1); setc('bg', 'bg', 1); setc('bg2', 'bg2', 1);
    setc('panel', 'panel'); setc('text', 'text'); setc('muted', 'muted');
    st.setProperty('--r', (+v.radius || 0) + 'px');
    st.setProperty('--wrap', (+v.wrap || 1200) + 'px');
    st.setProperty('--sec-pad', (+v.secpad || 120) + 'px');
    st.setProperty('--bn', v.font === 'sans'
      ? "'Space Grotesk','Noto Serif Bengali',system-ui,sans-serif"
      : "'Noto Serif Bengali',serif");
  };

  GJ.applyAnim = function (a) {
    GJ.anim = Object.assign(def(S.anim), a || {}); var A = GJ.anim, st = root.style, c = root.classList;
    var R = { up: ['0px', '40px', 1], fade: ['0px', '0px', 1], zoom: ['0px', '0px', .92], left: ['-48px', '0px', 1], right: ['48px', '0px', 1], none: ['0px', '0px', 1] }[A.reveal] || ['0px', '40px', 1];
    st.setProperty('--rv-x', R[0]); st.setProperty('--rv-y', R[1]); st.setProperty('--rv-s', R[2]);
    st.setProperty('--rv-dur', (+A.revealDur || .9) + 's');
    st.setProperty('--mq-dur', (+A.marqueeDur || 40) + 's');
    st.setProperty('--mq-dur2', Math.round((+A.marqueeDur || 40) * 1.15) + 's');
    c.toggle('a-rvnone', A.reveal === 'none');
    c.toggle('a-nofloat', !A.floats); c.toggle('a-noshimmer', !A.shimmer); c.toggle('a-nolift', !A.lift);
    c.toggle('a-nomarquee', !A.marquee); c.toggle('a-nogrid', !A.grid); c.toggle('a-nocursor', !A.cursor);
    c.toggle('a-noparticles', !A.particles); c.toggle('a-nocodebg', !A.codebg); c.toggle('a-notrail', !A.trail);
    c.toggle('a-nosparkle', !A.sparkles); c.toggle('a-nopre', !A.preloader);
  };

  GJ.applyGeneral = function (g) {
    g = g || {};
    function onReady(fn) { document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn(); }
    onReady(function () {
      if (g.title) document.title = g.title;
      var m = document.querySelector('meta[name=description]'); if (m && g.description) m.content = g.description;
      var og = document.querySelector('meta[property="og:title"]'); if (og && g.title) og.content = g.title;
      var od = document.querySelector('meta[property="og:description"]'); if (od && g.description) od.content = g.description;
      var tc = document.querySelector('meta[name=theme-color]'); if (tc && g.themeColor) tc.content = g.themeColor;
      var hidden = g.hidden || [];
      S.sections.forEach(function (s) {
        var off = hidden.indexOf(s.id) > -1, el = document.getElementById(s.id);
        if (el) el.style.display = off ? 'none' : '';
        document.querySelectorAll('a[href="#' + s.id + '"]').forEach(function (a) {
          var host = a.closest('li') || a; if (!a.classList.contains('btn') && !a.classList.contains('btn-x') && !a.classList.contains('avail')) host.style.display = off ? 'none' : '';
        });
      });
    });
  };

  GJ.applyTexts = function (t) {
    t = t || {};
    document.querySelectorAll('[data-t]').forEach(function (el) {
      var k = el.getAttribute('data-t');
      if (el.__def === undefined) el.__def = el.textContent;
      var want = Object.prototype.hasOwnProperty.call(t, k) ? t[k] : el.__def;
      if (el.textContent !== want) { el.textContent = want; }
      if (el.dataset) { delete el.dataset.txt; delete el.dataset.sc; }
    });
    document.querySelectorAll('[data-tp]').forEach(function (el) {
      var k = el.getAttribute('data-tp');
      if (el.__def === undefined) el.__def = el.getAttribute('placeholder') || '';
      el.setAttribute('placeholder', Object.prototype.hasOwnProperty.call(t, k) && t[k] !== '' ? t[k] : el.__def);
    });
  };

  /* তালিকা (টাইপরাইটার, বুট লাইন) — অন্য মডিউল এটি পড়ে */
  GJ.list = function (k) {
    var item = S.lists.filter(function (x) { return x.k === k; })[0], v = GJ.settings.texts[k];
    var arr = typeof v === 'string' ? v.split('\n').map(function (s) { return s.trim(); }).filter(Boolean) : null;
    return arr && arr.length ? arr : item.def.slice();
  };

  GJ.applyAll = function (s) {
    GJ.settings = { texts: s.texts || {}, design: s.design || {}, anim: s.anim || {}, general: s.general || {} };
    GJ.applyDesign(GJ.settings.design); GJ.applyAnim(GJ.settings.anim); GJ.applyGeneral(GJ.settings.general);
  };
  GJ.cache = function (s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} };

  var cached = null; try { cached = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  GJ.applyAll(cached || {});
})();
