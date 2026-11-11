CampusMate BD — Direct Download (লিংক লুকানো ভার্সন) — v1
============================================================

এই ফোল্ডারে তোমার পাঠানো campusmatebd-main ZIP-এর সব ফাইল আছে,
শুধু ৩টা জিনিস বদলেছে:
  1. index.html — Uptodown বাটন এখন Direct Download বাটন (কোনো href নেই)
  2. api/download.js — নতুন, সার্ভার-সাইড প্রক্সি
  3. vercel.json — নতুন, ফাংশনের সময়সীমা

কীভাবে কাজ করে
-------------
- বাটনে কোনো লিংক নেই — <button>, <a href> না। Hover করলে নিচে
  কোনো URL দেখাবে না, View Source-এও কোনো ফাইল লিংক নেই।
- ক্লিক করলে পেজেই একটা পপআপ আসে ("Downloading…"), আর লুকানো
  iframe /api/download কল করে। ব্রাউজার তার নিজের ডাউনলোড
  পপআপ দেখায়, ইউজার একই পেজেই থাকে।
- আসল ফাইল ঠিকানা শুধু Vercel Dashboard-এ Environment Variable
  APK_URL-এ থাকে। /api/download সেটা পড়ে ফাইলটা stream করে দেয়।
  GitHub / Blob-এর ঠিকানা কোথাও — index.html, JSON, vercel.json —
  লেখা নেই। JSON ফাইলে লিংক রাখলে লুকাতো না, কারণ JSON ফাইলও
  পাবলিক — যে কেউ খুলে দেখতে পারতো। তাই JSON ব্যবহার করা হয়নি।

সেটআপ — ক্রমানুসারে
-------------------
১. APK হোস্ট করো (যেকোনো একটা):
   ক) GitHub Release: রিপোতে Releases > Draft a new release >
      Tag v1.1.24+25 > সাইন করা Release APK আপলোড করো >
      Release-এর ফাইল ঠিকানা কপি করো।
   খ) Vercel Blob (আরও ভালো): Vercel Dashboard > Storage >
      Create Blob Store > APK আপলোড করো > ফাইল ঠিকানা কপি করো।
      Blob একই Vercel নেটওয়ার্কে থাকে, তাই দ্রুত ও নির্ভরযোগ্য।
২. Vercel Dashboard > তোমার প্রজেক্ট > Settings >
   Environment Variables > Add New:
   Key: APK_URL
   Value: ধাপ ১-এর ফাইল ঠিকানাটা (এটা চ্যাটে / GitHub-এ দিও না)
   Environment: Production (আর Preview-ও চাইলে)
   Save করো।
৩. এই ফোল্ডারের সব ফাইল GitHub রিপো iatz100/campusmatebd-তে
   আপলোড করো (index.html বদলে দাও, api/ আর vercel.json নতুন)।
   Vercel নিজে থেকে redeploy করবে। APK_URL সেট করার পর
   Redeploy না করলে ফাংশন নতুন variable পাবে না — প্রয়োজনে
   Vercel Dashboard > Deployments > … > Redeploy চাপো।
৪. টেস্ট করো (ফোনে Chrome দিয়ে):
   - সাইট খোলো, বাটনে hover / long-press করো — কোনো লিংক
     দেখাবে না।
   - বাটন চাপো — ব্রাউজারের ডাউনলোড পপআপ আসবে, পেজ বদলাবে না,
     "Downloading…" পপআপও দেখাবে।
   - ডাউনলোড শেষে ফোনের নোটিফিকেশনে "Download complete" চাপো
     > Install চাপো। প্রয়োজনে Chrome-কে "Install unknown apps"
     অনুমতি দিতে হবে।

সত্যি কথাটা — Install পপআপ নিয়ে
--------------------------------
ওয়েবসাইট থেকে সরাসরি Install পপআপ জোর করে আনা যায় না।
Android নিরাপত্তার জন্য ওয়েব পেজকে installer চালাতে দেয় না।
ডাউনলোড শেষে Android নিজে "Download complete" নোটিফিকেশন
দেখায় — ওটাতে চাপলেই Install পপআপ আসে। পেজ শুধু ওই
নির্দেশনাটা পপআপে দেখাতে পারে, installer নিজে খুলতে পারে না।
Play Store / Uptodown অ্যাপ দিয়েই শুধু এক-চাপে Install হয়।

আর লিংক লুকানো নিয়ে সত্যি কথাটা
-------------------------------
সাধারণ ইউজারের চোখে (hover, View Source, right-click) লিংক
একদম দেখা যাবে না — এটাই এই সিস্টেমের কাজ। কিন্তু ১০০% লুকানো
অসম্ভব: DevTools-এর Network ট্যাবে /api/download দেখা যাবে,
আর যে APK ডাউনলোড করবে তার কাছে ফাইলটাই থাকবে — সে চাইলে
সেটা আবার আপলোড করতে পারবে। তাই লিংক লুকানো মানে "চোখে না
পড়া", নিরাপত্তা না।

ভার্সন / সাইজ
------------
Version / Size আপডেট করা হয়েছে (2026-11-11): Version 1.1.24,
App File Size 42.96 MB — Ratul-এর দেওয়া আসল APK অনুযায়ী।

সমস্যা হলে যা পাঠাবে
------------------
- /api/download খুললে কী দেখায় (503 মানে APK_URL সেট হয়নি,
  502 মানে ফাইল ঠিকানা ভুল / ফাইল নেই)
- Vercel Deployments-এ Deploy সফল হয়েছে কি না

SEO v3 (2026-11-11): Title 58 অক্ষরে ফেরানো হয়েছে (SEO v1-এর মতো), keywords meta, OG image type, JSON-LD-তে softwareVersion 1.1.24 যোগ করা হয়েছে; sitemap lastmod 2026-11-11। Favicon ফাইলগুলো (favicon.ico / 16 / 32 / apple-touch-icon) ZIP-এই আছে — শুধু index.html আপলোড করলে favicon দেখাবে না, সব ফাইল আপলোড করতে হবে।
