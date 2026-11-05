# গুঞ্জরণ আইটি টিম · Gunjoron IT Team

আমরা আইডিয়াকে কোডে রূপ দিই। — ওয়েবসাইট, মোবাইল অ্যাপ ও UI/UX ডিজাইন টিমের পোর্টফোলিও ওয়েবসাইট।

Pure HTML + CSS + JavaScript — কোনো framework বা build step লাগে না।

## ফোল্ডার স্ট্রাকচার

```
.
├── index.html              # ওয়েবসাইট (রিপোর রুটে)
├── admin/                  # অ্যাডমিন প্যানেল (index.html, admin.css, js/)
├── supabase/               # 01-schema, 02-make-admin, 03-cms-upgrade SQL
├── robots.txt
├── .nojekyll               # GitHub Pages-এ Jekyll বন্ধ রাখে
├── assets/
│   └── favicon.svg
├── fonts/                  # Self-hosted woff2 (Google Fonts লাগে না)
├── css/
│   ├── fonts.css           # @font-face
│   ├── base/               # variables, reset
│   ├── layout/             # background, preloader, cursor, nav, sections, footer
│   ├── sections/           # hero, about, services, stack, projects, process,
│   │                       # team, stats, terminal, faq, contact
│   ├── components/         # modal, palette, mobile-menu, back-to-top
│   ├── responsive.css
│   └── effects/            # animations, polish, responsive-fixes
└── js/
    ├── core/               # utils.js, data.js (কনটেন্ট এখানে বদলান)
    ├── modules/            # preloader, typewriter, particles, nav, render,
    │                       # projects, effects, terminal, form, palette, ...
    └── main.js
```

> **গুরুত্বপূর্ণ:** CSS ও JS ফাইলের লোডিং ক্রম `index.html`-এ নির্ধারিত। CSS-এর ক্রম বদলালে স্টাইল ওভাররাইড বদলে যেতে পারে; JS ফাইলগুলো একই global scope শেয়ার করে, তাই ক্রম ঠিক রাখুন।

## কনটেন্ট বদলানো

সবকিছু **অ্যাডমিন প্যানেল** (`/admin/`) থেকে বদলানো যায়: লেখা, ডিজাইন/রঙ, অ্যানিমেশন, প্রজেক্ট (একাধিক ছবিসহ), টিম (ছবিসহ), FAQ, টেক স্ট্যাক। সেটআপের জন্য `SETUP-SUPABASE.md` দেখুন।

`js/core/data.js` শুধু ডিফল্ট/ব্যাকআপ কনটেন্ট — Supabase না পেলে এটি দেখানো হয়।
সাইটের প্রতিটি লেখায় `data-t="..."` অ্যাট্রিবিউট আছে; অ্যাডমিন এগুলো পড়েই এডিটর বানায়। নতুন লেখা যোগ করলে `data-t="section.N"` দিয়ে দিন।
নতুন ডিজাইন/অ্যানিমেশন অপশন যোগ করতে `js/core/site-schema.js`-এ লাইন যোগ করুন।

## লোকাল রান

```bash
python3 -m http.server 8000
# অথবা: npx serve .
```
তারপর `http://localhost:8000` খুলুন।

## GitHub Pages-এ পাবলিশ

1. রিপোতে সব ফাইল push করুন (`index.html` রুটে)।
2. **Settings → Pages → Build and deployment**
3. Source: **Deploy from a branch** → Branch: `main` / `(root)` → Save।
4. কিছুক্ষণ পর `https://<username>.github.io/<repo>/` এ সাইট লাইভ হবে।

সব পাথ relative, তাই repo sub-path বা কাস্টম ডোমেইন — দুটোতেই কাজ করে।

© 2026 Gunjoron IT Team
