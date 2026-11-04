# গুঞ্জরণ আইটি টিম · Gunjoron IT Team

আমরা আইডিয়াকে কোডে রূপ দিই। — ওয়েবসাইট, মোবাইল অ্যাপ ও UI/UX ডিজাইন টিমের পোর্টফোলিও ওয়েবসাইট।

Pure HTML + CSS + JavaScript — কোনো framework বা build step লাগে না।

## ফোল্ডার স্ট্রাকচার

```
.
├── index.html              # একমাত্র HTML (রিপোর রুটে)
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

প্রজেক্ট, টিম সদস্য, FAQ ও টেক স্ট্যাক — সব `js/core/data.js` ফাইলে।

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
