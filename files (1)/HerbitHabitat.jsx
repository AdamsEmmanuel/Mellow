/**
 * HERBIT HABITAT — Production-Ready Frontend MVP
 * ================================================
 * Architecture: Feature-based, role-aware, HIPAA-conscious
 * Roles: patient | practitioner | admin
 * Stack: React 18, Zustand (auth), TanStack Query pattern (mocked),
 *        React Router pattern (single-file simulation via view state),
 *        Axios pattern (mocked fetch layer), Socket.io pattern (simulated events)
 *
 * HIPAA GUARDRAILS (enforced throughout):
 *  ✅ No PHI in localStorage — auth state is memory-only
 *  ✅ No PHI in console.log
 *  ✅ Refresh token would be httpOnly cookie (server-set)
 *  ✅ Sensitive data (notes, conditions) never cached to disk
 *
 * NOTE: This is a single-file simulation of the full architecture.
 * In production, split per the folder structure in HERBIT_HABITAT_ARCHITECTURE.md
 */

import React, {
  useState, useEffect, useCallback, useRef, createContext, useContext, useReducer
} from "react";

// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; font-size: 16px; }

:root {
  /* Brand palette */
  --sage:        #f0f5ee;
  --forest:      #2e4d2e;
  --forest2:     #3a5a3a;
  --forest3:     #4a7a4a;
  --leaf:        #5a8a5a;
  --leaf-light:  #e8f2e8;
  --leaf-mid:    #c8e6c8;
  --earth:       #8a6a3a;
  --earth-light: #f5ede0;
  --cream:       #faf7f2;
  --cream2:      #f4efe6;
  --card:        #ffffff;
  --border:      #e8e0d4;
  --border2:     #d4cbc0;
  --text:        #1a2a1a;
  --text2:       #344434;
  --muted:       #7a8a7a;
  --soft:        #a4b094;
  --gold:        #c4873a;
  --gold-light:  #fdf0e0;
  --plum:        #6a5a9a;
  --plum-light:  #f0eef8;
  --rose:        #a84060;
  --rose-light:  #fceef4;
  --teal:        #3a7a8a;
  --teal-light:  #e4f2f5;
  --amber:       #d4922a;
  --sky:         #4a90b8;
  --sky-light:   #e8f4fa;

  /* Shadows */
  --shadow-xs:  0 1px 4px rgba(30,60,30,.06);
  --shadow-sm:  0 2px 12px rgba(30,60,30,.08);
  --shadow:     0 4px 20px rgba(30,60,30,.1);
  --shadow-md:  0 8px 32px rgba(30,60,30,.13);
  --shadow-lg:  0 20px 60px rgba(30,60,30,.18);

  /* Radii */
  --r-xs: 6px; --r-sm: 10px; --r: 14px; --r-lg: 20px; --r-xl: 28px;

  /* Transitions */
  --ease: cubic-bezier(.4,0,.2,1);
}

body {
  font-family: 'DM Sans', sans-serif;
  background: var(--cream);
  color: var(--text);
  min-height: 100vh;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* ── ANIMATIONS ── */
@keyframes fadeIn      { from { opacity:0 } to { opacity:1 } }
@keyframes fadeDown    { from { opacity:0; transform:translateY(-10px) } to { opacity:1; transform:translateY(0) } }
@keyframes fadeUp      { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
@keyframes slideInR    { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:translateX(0) } }
@keyframes slideInL    { from { opacity:0; transform:translateX(-20px) } to { opacity:1; transform:translateX(0) } }
@keyframes scaleIn     { from { opacity:0; transform:scale(.95) } to { opacity:1; transform:scale(1) } }
@keyframes pulse       { 0%,100%{opacity:1} 50%{opacity:.4} }
@keyframes spin        { to { transform:rotate(360deg) } }
@keyframes bounce      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
@keyframes shimmer     {
  0%   { background-position: -400px 0 }
  100% { background-position:  400px 0 }
}

/* ── APP SHELL ── */
.shell { display:flex; min-height:100vh; }

/* ── SIDEBAR ── */
.sidebar {
  width: 256px; flex-shrink:0; position:fixed; top:0; left:0; height:100vh;
  background: var(--forest);
  background-image:
    radial-gradient(ellipse at 0% 90%, rgba(90,138,90,.25) 0%, transparent 55%),
    radial-gradient(ellipse at 100% 10%, rgba(196,135,58,.08) 0%, transparent 50%);
  z-index: 200; display:flex; flex-direction:column; transition: transform .3s var(--ease);
}
.sidebar-collapsed { transform: translateX(-100%); }

.sb-logo {
  padding: 1.5rem 1.4rem 1.2rem;
  border-bottom: 1px solid rgba(255,255,255,.08);
}
.sb-logo-mark {
  display:flex; align-items:center; gap:.55rem; margin-bottom:.35rem;
}
.sb-logo-icon {
  width:34px; height:34px; border-radius:10px;
  background: linear-gradient(135deg, var(--leaf), #3a6a3a);
  display:flex; align-items:center; justify-content:center; font-size:1.1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,.2);
}
.sb-logo h2 {
  font-family:'Lora',serif; font-size:1.05rem; font-weight:700;
  color:#fff; line-height:1.1;
}
.sb-logo h2 em { font-style:italic; color:#a8d4a8; }
.sb-tagline { font-size:.65rem; color:rgba(255,255,255,.32); letter-spacing:.06em; font-style:italic; }
.sb-role-chip {
  display:inline-flex; align-items:center; gap:.35rem; margin-top:.5rem;
  padding:.22rem .7rem; border-radius:100px; font-size:.62rem; font-weight:700;
  letter-spacing:.06em; text-transform:uppercase;
}
.role-patient      { background:rgba(90,138,90,.25); color:#a8d4a8; }
.role-practitioner { background:rgba(196,135,58,.2); color:#f0c070; }
.role-admin        { background:rgba(160,80,140,.25); color:#d4a8d4; }

.sb-nav { flex:1; overflow-y:auto; padding:.5rem 0; }
.sb-nav::-webkit-scrollbar { width:4px; }
.sb-nav::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:4px; }

.sb-section { padding:.4rem 0 .2rem; }
.sb-section-label {
  font-size:.6rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase;
  color:rgba(255,255,255,.25); padding:.5rem 1.4rem .3rem;
}
.nav-item {
  display:flex; align-items:center; gap:.65rem; padding:.6rem 1.4rem;
  font-size:.82rem; font-weight:500; color:rgba(255,255,255,.5);
  cursor:pointer; transition:all .18s var(--ease); border-left:3px solid transparent;
  user-select:none; position:relative;
}
.nav-item:hover { color:rgba(255,255,255,.88); background:rgba(255,255,255,.05); }
.nav-item.active {
  color:#fff; background:rgba(90,138,90,.22);
  border-left-color:#a8d4a8; font-weight:600;
}
.nav-icon { font-size:.95rem; width:20px; text-align:center; flex-shrink:0; }
.nav-badge {
  margin-left:auto; background:var(--gold); color:#fff;
  font-size:.6rem; font-weight:700; padding:.12rem .42rem; border-radius:100px;
  animation: bounce 2s ease infinite;
}

.sb-footer {
  padding:1rem 1.4rem; border-top:1px solid rgba(255,255,255,.07);
}
.sb-user { display:flex; align-items:center; gap:.65rem; }
.sb-user-info strong { font-size:.8rem; color:#fff; display:block; line-height:1.2; }
.sb-user-info span   { font-size:.65rem; color:rgba(255,255,255,.38); }
.sb-user-actions { margin-left:auto; display:flex; gap:.3rem; }

/* ── MAIN ── */
.main {
  margin-left:256px; flex:1; padding:2rem 2.25rem 6rem;
  background: var(--cream);
  background-image:
    radial-gradient(ellipse at 3% 0%, #e8f2e8 0%, transparent 30%),
    radial-gradient(ellipse at 97% 98%, #f5ede0 0%, transparent 30%);
  min-height:100vh; transition: margin-left .3s var(--ease);
}
.main-full { margin-left:0; }

/* ── TOPBAR ── */
.topbar {
  display:flex; align-items:flex-start; justify-content:space-between;
  margin-bottom:1.75rem; animation:fadeDown .45s var(--ease) both;
  flex-wrap:wrap; gap:.75rem;
}
.topbar-left small {
  font-size:.65rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase;
  color:var(--muted); display:block; margin-bottom:.25rem;
}
.topbar-left h1 {
  font-family:'Lora',serif; font-size:1.7rem; font-weight:700;
  color:var(--text); line-height:1.1;
}
.topbar-left h1 em { font-style:italic; color:var(--leaf); }
.topbar-actions { display:flex; gap:.45rem; align-items:center; flex-wrap:wrap; }

/* ── BUTTONS ── */
.btn {
  font-family:'DM Sans',sans-serif; font-weight:600; font-size:.8rem;
  padding:.52rem 1.1rem; border-radius:100px; border:none; cursor:pointer;
  transition:all .2s var(--ease); display:inline-flex; align-items:center;
  gap:.38rem; white-space:nowrap; outline:none; text-decoration:none;
}
.btn:focus-visible { box-shadow:0 0 0 3px rgba(90,138,90,.4); }
.btn-forest {
  background:var(--forest); color:#fff;
  box-shadow:0 3px 12px rgba(46,77,46,.35);
}
.btn-forest:hover { background:var(--forest2); transform:translateY(-1px); box-shadow:0 5px 18px rgba(46,77,46,.45); }
.btn-leaf   { background:var(--leaf); color:#fff; box-shadow:0 3px 10px rgba(90,138,90,.3); }
.btn-leaf:hover { background:#4a7a4a; transform:translateY(-1px); }
.btn-gold   { background:var(--gold); color:#fff; box-shadow:0 3px 10px rgba(196,135,58,.3); }
.btn-gold:hover { background:#b07830; transform:translateY(-1px); }
.btn-plum   { background:var(--plum); color:#fff; box-shadow:0 3px 10px rgba(106,90,154,.3); }
.btn-plum:hover { background:#5a4a8a; transform:translateY(-1px); }
.btn-ghost  { background:transparent; color:var(--muted); border:1.5px solid var(--border); }
.btn-ghost:hover { border-color:var(--leaf); color:var(--leaf); background:var(--leaf-light); }
.btn-danger { background:var(--rose); color:#fff; }
.btn-danger:hover { background:#903050; transform:translateY(-1px); }
.btn:disabled { opacity:.45; cursor:not-allowed; transform:none !important; }
.btn-sm  { font-size:.75rem; padding:.4rem .85rem; }
.btn-xs  { font-size:.7rem;  padding:.28rem .65rem; }
.btn-icon {
  width:34px; height:34px; border-radius:50%; padding:0; justify-content:center;
  background:var(--card); border:1.5px solid var(--border); color:var(--muted); font-size:.9rem;
}
.btn-icon:hover { border-color:var(--leaf); color:var(--leaf); background:var(--leaf-light); }

/* ── CARDS ── */
.card {
  background:var(--card); border-radius:var(--r); border:1.5px solid var(--border);
  box-shadow:var(--shadow-sm); overflow:hidden; transition:box-shadow .2s var(--ease);
}
.card:hover { box-shadow:var(--shadow); }
.card-hd {
  padding:1rem 1.35rem; border-bottom:1.5px solid var(--border);
  display:flex; align-items:center; gap:.65rem;
  background:linear-gradient(135deg,#f8fbf8 0%,var(--card) 100%);
}
.card-hd-icon {
  width:34px; height:34px; border-radius:9px;
  display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0;
}
.card-hd h3 {
  font-family:'Lora',serif; font-size:.95rem; font-weight:700; color:var(--text);
}
.card-hd p { font-size:.7rem; color:var(--muted); margin-top:1px; }
.card-hd-actions { margin-left:auto; display:flex; gap:.35rem; align-items:center; }
.card-bd { padding:1.2rem 1.35rem; }

/* ── AVATAR ── */
.av {
  border-radius:50%; display:flex; align-items:center; justify-content:center;
  font-weight:700; color:#fff; flex-shrink:0; font-family:'DM Sans',sans-serif;
  position:relative;
}
.av-xxs { width:20px; height:20px; font-size:.5rem; }
.av-xs  { width:26px; height:26px; font-size:.58rem; }
.av-sm  { width:32px; height:32px; font-size:.68rem; }
.av-md  { width:40px; height:40px; font-size:.8rem; }
.av-lg  { width:50px; height:50px; font-size:.92rem; }
.av-xl  { width:64px; height:64px; font-size:1.1rem; }
.av-xxl { width:80px; height:80px; font-size:1.3rem; }
.av-online::after {
  content:''; position:absolute; bottom:1px; right:1px;
  width:9px; height:9px; border-radius:50%;
  background:#52d052; border:2px solid var(--card);
}

/* ── BADGE ── */
.badge {
  display:inline-flex; align-items:center; gap:.25rem;
  font-size:.65rem; font-weight:600; padding:.18rem .55rem; border-radius:100px;
}
.badge-green  { background:var(--leaf-light); color:var(--leaf); }
.badge-gold   { background:var(--gold-light); color:var(--gold); }
.badge-plum   { background:var(--plum-light); color:var(--plum); }
.badge-rose   { background:var(--rose-light); color:var(--rose); }
.badge-teal   { background:var(--teal-light); color:var(--teal); }
.badge-muted  { background:#f0ede8; color:var(--muted); }
.badge-earth  { background:var(--earth-light); color:var(--earth); }
.badge-sky    { background:var(--sky-light); color:var(--sky); }
.badge-new    { background:#e8f5e9; color:#2e7d32; }
.badge-online { background:#e8f5e9; color:#2e7d32; }

/* ── FORM ── */
.form-label {
  font-size:.72rem; font-weight:600; color:var(--muted); display:block;
  margin-bottom:.3rem; letter-spacing:.02em;
}
.form-input, .form-select, .form-textarea {
  width:100%; padding:.62rem .9rem; border:1.5px solid var(--border);
  border-radius:var(--r-sm); font-family:'DM Sans',sans-serif; font-size:.84rem;
  background:#fdfcfa; color:var(--text); outline:none; transition:all .18s var(--ease);
  appearance:none;
}
.form-input:focus, .form-select:focus, .form-textarea:focus {
  border-color:var(--leaf); box-shadow:0 0 0 3px rgba(90,138,90,.12); background:#fff;
}
.form-input::placeholder { color:var(--soft); }
.form-textarea { resize:vertical; min-height:85px; line-height:1.55; }
.form-group { margin-bottom:.85rem; }
.form-row  { display:grid; grid-template-columns:1fr 1fr; gap:.7rem; margin-bottom:.85rem; }
.form-error { font-size:.7rem; color:var(--rose); margin-top:.25rem; }
.form-hint  { font-size:.7rem; color:var(--muted); margin-top:.25rem; }

/* ── MODAL ── */
.modal-overlay {
  position:fixed; inset:0; background:rgba(0,0,0,.48); z-index:500;
  display:flex; align-items:center; justify-content:center;
  padding:1rem; animation:fadeIn .2s var(--ease) both;
  backdrop-filter:blur(2px);
}
.modal {
  background:#fff; border-radius:var(--r-lg); max-width:520px; width:100%;
  max-height:92vh; overflow-y:auto; box-shadow:var(--shadow-lg);
  animation:scaleIn .25s var(--ease) both;
}
.modal-wide { max-width:820px; }
.modal-narrow { max-width:400px; }
.modal-hd {
  padding:1.3rem 1.5rem .9rem; border-bottom:1.5px solid var(--border);
  display:flex; justify-content:space-between; align-items:flex-start;
  position:sticky; top:0; background:#fff; z-index:1;
}
.modal-hd h3 { font-family:'Lora',serif; font-size:1.1rem; font-weight:700; color:var(--text); }
.modal-hd p  { font-size:.72rem; color:var(--muted); margin-top:.2rem; }
.modal-bd { padding:1.2rem 1.5rem; }
.modal-ft {
  padding:.9rem 1.5rem; border-top:1.5px solid var(--border);
  display:flex; justify-content:flex-end; gap:.45rem;
  position:sticky; bottom:0; background:#fff;
}

/* ── TOAST ── */
.toast-container {
  position:fixed; bottom:1.5rem; right:1.5rem; z-index:9999;
  display:flex; flex-direction:column; gap:.5rem; pointer-events:none;
}
.toast {
  background:var(--forest); color:#fff; border-radius:12px;
  padding:.75rem 1.1rem; font-size:.8rem; font-weight:500;
  box-shadow:var(--shadow-md); display:flex; align-items:center; gap:.6rem;
  max-width:320px; animation:slideInR .3s var(--ease) both;
  pointer-events:all;
}
.toast-success { background:var(--leaf); }
.toast-error   { background:var(--rose); }
.toast-warning { background:var(--gold); }
.toast-icon { font-size:1rem; flex-shrink:0; }

/* ── TABS ── */
.tabs {
  display:flex; gap:.22rem; background:var(--cream2); border-radius:100px;
  padding:.28rem; margin-bottom:1.2rem; width:fit-content; flex-shrink:0;
}
.tab {
  padding:.4rem .9rem; border-radius:100px; font-size:.78rem; font-weight:600;
  color:var(--muted); cursor:pointer; transition:all .18s var(--ease);
  border:none; background:transparent; font-family:'DM Sans',sans-serif;
}
.tab:hover { color:var(--text); }
.tab.active {
  background:#fff; color:var(--text);
  box-shadow:0 2px 8px rgba(0,0,0,.08);
}

/* ── SEARCHBAR ── */
.searchbar {
  display:flex; align-items:center; gap:.5rem; background:#fff;
  border:1.5px solid var(--border); border-radius:100px; padding:.4rem 1rem;
  transition:all .18s var(--ease);
}
.searchbar:focus-within { border-color:var(--leaf); box-shadow:0 0 0 3px rgba(90,138,90,.1); }
.searchbar input {
  border:none; outline:none; font-family:'DM Sans',sans-serif;
  font-size:.82rem; color:var(--text); background:transparent; flex:1; min-width:0;
}
.searchbar input::placeholder { color:var(--soft); }

/* ── STATS ROW ── */
.stats-row {
  display:grid; grid-template-columns:repeat(4,1fr); gap:.8rem; margin-bottom:1.2rem;
}
.stat {
  background:var(--card); border-radius:var(--r); border:1.5px solid var(--border);
  padding:1.1rem 1.2rem; box-shadow:var(--shadow-xs); transition:all .2s var(--ease);
  animation:fadeUp .4s var(--ease) both;
}
.stat:hover { transform:translateY(-2px); box-shadow:var(--shadow); }
.stat-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:.6rem; }
.stat-icon-wrap {
  width:36px; height:36px; border-radius:9px;
  display:flex; align-items:center; justify-content:center; font-size:1rem;
}
.stat-val {
  font-family:'Lora',serif; font-size:1.75rem; font-weight:700;
  color:var(--text); line-height:1;
}
.stat-label { font-size:.7rem; color:var(--muted); font-weight:500; margin-bottom:.2rem; }
.stat-trend { font-size:.68rem; font-weight:600; color:var(--leaf); margin-top:.2rem; }
.stat-trend.down { color:var(--rose); }

/* ── SKELETON ── */
.skeleton {
  background:linear-gradient(90deg,#f0ede8 25%,#e8e4de 50%,#f0ede8 75%);
  background-size:800px 100%; animation:shimmer 1.5s infinite;
  border-radius:6px;
}

/* ── EMPTY STATE ── */
.empty-state {
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  padding:3.5rem 1.5rem; text-align:center; color:var(--muted);
}
.empty-state-icon { font-size:3rem; margin-bottom:1rem; opacity:.5; }
.empty-state h3 {
  font-family:'Lora',serif; font-size:1rem; font-weight:600; color:var(--text2);
  margin-bottom:.4rem;
}
.empty-state p { font-size:.82rem; color:var(--muted); max-width:280px; }

/* ── PROGRESS BAR ── */
.progress-bar {
  height:6px; background:var(--border); border-radius:100px; overflow:hidden;
}
.progress-fill {
  height:100%; border-radius:100px; transition:width .5s var(--ease);
  background:linear-gradient(90deg, var(--leaf), var(--forest3));
}

/* ── NOTIFICATION BELL ── */
.notif-bell { position:relative; }
.notif-count {
  position:absolute; top:-3px; right:-3px; width:17px; height:17px;
  background:var(--rose); color:#fff; border-radius:50%;
  font-size:.58rem; font-weight:700; display:flex; align-items:center; justify-content:center;
  border:2px solid var(--card); animation:bounce 1.5s ease infinite;
}

/* ── DASHBOARD GRID ── */
.dash-grid { display:grid; grid-template-columns:1fr 308px; gap:1rem; }

/* ── TODAY LIST ── */
.today-list { display:flex; flex-direction:column; gap:.55rem; }
.today-item {
  display:flex; gap:.8rem; align-items:flex-start; padding:.8rem .95rem;
  border-radius:11px; border:1.5px solid var(--border); background:#fdfcfa;
  cursor:pointer; transition:all .2s var(--ease); position:relative; overflow:hidden;
}
.today-item::before {
  content:''; position:absolute; left:0; top:0; bottom:0; width:3px; border-radius:3px 0 0 3px;
}
.today-item:hover { border-color:var(--leaf); box-shadow:0 3px 14px rgba(90,138,90,.1); transform:translateX(2px); }
.today-time {
  font-family:'Lora',serif; font-size:.8rem; font-weight:700;
  color:var(--text); min-width:38px; flex-shrink:0; margin-top:.1rem;
}
.today-body { flex:1; min-width:0; }
.today-title { font-size:.83rem; font-weight:600; color:var(--text); margin-bottom:.12rem; }
.today-meta  { font-size:.7rem; color:var(--muted); }
.today-amount { font-family:'Lora',serif; font-size:.85rem; font-weight:700; color:var(--leaf); flex-shrink:0; }

/* ── QUICK ACTIONS ── */
.qa-grid { display:grid; grid-template-columns:1fr 1fr; gap:.55rem; }
.qa-btn {
  background:var(--card); border:1.5px solid var(--border); border-radius:11px;
  padding:.8rem .7rem; display:flex; flex-direction:column; align-items:center;
  gap:.38rem; cursor:pointer; transition:all .2s var(--ease); text-align:center;
}
.qa-btn:hover {
  border-color:var(--leaf); background:var(--leaf-light); transform:translateY(-2px);
  box-shadow:0 4px 14px rgba(90,138,90,.12);
}
.qa-icon { font-size:1.35rem; }
.qa-label { font-size:.7rem; font-weight:600; color:var(--text2); }

/* ── CLIENTS ── */
.clients-grid {
  display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr));
  gap:.85rem; animation:fadeUp .4s var(--ease) both;
}
.client-card {
  background:var(--card); border-radius:var(--r); border:1.5px solid var(--border);
  padding:1.1rem 1.15rem; cursor:pointer; transition:all .2s var(--ease);
  box-shadow:var(--shadow-xs);
}
.client-card:hover {
  border-color:var(--leaf); box-shadow:var(--shadow);
  transform:translateY(-2px);
}
.cc-top { display:flex; align-items:flex-start; gap:.75rem; margin-bottom:.75rem; }
.cc-name { font-weight:700; font-size:.9rem; color:var(--text); margin-bottom:.12rem; }
.cc-pkg  { font-size:.7rem; color:var(--muted); }
.cc-condition {
  font-size:.72rem; color:var(--muted); margin-bottom:.55rem;
  display:flex; align-items:center; gap:.3rem;
}
.cc-footer {
  display:flex; justify-content:space-between; align-items:center; margin-top:.55rem;
}
.cc-stat { display:flex; align-items:center; gap:.35rem; }
.cc-stat-val { font-family:'Lora',serif; font-size:1rem; font-weight:700; color:var(--text); }
.cc-stat-lbl { font-size:.62rem; color:var(--muted); font-weight:600; }

/* ── CLIENT DETAIL ── */
.cd-hero {
  padding:1.3rem 1.5rem; border-bottom:1.5px solid var(--border);
  background:linear-gradient(135deg,#f6faf6,#fff);
  display:flex; align-items:flex-start; gap:1rem; flex-wrap:wrap;
}
.cd-info h2 { font-family:'Lora',serif; font-size:1.2rem; font-weight:700; color:var(--text); }
.cd-info p  { font-size:.75rem; color:var(--muted); margin-top:.2rem; }
.cd-tags { display:flex; flex-wrap:wrap; gap:.35rem; margin-top:.55rem; }
.cd-body { padding:1.2rem 1.5rem; }
.cd-grid {
  display:grid; grid-template-columns:repeat(4,1fr); gap:.6rem; margin-bottom:1.1rem;
}
.cd-grid-item {
  background:var(--cream); border-radius:9px; padding:.7rem .9rem;
  border:1.5px solid var(--border); text-align:center;
}
.cd-grid-item-val {
  font-family:'Lora',serif; font-size:1.15rem; font-weight:700; color:var(--text);
}
.cd-grid-item-lbl { font-size:.65rem; color:var(--muted); font-weight:600; margin-bottom:.25rem; }
.cd-section { margin-top:1.1rem; }
.cd-section-title {
  font-size:.75rem; font-weight:700; color:var(--muted); letter-spacing:.06em;
  text-transform:uppercase; margin-bottom:.65rem;
  display:flex; align-items:center; gap:.4rem;
}

/* ── NOTES ── */
.note-item {
  background:var(--cream); border:1.5px solid var(--border); border-radius:9px;
  padding:.75rem .95rem; margin-bottom:.45rem;
}
.note-header {
  display:flex; justify-content:space-between; margin-bottom:.35rem;
}
.note-date   { font-size:.68rem; font-weight:700; color:var(--leaf); }
.note-author { font-size:.68rem; color:var(--muted); }
.note-text   { font-size:.82rem; color:var(--text2); line-height:1.55; }

/* ── CALENDAR ── */
.cal-wrap { overflow-x:auto; }
.cal-grid { min-width:600px; }
.cal-header { display:grid; grid-template-columns:60px repeat(6,1fr); gap:2px; margin-bottom:2px; }
.cal-day-col { text-align:center; padding:.4rem .25rem .5rem; }
.cal-day-name { font-size:.65rem; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.08em; }
.cal-day-num  {
  font-family:'Lora',serif; font-size:1.1rem; font-weight:700; color:var(--text);
  margin-top:.15rem;
}
.cal-today-num {
  font-family:'Lora',serif; font-size:1.1rem; font-weight:700; color:#fff;
  margin-top:.15rem; background:var(--leaf); border-radius:50%;
  width:32px; height:32px; display:flex; align-items:center; justify-content:center;
  margin-left:auto; margin-right:auto;
}
.cal-row { display:grid; grid-template-columns:60px repeat(6,1fr); gap:2px; margin-bottom:2px; }
.cal-time-cell {
  font-size:.65rem; font-weight:600; color:var(--muted); text-align:right;
  padding-right:.55rem; padding-top:.38rem; flex-shrink:0;
}
.cal-cell {
  min-height:50px; border-radius:7px; border:1.5px solid transparent;
  background:var(--cream); transition:all .18s var(--ease); position:relative;
  cursor:default;
}
.cal-cell.busy { background:#f8f5ef; }
.cal-cell.has-appt { cursor:pointer; }
.cal-cell.has-appt:hover { border-color:var(--leaf); box-shadow:0 2px 10px rgba(90,138,90,.12); }
.appt-chip {
  position:absolute; inset:2px; border-radius:6px; padding:.3rem .45rem;
  display:flex; flex-direction:column; justify-content:center;
  overflow:hidden;
}
.appt-chip-title { font-size:.65rem; font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.appt-chip-sub   { font-size:.58rem; color:rgba(255,255,255,.75); margin-top:.08rem; }

/* ── SERVICES GRID ── */
.services-grid {
  display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr));
  gap:.85rem; animation:fadeUp .4s var(--ease) both;
}
.service-card {
  background:var(--card); border-radius:var(--r); border:1.5px solid var(--border);
  padding:1.15rem 1.2rem; box-shadow:var(--shadow-xs);
  transition:all .2s var(--ease); position:relative; overflow:hidden;
}
.service-card:hover { box-shadow:var(--shadow); transform:translateY(-2px); }
.sc-icon {
  width:44px; height:44px; border-radius:12px; display:flex;
  align-items:center; justify-content:center; font-size:1.3rem; margin-bottom:.8rem;
}
.sc-name { font-weight:700; font-size:.92rem; color:var(--text); margin-bottom:.25rem; }
.sc-desc { font-size:.73rem; color:var(--muted); line-height:1.5; margin-bottom:.8rem; }
.sc-footer { display:flex; justify-content:space-between; align-items:flex-end; }
.sc-price { font-family:'Lora',serif; font-size:1.05rem; font-weight:700; color:var(--text); }
.sc-dur   { font-size:.65rem; color:var(--muted); margin-top:.1rem; }

/* ── REVENUE ── */
.rev-bars { display:flex; align-items:flex-end; gap:.35rem; height:55px; }
.rev-bar {
  flex:1; border-radius:4px 4px 0 0; min-height:6px;
  background:var(--leaf-light); border:1px solid var(--leaf);
  transition:all .4s var(--ease); cursor:pointer;
}
.rev-bar:hover { background:var(--leaf); }
.rev-bar-labels {
  display:flex; gap:.35rem; margin-top:.3rem;
}
.rev-bar-lbl { flex:1; text-align:center; font-size:.6rem; color:var(--muted); font-weight:600; }

.payment-row {
  display:flex; align-items:center; gap:.75rem; padding:.7rem .85rem;
  border-radius:9px; border:1.5px solid var(--border); background:#fdfcfa;
  margin-bottom:.4rem; transition:background .15s;
}
.payment-row:hover { background:var(--sage); }

/* ── DISCOVERY GRID ── */
.disc-grid {
  display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr));
  gap:.9rem; animation:fadeUp .4s var(--ease) both;
}
.prac-card {
  background:var(--card); border-radius:var(--r); border:1.5px solid var(--border);
  overflow:hidden; box-shadow:var(--shadow-xs); transition:all .22s var(--ease);
}
.prac-card:hover { box-shadow:var(--shadow-md); transform:translateY(-3px); border-color:var(--leaf-mid); }
.prac-card-header {
  background:linear-gradient(135deg,#f0f7f0,#e8f2e8);
  padding:1.2rem 1.2rem .9rem; text-align:center; position:relative;
}
.match-badge {
  position:absolute; top:.7rem; right:.7rem;
  background:var(--forest); color:#a8d4a8;
  font-size:.62rem; font-weight:700; padding:.2rem .55rem;
  border-radius:100px; letter-spacing:.04em;
}
.prac-name { font-family:'Lora',serif; font-size:1rem; font-weight:700; color:var(--text); margin-top:.6rem; }
.prac-role { font-size:.73rem; color:var(--muted); margin-top:.15rem; }
.stars { color:var(--gold); font-size:.75rem; margin-top:.3rem; }
.prac-card-body { padding:.9rem 1.1rem; }
.prac-tags { display:flex; flex-wrap:wrap; gap:.3rem; margin-bottom:.75rem; }
.prac-stat { font-size:.72rem; color:var(--muted); display:flex; align-items:center; gap:.3rem; }
.prac-card-footer {
  padding:.8rem 1.1rem; border-top:1.5px solid var(--border);
  display:flex; justify-content:space-between; align-items:center;
}
.prac-price { font-family:'Lora',serif; font-size:.95rem; font-weight:700; color:var(--text); }
.prac-price-lbl { font-size:.65rem; color:var(--muted); }

/* ── MESSAGING ── */
.msg-layout { display:grid; grid-template-columns:280px 1fr; gap:0; height:calc(100vh - 200px); min-height:400px; }
.conv-list { border-right:1.5px solid var(--border); overflow-y:auto; }
.conv-item {
  display:flex; gap:.65rem; padding:.85rem 1rem; border-bottom:1px solid var(--border);
  cursor:pointer; transition:background .15s; position:relative;
}
.conv-item:hover { background:var(--sage); }
.conv-item.active { background:var(--leaf-light); border-left:3px solid var(--leaf); }
.conv-name { font-size:.83rem; font-weight:600; color:var(--text); }
.conv-preview { font-size:.72rem; color:var(--muted); margin-top:.1rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.conv-time { font-size:.62rem; color:var(--soft); position:absolute; top:.85rem; right:.8rem; }
.conv-unread {
  width:16px; height:16px; background:var(--leaf); color:#fff; border-radius:50%;
  font-size:.58rem; font-weight:700; display:flex; align-items:center; justify-content:center;
  position:absolute; bottom:.85rem; right:.8rem;
}
.msg-thread { display:flex; flex-direction:column; height:100%; }
.msg-thread-header {
  padding:.85rem 1.1rem; border-bottom:1.5px solid var(--border);
  display:flex; align-items:center; gap:.65rem; background:#fff;
}
.msg-thread-body { flex:1; overflow-y:auto; padding:1rem 1.1rem; display:flex; flex-direction:column; gap:.55rem; }
.msg-bubble-wrap { display:flex; align-items:flex-end; gap:.45rem; }
.msg-bubble-wrap.own { flex-direction:row-reverse; }
.msg-bubble {
  max-width:70%; padding:.65rem .9rem; border-radius:14px; font-size:.83rem; line-height:1.5;
}
.msg-bubble.other { background:var(--cream2); color:var(--text); border-bottom-left-radius:4px; }
.msg-bubble.own   { background:var(--forest); color:#fff; border-bottom-right-radius:4px; }
.msg-time { font-size:.62rem; color:var(--soft); margin-bottom:.15rem; }
.msg-input-area {
  padding:.8rem 1rem; border-top:1.5px solid var(--border);
  display:flex; gap:.5rem; align-items:center; background:#fff;
}
.msg-input {
  flex:1; border:1.5px solid var(--border); border-radius:100px;
  padding:.55rem 1rem; font-family:'DM Sans',sans-serif; font-size:.83rem;
  outline:none; transition:border-color .18s; background:#fdfcfa;
}
.msg-input:focus { border-color:var(--leaf); }

/* ── HEALTH TRACKING ── */
.metric-cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:.75rem; margin-bottom:1.2rem; }
.metric-card {
  background:var(--card); border-radius:var(--r); border:1.5px solid var(--border);
  padding:1rem 1.1rem; text-align:center; transition:all .2s var(--ease);
}
.metric-card:hover { box-shadow:var(--shadow); transform:translateY(-2px); }
.metric-icon { font-size:1.5rem; margin-bottom:.4rem; }
.metric-val  { font-family:'Lora',serif; font-size:1.5rem; font-weight:700; color:var(--text); }
.metric-unit { font-size:.68rem; color:var(--muted); }
.metric-lbl  { font-size:.7rem; color:var(--muted); font-weight:600; margin-top:.2rem; }
.metric-trend-up   { color:var(--leaf); }
.metric-trend-down { color:var(--rose); }

.chart-bar-wrap { display:flex; align-items:flex-end; gap:.3rem; height:70px; padding:.5rem 0; }
.chart-bar-item { flex:1; display:flex; flex-direction:column; align-items:center; gap:.2rem; }
.chart-bar-bar  {
  width:100%; border-radius:4px 4px 0 0; min-height:4px;
  background:linear-gradient(180deg,var(--leaf),var(--forest3));
  transition:height .4s var(--ease);
}
.chart-bar-lbl  { font-size:.58rem; color:var(--muted); font-weight:600; }

/* ── NOTIFICATIONS DRAWER ── */
.notif-drawer {
  position:fixed; top:0; right:0; width:360px; height:100vh;
  background:#fff; box-shadow:var(--shadow-lg); z-index:400;
  display:flex; flex-direction:column; animation:slideInR .25s var(--ease) both;
}
.notif-drawer-header {
  padding:1.2rem 1.3rem; border-bottom:1.5px solid var(--border);
  display:flex; align-items:center; justify-content:space-between;
}
.notif-drawer-header h3 { font-family:'Lora',serif; font-size:1.1rem; font-weight:700; }
.notif-list { flex:1; overflow-y:auto; }
.notif-item {
  display:flex; gap:.75rem; padding:.9rem 1.3rem; border-bottom:1px solid var(--border);
  transition:background .15s; position:relative;
}
.notif-item:hover { background:var(--sage); }
.notif-item.unread { background:#f8fbf8; }
.notif-item.unread::before {
  content:''; position:absolute; left:0; top:0; bottom:0; width:3px;
  background:var(--leaf); border-radius:0 3px 3px 0;
}
.notif-icon-wrap {
  width:36px; height:36px; border-radius:10px; display:flex;
  align-items:center; justify-content:center; font-size:1rem; flex-shrink:0;
}
.notif-title { font-size:.82rem; font-weight:600; color:var(--text); margin-bottom:.15rem; }
.notif-body  { font-size:.72rem; color:var(--muted); line-height:1.45; }
.notif-time  { font-size:.62rem; color:var(--soft); margin-top:.25rem; }

/* ── ADMIN ── */
.admin-user-row {
  display:flex; align-items:center; gap:.85rem; padding:.85rem 1rem;
  border-bottom:1px solid var(--border); transition:background .15s;
}
.admin-user-row:hover { background:var(--sage); }
.verif-card {
  background:var(--card); border-radius:var(--r); border:1.5px solid var(--border);
  padding:1.1rem 1.2rem; margin-bottom:.7rem; box-shadow:var(--shadow-xs);
  transition:all .2s var(--ease);
}
.verif-card:hover { box-shadow:var(--shadow); }

/* ── AUTH ── */
.auth-shell {
  min-height:100vh; display:flex; align-items:stretch;
  background:var(--cream);
}
.auth-panel-left {
  flex:1; background:var(--forest);
  background-image:
    radial-gradient(ellipse at 20% 80%, rgba(90,138,90,.4) 0%,transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(196,135,58,.15) 0%,transparent 50%);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  padding:3rem 2.5rem; color:#fff;
}
.auth-panel-right {
  width:460px; flex-shrink:0; display:flex; align-items:center; justify-content:center;
  padding:2rem 2.5rem; background:#fff;
}
.auth-form-box { width:100%; max-width:380px; }
.auth-logo { text-align:center; margin-bottom:2rem; }
.auth-logo h2 {
  font-family:'Lora',serif; font-size:1.5rem; font-weight:700; color:var(--text);
}
.auth-logo h2 em { font-style:italic; color:var(--leaf); }
.auth-logo p { font-size:.8rem; color:var(--muted); margin-top:.35rem; }
.auth-title { font-family:'Lora',serif; font-size:1.2rem; font-weight:700; color:var(--text); margin-bottom:.3rem; }
.auth-sub   { font-size:.8rem; color:var(--muted); margin-bottom:1.5rem; }
.auth-divider { text-align:center; font-size:.73rem; color:var(--muted); margin:.75rem 0; position:relative; }
.auth-divider::before, .auth-divider::after {
  content:''; position:absolute; top:50%; width:40%; height:1px; background:var(--border);
}
.auth-divider::before { left:0; }
.auth-divider::after  { right:0; }
.role-selector { display:grid; grid-template-columns:1fr 1fr; gap:.6rem; margin-bottom:1.1rem; }
.role-option {
  border:2px solid var(--border); border-radius:var(--r-sm); padding:.8rem .75rem;
  cursor:pointer; transition:all .18s var(--ease); text-align:center;
}
.role-option:hover { border-color:var(--leaf); background:var(--leaf-light); }
.role-option.selected { border-color:var(--leaf); background:var(--leaf-light); }
.role-option-icon { font-size:1.5rem; margin-bottom:.35rem; }
.role-option-label { font-size:.78rem; font-weight:700; color:var(--text); }
.role-option-desc  { font-size:.67rem; color:var(--muted); margin-top:.15rem; }

/* ── ONBOARDING WIZARD ── */
.wizard-progress { display:flex; align-items:center; gap:.35rem; margin-bottom:1.5rem; }
.wizard-step {
  flex:1; height:4px; border-radius:100px; background:var(--border);
  transition:background .4s var(--ease);
}
.wizard-step.done   { background:var(--leaf); }
.wizard-step.active { background:var(--leaf-mid); }
.wizard-step-label {
  font-size:.68rem; font-weight:700; color:var(--muted); text-align:center; margin-bottom:.35rem;
  letter-spacing:.08em; text-transform:uppercase;
}

/* ── BOOKING WIZARD ── */
.booking-summary {
  background:var(--cream); border-radius:var(--r-sm); border:1.5px solid var(--border);
  padding:1rem 1.1rem; margin-bottom:1rem;
}
.bs-row { display:flex; justify-content:space-between; padding:.4rem 0; border-bottom:1px solid var(--border); }
.bs-row:last-child { border-bottom:none; }
.bs-label { font-size:.73rem; color:var(--muted); font-weight:600; }
.bs-val   { font-size:.8rem; font-weight:700; color:var(--text); text-align:right; }

.step-indicator {
  display:flex; gap:.3rem; margin-bottom:1.25rem;
}
.step-dot {
  width:8px; height:8px; border-radius:50%;
  background:var(--border); transition:all .25s var(--ease);
}
.step-dot.active { background:var(--leaf); transform:scale(1.3); }
.step-dot.done   { background:var(--leaf-mid); }

/* ── SETTINGS ── */
.settings-grid { display:grid; grid-template-columns:220px 1fr; gap:1rem; }
.settings-nav { display:flex; flex-direction:column; gap:.2rem; }
.settings-nav-item {
  display:flex; align-items:center; gap:.6rem; padding:.6rem .9rem;
  border-radius:9px; font-size:.82rem; font-weight:500; color:var(--muted);
  cursor:pointer; transition:all .18s var(--ease);
}
.settings-nav-item:hover { background:var(--leaf-light); color:var(--text); }
.settings-nav-item.active { background:var(--leaf-light); color:var(--leaf); font-weight:700; }

/* ── RESPONSIVE ── */
@media (max-width:1100px) {
  .stats-row { grid-template-columns:repeat(2,1fr); }
  .dash-grid { grid-template-columns:1fr; }
  .cd-grid   { grid-template-columns:repeat(2,1fr); }
}
@media (max-width:768px) {
  .sidebar { transform:translateX(-100%); }
  .sidebar.open { transform:translateX(0); }
  .main { margin-left:0; padding:1.25rem 1rem 6rem; }
  .stats-row { grid-template-columns:repeat(2,1fr); }
  .form-row  { grid-template-columns:1fr; }
  .auth-panel-left { display:none; }
  .auth-panel-right { width:100%; }
  .msg-layout { grid-template-columns:1fr; }
  .conv-list { display:none; }
  .disc-grid { grid-template-columns:1fr; }
  .settings-grid { grid-template-columns:1fr; }
}

/* ── HIPAA INFO BANNER ── */
.hipaa-banner {
  background:linear-gradient(135deg,#e8f2e8,#f0f7f0); border:1.5px solid var(--leaf-mid);
  border-radius:var(--r-sm); padding:.75rem 1rem; margin-bottom:1rem;
  display:flex; align-items:center; gap:.65rem; font-size:.75rem; color:var(--text2);
}
.hipaa-icon { font-size:1.1rem; flex-shrink:0; }

/* ── VERIFICATION BADGE ── */
.verified-badge {
  display:inline-flex; align-items:center; gap:.25rem;
  background:#e8f5e9; color:#2e7d32; font-size:.65rem; font-weight:700;
  padding:.18rem .55rem; border-radius:100px;
}

/* ── MISC ── */
.divider { border:none; border-top:1.5px solid var(--border); margin:.85rem 0; }
.text-center { text-align:center; }
.flex-between { display:flex; align-items:center; justify-content:space-between; }
.flex-center  { display:flex; align-items:center; justify-content:center; }
.gap-sm { gap:.45rem; }
.mt-sm  { margin-top:.45rem; }
.mt-md  { margin-top:1rem; }
.spin   { animation:spin 1s linear infinite; display:inline-block; }
.wa-hint {
  font-size:.72rem; color:#1a7d4a; background:#e8f5ec; border:1px solid #b2dfcc;
  border-radius:7px; padding:.45rem .75rem; display:flex; align-items:center; gap:.4rem;
}
`;

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
// NOTE: In production, all this data is fetched from FastAPI via TanStack Query.
// No PHI is ever hardcoded or stored in localStorage.

const PRACTITIONERS_DB = [
  { id:1, name:"Dr. Adaeze Obi",    role:"Herbal Medicine",       initials:"AO", color:"#5a8a5a", rating:4.9, reviews:48, price:15000, availability:"Today", verified:true,  bio:"15+ years in herbal medicine and integrative wellness.", tags:["Herbal","Phytotherapy","Detox"], matchScore:97 },
  { id:2, name:"Funmi Adeyemi",     role:"Nutrition Therapist",   initials:"FA", color:"#c97d4e", rating:4.7, reviews:32, price:12000, availability:"Tomorrow", verified:true, bio:"Specialising in clinical nutrition and gut health.", tags:["Nutrition","MNT","Gut Health"], matchScore:91 },
  { id:3, name:"Ngozi Afolabi",     role:"Life Coach (ACSTH)",    initials:"NA", color:"#7a6aaa", rating:4.8, reviews:61, price:18000, availability:"Today", verified:true,  bio:"ICF-certified coach for personal and career development.", tags:["Coaching","Mindset","Career"], matchScore:85 },
  { id:4, name:"Emeka Nwosu",       role:"Wellness Coach",         initials:"EN", color:"#3d7a8a", rating:4.6, reviews:27, price:10000, availability:"Fri",   verified:true,  bio:"Holistic wellness and stress resilience specialist.", tags:["Wellness","Stress","Breathwork"], matchScore:82 },
  { id:5, name:"Shade Bello",       role:"Physiotherapist",        initials:"SB", color:"#b05070", rating:4.8, reviews:39, price:20000, availability:"Today", verified:true,  bio:"Sports rehab and post-surgery physiotherapy.", tags:["Physio","Rehab","Sports"], matchScore:78 },
];

const SERVICES_DB = [
  { id:1, name:"MNT Consultation",         duration:60,  price:15000, color:"#5a8a5a", category:"nutrition", icon:"🌿", desc:"Medical Nutrition Therapy assessment and planning" },
  { id:2, name:"Phytotherapy Session",     duration:45,  price:12000, color:"#6a9a3a", category:"herbal",    icon:"🌱", desc:"Herbal treatment and plant medicine consultation" },
  { id:3, name:"Life Coaching Session",    duration:60,  price:18000, color:"#7a6aaa", category:"coaching",  icon:"✨", desc:"Goal setting, mindset and personal development" },
  { id:4, name:"Group Wellness Workshop",  duration:120, price:8000,  color:"#c97d4e", category:"group",     icon:"👥", desc:"Group session for up to 10 participants" },
  { id:5, name:"Nutrition Follow-up",      duration:30,  price:7500,  color:"#3d7a8a", category:"nutrition", icon:"📋", desc:"Progress review and plan adjustment" },
  { id:6, name:"Fasting & Detox Plan",     duration:45,  price:10000, color:"#8a6a3a", category:"herbal",    icon:"🍃", desc:"Personalised fasting and juicing protocol" },
  { id:7, name:"Stress Management",        duration:60,  price:15000, color:"#b05070", category:"coaching",  icon:"🧘", desc:"Techniques for managing stress and anxiety" },
  { id:8, name:"Fertility Wellness",       duration:90,  price:25000, color:"#c4873a", category:"nutrition", icon:"🌸", desc:"Comprehensive fertility nutrition and wellness" },
];

const PATIENTS_DB = [
  { id:1,  name:"Chiamaka Osei",    initials:"CO", color:"#5a8a5a", phone:"080 1234 5678", email:"chiamaka@email.com",  sessions:8, remaining:2, package:"MNT Programme",      status:"active",  joined:"Jan 2026", condition:"Diabetes management" },
  { id:2,  name:"Biodun Fashola",   initials:"BF", color:"#7a6aaa", phone:"080 2345 6789", email:"biodun@email.com",    sessions:10,remaining:5, package:"Coaching Package",    status:"active",  joined:"Feb 2026", condition:"Career transition" },
  { id:3,  name:"Temi Adebayo",     initials:"TA", color:"#c97d4e", phone:"080 3456 7890", email:"temi@email.com",      sessions:6, remaining:0, package:"Herbal Wellness",     status:"renewal", joined:"Dec 2025", condition:"Hormonal imbalance" },
  { id:4,  name:"Kunle Okafor",     initials:"KO", color:"#c4873a", phone:"080 4567 8901", email:"kunle@email.com",     sessions:12,remaining:8, package:"Fertility Programme", status:"active",  joined:"Feb 2026", condition:"Fertility support" },
  { id:5,  name:"Yeside Williams",  initials:"YW", color:"#b05070", phone:"080 5678 9012", email:"yeside@email.com",    sessions:4, remaining:4, package:"Stress & Wellness",   status:"active",  joined:"Mar 2026", condition:"Stress & anxiety" },
  { id:6,  name:"Rotimi Bello",     initials:"RB", color:"#3d7a8a", phone:"080 6789 0123", email:"rotimi@email.com",    sessions:5, remaining:1, package:"Detox Programme",     status:"active",  joined:"Jan 2026", condition:"Weight management" },
];

const APPOINTMENTS_DB = [
  { id:101, patientId:1, practitionerId:1, serviceId:1, day:0, hour:1, status:"confirmed", paid:true,  amount:15000, note:"Blood sugar trend check" },
  { id:102, patientId:2, practitionerId:3, serviceId:3, day:1, hour:3, status:"confirmed", paid:true,  amount:18000, note:"Goal review session" },
  { id:103, patientId:4, practitionerId:2, serviceId:8, day:2, hour:2, status:"confirmed", paid:false, amount:25000, note:"Month 2 fertility check" },
  { id:104, patientId:5, practitionerId:4, serviceId:7, day:3, hour:4, status:"confirmed", paid:true,  amount:15000, note:"Breathing techniques" },
  { id:105, patientId:3, practitionerId:1, serviceId:6, day:4, hour:1, status:"pending",   paid:false, amount:10000, note:"Detox plan adjustment" },
  { id:106, patientId:6, practitionerId:2, serviceId:5, day:0, hour:5, status:"confirmed", paid:true,  amount:7500,  note:"Weight progress review" },
];

const MESSAGES_DB = [
  { id:1, from:"Dr. Adaeze Obi", fromId:1, to:"Me", toId:0, text:"Good morning! How are you feeling after the dietary changes this week?", time:"9:15am", initials:"AO", color:"#5a8a5a" },
  { id:2, from:"Me", fromId:0, to:"Dr. Adaeze Obi", toId:1, text:"Much better, thank you! Energy levels are definitely improving 🌿", time:"9:32am", initials:"ME", color:"#3a5a3a" },
  { id:3, from:"Dr. Adaeze Obi", fromId:1, to:"Me", toId:0, text:"That's wonderful to hear. Let's continue with Phase 2 in our next session. I'll send over the new protocol before then.", time:"9:34am", initials:"AO", color:"#5a8a5a" },
  { id:4, from:"Ngozi Afolabi",  fromId:3, to:"Me", toId:0, text:"Reminder: Our session is tomorrow at 2pm. Looking forward to it!", time:"Yesterday", initials:"NA", color:"#7a6aaa" },
];

const NOTIFICATIONS_DB = [
  { id:1, type:"appointment", icon:"📅", bg:"#e8f2e8", title:"Appointment confirmed", body:"Your MNT Consultation with Dr. Adaeze is confirmed for Mon, 9am.", time:"2 min ago", read:false },
  { id:2, type:"message",     icon:"💬", bg:"#f0eef8", title:"New message",           body:"Dr. Adaeze sent you a message about your health plan.", time:"15 min ago", read:false },
  { id:3, type:"match",       icon:"🌿", bg:"#e4f2f5", title:"New match found",        body:"We found 3 new practitioners that match your health goals.", time:"1 hr ago", read:true },
  { id:4, type:"review",      icon:"⭐", bg:"#fdf0e0", title:"Review your session",    body:"How was your session with Funmi Adeyemi? Share your feedback.", time:"2 hrs ago", read:true },
  { id:5, type:"system",      icon:"🔒", bg:"#fceef4", title:"Security check",         body:"Your account was accessed from a new device. Was this you?", time:"Yesterday", read:true },
];

const HEALTH_METRICS = [
  { icon:"⚖️", label:"Weight",        val:"78.2", unit:"kg", trend:"-1.4kg", up:true  },
  { icon:"💉", label:"Blood Glucose", val:"6.1",  unit:"mmol/L", trend:"-0.3", up:true  },
  { icon:"❤️", label:"Blood Pressure",val:"118/76", unit:"mmHg", trend:"Stable", up:true  },
  { icon:"😴", label:"Sleep",         val:"7.2",  unit:"hrs/night", trend:"+0.8h", up:true  },
  { icon:"🧘", label:"Mood Score",    val:"8.1",  unit:"/10", trend:"+1.2", up:true  },
  { icon:"🚶", label:"Steps",         val:"8,420", unit:"avg/day", trend:"+1.1k", up:true  },
];

const HEALTH_LOGS = [
  { day:"Mon", weight:79.2, glucose:6.4 },
  { day:"Tue", weight:79.0, glucose:6.3 },
  { day:"Wed", weight:78.8, glucose:6.2 },
  { day:"Thu", weight:78.6, glucose:6.1 },
  { day:"Fri", weight:78.4, glucose:6.0 },
  { day:"Sat", weight:78.2, glucose:6.1 },
  { day:"Sun", weight:78.2, glucose:6.1 },
];

const DAYS  = ["Mon","Tue","Wed","Thu","Fri","Sat"];
const HOURS = ["8am","9am","10am","11am","12pm","1pm","2pm","3pm","4pm","5pm","6pm"];
const DATE_NUMS = [17,18,19,20,21,22];

const fmt = (n) => "₦" + Number(n).toLocaleString();
const dur = (m) => m < 60 ? `${m}m` : `${Math.floor(m/60)}h${m%60?` ${m%60}m`:""}`;

// ─── AUTH CONTEXT (simulates Zustand store — in production this is a Zustand store) ─────
// HIPAA: accessToken is in-memory only. refreshToken would be httpOnly cookie from server.
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  // HIPAA: user object in memory only — never persisted to localStorage
  const [auth, setAuth] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email, password, role) => {
    setIsLoading(true);
    // Simulates POST /auth/login → returns { accessToken, user }
    await new Promise(r => setTimeout(r, 900));
    const mockUser = {
      id: role === "admin" ? 99 : role === "practitioner" ? 1 : 10,
      name: role === "admin" ? "Admin User" : role === "practitioner" ? "Dr. Adaeze Obi" : "Chiamaka Osei",
      email,
      role,
      initials: role === "admin" ? "AU" : role === "practitioner" ? "AO" : "CO",
      color: role === "admin" ? "#7a6aaa" : role === "practitioner" ? "#5a8a5a" : "#c97d4e",
      specialty: role === "practitioner" ? "Herbal Medicine" : null,
      onboardingComplete: true,
      // accessToken lives here in memory — NOT in localStorage
      accessToken: "eyJ.mock.token",
    };
    setAuth(mockUser);
    setIsLoading(false);
    return mockUser;
  }, []);

  const logout = useCallback(() => {
    setAuth(null);
    // In production: also POST /auth/logout to clear httpOnly cookie
  }, []);

  return (
    <AuthContext.Provider value={{ user: auth, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => useContext(AuthContext);

// ─── TOAST CONTEXT ────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const addToast = useCallback((msg, type = "success") => {
    const id = ++counter.current;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const icons = { success:"✅", error:"❌", warning:"⚠️", info:"🌿" };

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon">{icons[t.type] || "🌿"}</span>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const useToast = () => useContext(ToastContext);

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

function Av({ initials, color, size = "av-md", online = false }) {
  return (
    <div className={`av ${size} ${online ? "av-online" : ""}`} style={{ background: color || "#5a8a5a" }}>
      {initials}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    active:    ["badge-green", "Active"],
    confirmed: ["badge-green", "Confirmed"],
    pending:   ["badge-gold",  "Pending"],
    renewal:   ["badge-rose",  "Renewal"],
    new:       ["badge-new",   "New"],
    rejected:  ["badge-rose",  "Rejected"],
    verified:  ["badge-green", "Verified"],
    cancelled: ["badge-muted", "Cancelled"],
  };
  const [cls, label] = map[status] || ["badge-muted", status];
  return <span className={`badge ${cls}`}>{label}</span>;
}

function Spinner() {
  return <span className="spin" style={{ fontSize:"1.2rem" }}>⟳</span>;
}

function SkeletonCard() {
  return (
    <div className="card" style={{ padding:"1.1rem" }}>
      <div className="skeleton" style={{ height:12, width:"40%", marginBottom:12 }} />
      <div className="skeleton" style={{ height:20, width:"70%", marginBottom:8 }} />
      <div className="skeleton" style={{ height:12, width:"55%", marginBottom:16 }} />
      <div className="skeleton" style={{ height:36, width:"100%" }} />
    </div>
  );
}

function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
      {action && <div style={{ marginTop:"1rem" }}>{action}</div>}
    </div>
  );
}

function HipaaBanner({ text }) {
  return (
    <div className="hipaa-banner">
      <span className="hipaa-icon">🔒</span>
      <span>{text || "Your health data is encrypted and HIPAA-conscious. Only you and your practitioners can access your records."}</span>
    </div>
  );
}

function Modal({ open, onClose, title, subtitle, children, footer, wide, narrow }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal ${wide ? "modal-wide" : ""} ${narrow ? "modal-narrow" : ""}`}
        onClick={e => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-label={title}
      >
        <div className="modal-hd">
          <div>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="btn btn-icon btn-sm" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-bd">{children}</div>
        {footer && <div className="modal-ft">{footer}</div>}
      </div>
    </div>
  );
}

// ─── APP SHELL & NAVIGATION ───────────────────────────────────────────────────

const NAV_CONFIG = {
  patient: [
    { label:"Overview", items:[
      { id:"p-dashboard", icon:"🏠", label:"Dashboard" },
      { id:"discover",    icon:"🔍", label:"Find Practitioners" },
      { id:"p-match",     icon:"✨", label:"AI Matches", badge:3 },
    ]},
    { label:"My Health", items:[
      { id:"p-appointments", icon:"📅", label:"Appointments" },
      { id:"p-health",       icon:"📊", label:"Health Tracking" },
      { id:"messages",       icon:"💬", label:"Messages", badge:2 },
    ]},
    { label:"Account", items:[
      { id:"notifications",  icon:"🔔", label:"Notifications" },
      { id:"settings",       icon:"⚙️", label:"Settings" },
    ]},
  ],
  practitioner: [
    { label:"Overview", items:[
      { id:"pr-dashboard", icon:"🏠", label:"Dashboard" },
      { id:"schedule",     icon:"📆", label:"Schedule" },
    ]},
    { label:"Practice", items:[
      { id:"patients",  icon:"👤", label:"Patients", badge:2 },
      { id:"services",  icon:"🌿", label:"Services" },
      { id:"revenue",   icon:"💰", label:"Revenue" },
      { id:"messages",  icon:"💬", label:"Messages", badge:1 },
    ]},
    { label:"Account", items:[
      { id:"notifications", icon:"🔔", label:"Notifications" },
      { id:"settings",      icon:"⚙️", label:"Settings" },
    ]},
  ],
  admin: [
    { label:"Admin", items:[
      { id:"admin-dash",   icon:"🏠", label:"Overview" },
      { id:"admin-users",  icon:"👥", label:"Users" },
      { id:"admin-verif",  icon:"🛡️", label:"Verification Queue", badge:4 },
      { id:"admin-stats",  icon:"📊", label:"Platform Stats" },
    ]},
    { label:"Account", items:[
      { id:"settings", icon:"⚙️", label:"Settings" },
    ]},
  ],
};

function Sidebar({ user, view, setView, notifCount, onNotif }) {
  const navGroups = NAV_CONFIG[user.role] || [];
  const roleLabels = { patient:"Patient Portal", practitioner:"Practice Manager", admin:"Admin Console" };

  return (
    <nav className="sidebar" role="navigation" aria-label="Main navigation">
      {/* Logo */}
      <div className="sb-logo">
        <div className="sb-logo-mark">
          <div className="sb-logo-icon">🌿</div>
          <h2>Herbit <em>Habitat</em></h2>
        </div>
        <div className="sb-tagline">Rooted in nature, guided by science</div>
        <div className={`sb-role-chip role-${user.role}`}>{roleLabels[user.role]}</div>
      </div>

      {/* Nav */}
      <div className="sb-nav">
        {navGroups.map(group => (
          <div key={group.label} className="sb-section">
            <div className="sb-section-label">{group.label}</div>
            {group.items.map(item => (
              <div
                key={item.id}
                className={`nav-item ${view === item.id ? "active" : ""}`}
                onClick={() => item.action ? item.action() : setView(item.id)}
                role="button" tabIndex={0}
                onKeyDown={e => e.key === "Enter" && setView(item.id)}
                aria-current={view === item.id ? "page" : undefined}
              >
                <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                {item.label}
                {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="sb-footer">
        <div className="sb-user">
          <Av initials={user.initials} color={user.color} size="av-md" online />
          <div className="sb-user-info">
            <strong>{user.name}</strong>
            <span>{user.specialty || user.role}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ─── PRACTITIONER DASHBOARD ───────────────────────────────────────────────────

function PractitionerDashboard({ appointments, setView, setBookingOpen, toast }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => { setTimeout(() => setLoading(false), 700); }, []);

  const paid    = appointments.filter(a => a.paid);
  const unpaid  = appointments.filter(a => !a.paid);
  const total   = appointments.reduce((s,a) => s+a.amount, 0);
  const collected = paid.reduce((s,a) => s+a.amount, 0);
  const renewals = PATIENTS_DB.filter(c => c.status === "renewal" || c.remaining === 0);
  const todayAppts = appointments.filter(a => a.day <= 1);

  if (loading) return (
    <>
      <div className="topbar">
        <div className="topbar-left"><small>Overview</small><h1>Loading...</h1></div>
      </div>
      <div className="stats-row">{[1,2,3,4].map(i => <SkeletonCard key={i} />)}</div>
    </>
  );

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <small>Practice Overview</small>
          <h1>Good morning, <em>Dr. Adaeze</em> 🌿</h1>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => toast("Exporting weekly report...", "info")}>📤 Report</button>
          <button className="btn btn-forest" onClick={() => setBookingOpen(true)}>+ Book Session</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        {[
          { label:"Active Patients",    val: PATIENTS_DB.filter(c=>c.status==="active").length, icon:"👥", bg:"#e8f2e8", trend:"+2 this month" },
          { label:"Sessions This Week", val: appointments.length, icon:"📅", bg:"#f0eef8", trend:`${appointments.length} confirmed` },
          { label:"Revenue (Month)",    val: fmt(total), icon:"💰", bg:"#fdf0e0", trend:`₦${(total*.82/1000).toFixed(0)}k collected` },
          { label:"Renewal Alerts",     val: renewals.length, icon:"🔔", bg:"#fceef4", trend:"Need follow-up", down:true },
        ].map((s,i) => (
          <div key={i} className="stat" style={{ animationDelay:`${i*.08}s` }}>
            <div className="stat-header">
              <span className="stat-label">{s.label}</span>
              <div className="stat-icon-wrap" style={{ background:s.bg }}>{s.icon}</div>
            </div>
            <div className="stat-val">{s.val}</div>
            <div className={`stat-trend ${s.down?"down":""}`}>{s.trend}</div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        {/* Today's Schedule */}
        <div className="card" style={{ animation:"fadeUp .5s .1s ease both", animationFillMode:"both" }}>
          <div className="card-hd">
            <div className="card-hd-icon" style={{ background:"#e8f2e8" }}>📆</div>
            <div><h3>Today's Schedule</h3><p>Monday, March 17</p></div>
            <div className="card-hd-actions">
              <button className="btn btn-ghost btn-xs" onClick={() => setView("schedule")}>Full view →</button>
            </div>
          </div>
          <div className="card-bd">
            {todayAppts.length === 0 ? (
              <EmptyState icon="☀️" title="Clear schedule" desc="No appointments today. Enjoy your day!" />
            ) : (
              <div className="today-list">
                {todayAppts.map(a => {
                  const svc     = SERVICES_DB.find(s => s.id === a.serviceId);
                  const patient = PATIENTS_DB.find(p => p.id === a.patientId);
                  if (!svc || !patient) return null;
                  return (
                    <div key={a.id} className="today-item" style={{ "--accent": svc.color }}>
                      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:svc.color, borderRadius:"3px 0 0 3px" }} />
                      <div className="today-time">{HOURS[a.hour]}</div>
                      <Av initials={patient.initials} color={patient.color} size="av-sm" />
                      <div className="today-body">
                        <div className="today-title">{svc.icon} {patient.name}</div>
                        <div className="today-meta">{svc.name} · {dur(svc.duration)}</div>
                      </div>
                      <StatusBadge status={a.paid ? "confirmed" : "pending"} />
                      <div className="today-amount">{fmt(a.amount)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display:"flex", flexDirection:"column", gap:".85rem" }}>
          {/* Quick actions */}
          <div className="card" style={{ animation:"fadeUp .5s .15s ease both", animationFillMode:"both" }}>
            <div className="card-hd">
              <div className="card-hd-icon" style={{ background:"#f0eef8" }}>⚡</div>
              <div><h3>Quick Actions</h3></div>
            </div>
            <div className="card-bd">
              <div className="qa-grid">
                {[
                  { icon:"➕", label:"Book Session",    action:() => setBookingOpen(true) },
                  { icon:"📤", label:"Send Reminder",   action:() => toast("WhatsApp reminders sent ✓","success") },
                  { icon:"👥", label:"View Patients",   action:() => setView("patients") },
                  { icon:"💰", label:"Revenue Report",  action:() => setView("revenue") },
                ].map((q,i) => (
                  <div key={i} className="qa-btn" onClick={q.action} role="button" tabIndex={0}>
                    <div className="qa-icon">{q.icon}</div>
                    <span className="qa-label">{q.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue mini */}
          <div className="card" style={{ animation:"fadeUp .5s .2s ease both", animationFillMode:"both" }}>
            <div className="card-hd">
              <div className="card-hd-icon" style={{ background:"#fdf0e0" }}>💰</div>
              <div><h3>Revenue</h3><p>March 2026</p></div>
            </div>
            <div className="card-bd">
              <div style={{ fontFamily:"'Lora',serif", fontSize:"1.5rem", fontWeight:700, color:"var(--text)", marginBottom:".5rem" }}>{fmt(collected)}</div>
              <div style={{ fontSize:".72rem", color:"var(--muted)", marginBottom:"1rem" }}>
                {fmt(total-collected)} outstanding · {Math.round(collected/total*100)}% collected
              </div>
              <div className="rev-bars">
                {[42,68,55,80,95,73,85].map((v,i) => (
                  <div key={i} className="rev-bar" style={{ height:`${v}%` }} title={`₦${(v*1000).toLocaleString()}`} />
                ))}
              </div>
              <div className="rev-bar-labels" style={{ display:"flex", gap:".3rem", marginTop:".3rem" }}>
                {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
                  <div key={d} style={{ flex:1, textAlign:"center", fontSize:".58rem", color:"var(--muted)", fontWeight:600 }}>{d}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Renewal alerts */}
          {renewals.length > 0 && (
            <div className="card" style={{ animation:"fadeUp .5s .25s ease both", animationFillMode:"both" }}>
              <div className="card-hd">
                <div className="card-hd-icon" style={{ background:"#fceef4" }}>🔔</div>
                <div><h3>Renewal Alerts</h3><p>{renewals.length} need follow-up</p></div>
              </div>
              <div className="card-bd" style={{ padding:".9rem 1.1rem" }}>
                {renewals.map(c => (
                  <div key={c.id} style={{ display:"flex", alignItems:"center", gap:".65rem", marginBottom:".55rem" }}>
                    <Av initials={c.initials} color={c.color} size="av-sm" />
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:".82rem", fontWeight:600 }}>{c.name}</div>
                      <div style={{ fontSize:".68rem", color:"var(--muted)" }}>{c.remaining} sessions left</div>
                    </div>
                    <button className="btn btn-gold btn-xs" onClick={() => toast(`Reminder sent to ${c.name.split(" ")[0]} 📱`, "success")}>Remind</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── PATIENT DASHBOARD ────────────────────────────────────────────────────────

function PatientDashboard({ setView, toast }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => { setTimeout(() => setLoading(false), 600); }, []);

  if (loading) return (
    <>
      <div className="topbar"><div className="topbar-left"><small>Overview</small><h1>Loading...</h1></div></div>
      <div className="stats-row">{[1,2,3,4].map(i => <SkeletonCard key={i} />)}</div>
    </>
  );

  const upcomingAppts = APPOINTMENTS_DB.slice(0, 2);

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <small>Patient Portal</small>
          <h1>Welcome back, <em>Chiamaka</em> 🌿</h1>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setView("discover")}>Find Practitioner</button>
          <button className="btn btn-forest" onClick={() => setView("p-match")}>✨ AI Matches</button>
        </div>
      </div>

      <HipaaBanner />

      <div className="stats-row">
        {[
          { label:"Active Practitioners",  val:"2",    icon:"🌿", bg:"#e8f2e8", trend:"3 sessions booked" },
          { label:"Upcoming Appointments", val:"3",    icon:"📅", bg:"#f0eef8", trend:"Next: Mon 9am" },
          { label:"Health Goals Met",      val:"4/6",  icon:"🎯", bg:"#fdf0e0", trend:"67% complete" },
          { label:"Days Tracked",          val:"28",   icon:"📊", bg:"#e4f2f5", trend:"28-day streak 🔥" },
        ].map((s,i) => (
          <div key={i} className="stat" style={{ animationDelay:`${i*.08}s` }}>
            <div className="stat-header">
              <span className="stat-label">{s.label}</span>
              <div className="stat-icon-wrap" style={{ background:s.bg }}>{s.icon}</div>
            </div>
            <div className="stat-val">{s.val}</div>
            <div className="stat-trend">{s.trend}</div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <div className="card" style={{ animation:"fadeUp .5s .1s ease both", animationFillMode:"both" }}>
          <div className="card-hd">
            <div className="card-hd-icon" style={{ background:"#e8f2e8" }}>📅</div>
            <div><h3>Upcoming Appointments</h3></div>
            <div className="card-hd-actions">
              <button className="btn btn-ghost btn-xs" onClick={() => setView("p-appointments")}>See all →</button>
            </div>
          </div>
          <div className="card-bd">
            <div className="today-list">
              {upcomingAppts.map(a => {
                const svc  = SERVICES_DB.find(s => s.id === a.serviceId);
                const prac = PRACTITIONERS_DB.find(p => p.id === a.practitionerId);
                if (!svc || !prac) return null;
                return (
                  <div key={a.id} className="today-item">
                    <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:svc.color, borderRadius:"3px 0 0 3px" }} />
                    <div className="today-time">{DAYS[a.day]}</div>
                    <Av initials={prac.initials} color={prac.color} size="av-sm" />
                    <div className="today-body">
                      <div className="today-title">{svc.icon} {svc.name}</div>
                      <div className="today-meta">{prac.name} · {HOURS[a.hour]}</div>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:".85rem" }}>
          <div className="card" style={{ animation:"fadeUp .5s .15s ease both", animationFillMode:"both" }}>
            <div className="card-hd">
              <div className="card-hd-icon" style={{ background:"#f0eef8" }}>⚡</div>
              <div><h3>Quick Actions</h3></div>
            </div>
            <div className="card-bd">
              <div className="qa-grid">
                {[
                  { icon:"🔍", label:"Find Practitioner",  action:() => setView("discover") },
                  { icon:"📊", label:"Log Health Data",    action:() => setView("p-health") },
                  { icon:"💬", label:"Messages",           action:() => setView("messages") },
                  { icon:"⭐", label:"Write Review",       action:() => toast("Review form opening...","info") },
                ].map((q,i) => (
                  <div key={i} className="qa-btn" onClick={q.action} role="button" tabIndex={0}>
                    <div className="qa-icon">{q.icon}</div>
                    <span className="qa-label">{q.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Health snapshot */}
          <div className="card" style={{ animation:"fadeUp .5s .2s ease both", animationFillMode:"both" }}>
            <div className="card-hd">
              <div className="card-hd-icon" style={{ background:"#e4f2f5" }}>📊</div>
              <div><h3>Health Snapshot</h3><p>Today</p></div>
              <div className="card-hd-actions">
                <button className="btn btn-ghost btn-xs" onClick={() => setView("p-health")}>View →</button>
              </div>
            </div>
            <div className="card-bd">
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:".5rem" }}>
                {HEALTH_METRICS.slice(0,4).map((m,i) => (
                  <div key={i} style={{ background:"var(--cream)", borderRadius:9, padding:".6rem .75rem", border:"1.5px solid var(--border)" }}>
                    <div style={{ fontSize:".82rem" }}>{m.icon}</div>
                    <div style={{ fontFamily:"'Lora',serif", fontSize:"1rem", fontWeight:700, color:"var(--text)", marginTop:".15rem" }}>{m.val} <span style={{ fontSize:".65rem", fontWeight:400, color:"var(--muted)" }}>{m.unit}</span></div>
                    <div style={{ fontSize:".62rem", color:"var(--leaf)", fontWeight:600, marginTop:".1rem" }}>{m.trend}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── DISCOVERY ────────────────────────────────────────────────────────────────

function Discovery({ onBook, toast }) {
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { setTimeout(() => setLoading(false), 500); }, []);

  const specMap = { all: null, nutrition:"Nutrition", herbal:"Herbal Medicine", coaching:"Life Coach" };
  const filtered = PRACTITIONERS_DB.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.role.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.role.toLowerCase().includes(specMap[filter]?.toLowerCase() || "");
    return matchSearch && matchFilter;
  });

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <small>Marketplace</small>
          <h1>Find Your <em>Practitioner</em></h1>
        </div>
      </div>

      <div style={{ display:"flex", gap:".7rem", marginBottom:"1.1rem", flexWrap:"wrap", animation:"fadeDown .4s ease both" }}>
        <div className="searchbar" style={{ flex:1, minWidth:220 }}>
          <span>🔍</span>
          <input
            placeholder="Search by name or specialty..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search practitioners"
          />
          {search && <span style={{ cursor:"pointer", color:"var(--muted)" }} onClick={() => setSearch("")}>✕</span>}
        </div>
        <div className="tabs" style={{ margin:0 }}>
          {["all","nutrition","herbal","coaching"].map(f => (
            <button key={f} className={`tab ${filter===f?"active":""}`} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="disc-grid">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card"><EmptyState icon="🔍" title="No results" desc="Try a different search or filter." /></div>
      ) : (
        <div className="disc-grid">
          {filtered.map(p => (
            <div key={p.id} className="prac-card">
              <div className="prac-card-header">
                {p.matchScore && <div className="match-badge">✨ {p.matchScore}% match</div>}
                <Av initials={p.initials} color={p.color} size="av-xl" />
                <div className="prac-name">{p.name}</div>
                <div className="prac-role">{p.role}</div>
                <div className="stars">{"★".repeat(Math.floor(p.rating))} {p.rating} ({p.reviews} reviews)</div>
                {p.verified && <div className="verified-badge" style={{ marginTop:".4rem" }}>✓ Verified</div>}
              </div>
              <div className="prac-card-body">
                <div className="prac-tags">
                  {p.tags.map(t => <span key={t} className="badge badge-green">{t}</span>)}
                </div>
                <div style={{ fontSize:".75rem", color:"var(--text2)", lineHeight:1.5, marginBottom:".65rem" }}>{p.bio}</div>
                <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap" }}>
                  <div className="prac-stat">📅 {p.availability}</div>
                  <div className="prac-stat">⭐ {p.rating}/5.0</div>
                </div>
              </div>
              <div className="prac-card-footer">
                <div>
                  <div className="prac-price">{fmt(p.price)}</div>
                  <div className="prac-price-lbl">per session</div>
                </div>
                <div style={{ display:"flex", gap:".4rem" }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelected(p)}>Profile</button>
                  <button className="btn btn-forest btn-sm" onClick={() => onBook(p)}>Book</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Profile preview modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name || ""}
        subtitle={selected?.role}
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>Close</button>
            <button className="btn btn-forest btn-sm" onClick={() => { onBook(selected); setSelected(null); }}>Book Session</button>
          </>
        }
      >
        {selected && (
          <div>
            <div style={{ display:"flex", gap:".85rem", alignItems:"center", marginBottom:"1rem" }}>
              <Av initials={selected.initials} color={selected.color} size="av-xl" />
              <div>
                <div style={{ fontSize:".8rem", color:"var(--muted)", marginBottom:".3rem" }}>{selected.role}</div>
                <div className="stars">{"★".repeat(Math.floor(selected.rating))} {selected.rating} ({selected.reviews} reviews)</div>
                <div style={{ marginTop:".35rem" }}>{selected.verified && <span className="verified-badge">✓ Verified Practitioner</span>}</div>
              </div>
            </div>
            <p style={{ fontSize:".83rem", color:"var(--text2)", lineHeight:1.6, marginBottom:"1rem" }}>{selected.bio}</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:".35rem", marginBottom:"1rem" }}>
              {selected.tags.map(t => <span key={t} className="badge badge-green">{t}</span>)}
            </div>
            <div style={{ background:"var(--cream)", borderRadius:9, padding:".75rem 1rem", border:"1.5px solid var(--border)" }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <div style={{ fontSize:".75rem", color:"var(--muted)" }}>Session fee</div>
                <div style={{ fontFamily:"'Lora',serif", fontWeight:700 }}>{fmt(selected.price)}</div>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:".3rem" }}>
                <div style={{ fontSize:".75rem", color:"var(--muted)" }}>Availability</div>
                <div style={{ fontSize:".82rem", fontWeight:600, color:"var(--leaf)" }}>{selected.availability}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

// ─── AI MATCHING ──────────────────────────────────────────────────────────────

function AIMatching({ onBook, toast }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => { setTimeout(() => setLoading(false), 1200); }, []);

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <small>AI-Powered</small>
          <h1>Your <em>Matched</em> Practitioners</h1>
        </div>
      </div>

      <div className="card" style={{ padding:"1rem 1.3rem", marginBottom:"1.1rem", background:"linear-gradient(135deg,#e8f5e8,#f0f7f0)", border:"1.5px solid var(--leaf-mid)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:".75rem" }}>
          <span style={{ fontSize:"1.5rem" }}>✨</span>
          <div>
            <div style={{ fontFamily:"'Lora',serif", fontWeight:700, fontSize:".95rem", color:"var(--text)" }}>AI Matching Engine</div>
            <div style={{ fontSize:".73rem", color:"var(--muted)", marginTop:".15rem" }}>Based on your health goals, conditions, and preferences — updated daily</div>
          </div>
        </div>
      </div>

      <HipaaBanner text="Your health profile used for matching is encrypted and never shared with practitioners until you book." />

      {loading ? (
        <div style={{ display:"flex", flexDirection:"column", gap:".8rem" }}>
          <div className="card" style={{ padding:"1.5rem", textAlign:"center" }}>
            <div className="spin" style={{ fontSize:"2rem" }}>⟳</div>
            <div style={{ fontSize:".82rem", color:"var(--muted)", marginTop:".75rem" }}>Analysing your health profile...</div>
          </div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:".85rem" }}>
          {PRACTITIONERS_DB.sort((a,b) => b.matchScore - a.matchScore).map((p,i) => (
            <div key={p.id} className="card" style={{ animation:`fadeUp .4s ${i*.08}s ease both`, animationFillMode:"both" }}>
              <div className="card-bd" style={{ display:"flex", gap:"1rem", alignItems:"center", flexWrap:"wrap" }}>
                <Av initials={p.initials} color={p.color} size="av-lg" />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:".5rem", flexWrap:"wrap" }}>
                    <div style={{ fontWeight:700, fontSize:".92rem" }}>{p.name}</div>
                    {p.verified && <span className="verified-badge">✓</span>}
                    <span className="badge badge-green">✨ {p.matchScore}% match</span>
                    {i === 0 && <span className="badge badge-gold">🏆 Top Match</span>}
                  </div>
                  <div style={{ fontSize:".73rem", color:"var(--muted)", margin:".15rem 0 .4rem" }}>{p.role}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:".3rem" }}>
                    {p.tags.map(t => <span key={t} className="badge badge-muted">{t}</span>)}
                  </div>
                </div>
                {/* Match score ring */}
                <div style={{ textAlign:"center", flexShrink:0 }}>
                  <div style={{ fontFamily:"'Lora',serif", fontSize:"1.75rem", fontWeight:700, color:"var(--forest)", lineHeight:1 }}>{p.matchScore}%</div>
                  <div style={{ fontSize:".62rem", color:"var(--muted)", fontWeight:600 }}>match</div>
                  <div style={{ fontSize:".72rem", color:"var(--leaf)", marginTop:".2rem" }}>{p.availability}</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:".35rem", flexShrink:0 }}>
                  <div style={{ fontFamily:"'Lora',serif", fontWeight:700, fontSize:".9rem", textAlign:"right" }}>{fmt(p.price)}</div>
                  <button className="btn btn-forest btn-sm" onClick={() => onBook(p)}>Book Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ─── SCHEDULE ─────────────────────────────────────────────────────────────────

function Schedule({ appointments, setBookingOpen, toast }) {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <div className="topbar">
        <div className="topbar-left"><small>Weekly View</small><h1>Practice <em>Schedule</em></h1></div>
        <div className="topbar-actions">
          <button className="btn btn-icon" aria-label="Previous week">◀</button>
          <button className="btn btn-ghost btn-sm">Mar 17–22, 2026</button>
          <button className="btn btn-icon" aria-label="Next week">▶</button>
          <button className="btn btn-forest" onClick={() => setBookingOpen(true)}>+ Book</button>
        </div>
      </div>

      <div className="card" style={{ animation:"fadeUp .5s ease both" }}>
        <div className="card-bd" style={{ padding:"1rem 1.15rem", overflowX:"auto" }}>
          <div className="cal-grid" style={{ minWidth:620 }}>
            {/* Header */}
            <div className="cal-header">
              <div />
              {DAYS.map((d,i) => (
                <div key={d} className="cal-day-col">
                  <div className="cal-day-name">{d}</div>
                  {i === 2
                    ? <div className="cal-today-num">{DATE_NUMS[i]}</div>
                    : <div className="cal-day-num">{DATE_NUMS[i]}</div>}
                </div>
              ))}
            </div>
            {/* Rows */}
            {HOURS.map((h, hi) => (
              <div key={h} className="cal-row">
                <div className="cal-time-cell">{h}</div>
                {DAYS.map((_, di) => {
                  const appt = appointments.find(a => a.day === di && a.hour === hi);
                  const svc  = appt ? SERVICES_DB.find(s => s.id === appt.serviceId) : null;
                  const pat  = appt ? PATIENTS_DB.find(p => p.id === appt.patientId) : null;
                  return (
                    <div
                      key={di}
                      className={`cal-cell ${appt ? "has-appt" : ""}`}
                      onClick={() => appt && setSelected(appt)}
                      role={appt ? "button" : undefined}
                      tabIndex={appt ? 0 : undefined}
                      aria-label={appt && svc && pat ? `${svc.name} with ${pat.name} at ${h}` : undefined}
                    >
                      {appt && svc && pat && (
                        <div className="appt-chip" style={{ background:svc.color }}>
                          <div className="appt-chip-title">{svc.icon} {pat.name.split(" ")[0]}</div>
                          <div className="appt-chip-sub">{svc.name} · {dur(svc.duration)}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Appointment detail */}
      {selected && (() => {
        const svc = SERVICES_DB.find(s => s.id === selected.serviceId);
        const pat = PATIENTS_DB.find(p => p.id === selected.patientId);
        if (!svc || !pat) return null;
        return (
          <Modal
            open={!!selected}
            onClose={() => setSelected(null)}
            title={`${svc.icon} ${svc.name}`}
            subtitle={`${DAYS[selected.day]}, March ${DATE_NUMS[selected.day]} · ${HOURS[selected.hour]} · ${dur(svc.duration)}`}
            footer={
              <>
                {!selected.paid && <button className="btn btn-gold btn-sm" onClick={() => { toast("Payment marked as received ✓","success"); setSelected(null); }}>Mark Paid</button>}
                <button className="btn btn-ghost btn-sm" onClick={() => { toast(`Reminder sent to ${pat.name.split(" ")[0]} 📱`,"success"); setSelected(null); }}>Send Reminder</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>Close</button>
              </>
            }
          >
            <div style={{ display:"flex", gap:".75rem", marginBottom:".9rem" }}>
              <div style={{ flex:1, background:"var(--cream)", borderRadius:9, padding:".75rem", border:"1.5px solid var(--border)" }}>
                <div style={{ fontSize:".65rem", color:"var(--muted)", fontWeight:700, marginBottom:".3rem", textTransform:"uppercase", letterSpacing:".06em" }}>Patient</div>
                <div style={{ display:"flex", alignItems:"center", gap:".5rem" }}>
                  <Av initials={pat.initials} color={pat.color} size="av-sm" />
                  <div>
                    <div style={{ fontWeight:700, fontSize:".84rem" }}>{pat.name}</div>
                    <div style={{ fontSize:".7rem", color:"var(--muted)" }}>{pat.phone}</div>
                  </div>
                </div>
              </div>
            </div>
            {selected.note && (
              <div style={{ background:"var(--cream)", borderRadius:9, padding:".7rem .9rem", border:"1.5px solid var(--border)", fontSize:".82rem", color:"var(--text2)", marginBottom:".9rem" }}>
                📝 {selected.note}
              </div>
            )}
            <div style={{ display:"flex", gap:".4rem" }}>
              <StatusBadge status={selected.status} />
              <span className={`badge ${selected.paid ? "badge-green" : "badge-rose"}`}>{selected.paid ? "✓ Paid" : `Unpaid · ${fmt(selected.amount)}`}</span>
            </div>
          </Modal>
        );
      })()}
    </>
  );
}

// ─── PATIENTS (PRACTITIONER VIEW) ─────────────────────────────────────────────

function Patients({ appointments, toast, setBookingOpen }) {
  const [selected, setSelected]   = useState(null);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState("all");
  const [newNote, setNewNote]     = useState("");
  const [notes, setNotes]         = useState({
    1: [{ date:"Mar 12", text:"Responding well to low-GI diet. Blood sugar improving.", author:"Dr. Adaeze Obi" }],
  });

  const filtered = PATIENTS_DB.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "active")  return c.status === "active";
    if (filter === "renewal") return c.status === "renewal" || c.remaining === 0;
    if (filter === "new")     return c.status === "new";
    return true;
  });

  const sel = PATIENTS_DB.find(c => c.id === selected);

  const addNote = () => {
    if (!newNote.trim() || !selected) return;
    // HIPAA: notes go to API in production, never to localStorage
    setNotes(prev => ({ ...prev, [selected]: [{ date:"Mar 19", text:newNote, author:"Dr. Adaeze Obi" }, ...(prev[selected] || [])] }));
    setNewNote("");
    toast("Clinical note saved securely ✓", "success");
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-left"><small>Client Management</small><h1>Patients & <em>Packages</em></h1></div>
        <div className="topbar-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => toast("Exporting CSV...","info")}>↓ Export</button>
          <button className="btn btn-forest" onClick={() => toast("Add patient form opening","info")}>+ Add Patient</button>
        </div>
      </div>

      <HipaaBanner text="Patient health records are encrypted at rest. Never share PHI via unsecured channels." />

      <div style={{ display:"flex", gap:".65rem", marginBottom:"1rem", flexWrap:"wrap", animation:"fadeDown .4s ease both" }}>
        <div className="searchbar" style={{ flex:1, minWidth:200 }}>
          <span>🔍</span>
          <input
            placeholder="Search patients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search patients"
          />
          {search && <span style={{ cursor:"pointer" }} onClick={() => setSearch("")}>✕</span>}
        </div>
        <div className="tabs" style={{ margin:0 }}>
          {["all","active","renewal","new"].map(f => (
            <button key={f} className={`tab ${filter===f?"active":""}`} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><EmptyState icon="👤" title="No patients found" desc="Try a different filter or search term." /></div>
      ) : (
        <div className="clients-grid">
          {filtered.map(c => {
            const pct = Math.round(((c.sessions - c.remaining) / c.sessions) * 100);
            return (
              <div
                key={c.id}
                className="client-card"
                onClick={() => setSelected(selected === c.id ? null : c.id)}
                style={{ borderColor: selected === c.id ? "var(--leaf)" : undefined }}
                role="button" tabIndex={0} aria-expanded={selected === c.id}
              >
                <div className="cc-top">
                  <Av initials={c.initials} color={c.color} size="av-lg" />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div className="cc-name">{c.name}</div>
                    <div className="cc-pkg">{c.package}</div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <div className="cc-condition"><span>🩺</span> {c.condition}</div>
                <div className="progress-bar" style={{ marginBottom:".35rem" }}>
                  <div className="progress-fill" style={{ width:`${pct}%` }} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:".68rem", color:"var(--muted)", marginBottom:".45rem" }}>
                  <span>{c.sessions - c.remaining} used</span>
                  <span>{c.remaining} remaining</span>
                </div>
                <div className="cc-footer">
                  <div className="cc-stat">
                    <div className="cc-stat-val">{c.sessions}</div>
                    <div className="cc-stat-lbl">Total</div>
                    <div className="cc-stat-val" style={{ marginLeft:".65rem" }}>{c.remaining}</div>
                    <div className="cc-stat-lbl">Left</div>
                  </div>
                  <span style={{ fontSize:".65rem", color:"var(--soft)" }}>Since {c.joined}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Patient detail panel */}
      {sel && (
        <div className="card" style={{ marginTop:"1.2rem", animation:"slideUp .3s ease both" }}>
          <div className="cd-hero">
            <Av initials={sel.initials} color={sel.color} size="av-xl" />
            <div className="cd-info" style={{ flex:1 }}>
              <h2>{sel.name}</h2>
              <p>{sel.phone} · {sel.email}</p>
              <div className="cd-tags">
                <StatusBadge status={sel.status} />
                <span className="badge badge-earth">🩺 {sel.condition}</span>
                <span className="badge badge-teal">📦 {sel.package}</span>
                <span className="badge badge-muted">Since {sel.joined}</span>
              </div>
            </div>
            <div style={{ display:"flex", gap:".45rem", flexWrap:"wrap" }}>
              <button className="btn btn-ghost btn-sm" onClick={() => toast(`WhatsApp opened for ${sel.name.split(" ")[0]} 📱`,"success")}>📱 WhatsApp</button>
              <button className="btn btn-forest btn-sm" onClick={() => setBookingOpen(true)}>+ Book Session</button>
            </div>
          </div>
          <div className="cd-body">
            <div className="cd-grid">
              {[
                { l:"Package",   v:sel.package },
                { l:"Total",     v:sel.sessions },
                { l:"Used",      v:sel.sessions - sel.remaining },
                { l:"Remaining", v:sel.remaining },
              ].map(({ l, v }) => (
                <div key={l} className="cd-grid-item">
                  <div className="cd-grid-item-lbl">{l}</div>
                  <div className="cd-grid-item-val">{v}</div>
                </div>
              ))}
            </div>

            {/* Appointment history */}
            <div className="cd-section">
              <div className="cd-section-title">📋 Appointment History</div>
              {appointments.filter(a => a.patientId === sel.id).length === 0
                ? <div style={{ fontSize:".8rem", color:"var(--muted)" }}>No appointments yet</div>
                : appointments.filter(a => a.patientId === sel.id).map(a => {
                    const svc = SERVICES_DB.find(s => s.id === a.serviceId);
                    return svc ? (
                      <div key={a.id} style={{ display:"flex", alignItems:"center", gap:".7rem", padding:".55rem .8rem", background:"var(--cream)", border:"1.5px solid var(--border)", borderRadius:9, marginBottom:".4rem" }}>
                        <div style={{ width:8, height:8, borderRadius:"50%", background:svc.color, flexShrink:0 }} />
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:".82rem", fontWeight:600 }}>{svc.name}</div>
                          <div style={{ fontSize:".7rem", color:"var(--muted)" }}>{DAYS[a.day]} · {HOURS[a.hour]}</div>
                        </div>
                        <StatusBadge status={a.status} />
                        <span className={`badge ${a.paid?"badge-green":"badge-rose"}`}>{a.paid?"Paid":fmt(a.amount)}</span>
                      </div>
                    ) : null;
                  })
              }
            </div>

            {/* Clinical notes — HIPAA: in production POSTed to /patients/:id/notes */}
            <div className="cd-section">
              <div className="cd-section-title">📝 Clinical Notes <span style={{ fontSize:".62rem", color:"var(--muted)" }}>(encrypted at rest)</span></div>
              <div style={{ display:"flex", gap:".5rem", marginBottom:".75rem" }}>
                <input
                  className="form-input" style={{ flex:1 }}
                  placeholder="Add a clinical note..."
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addNote()}
                  aria-label="New clinical note"
                />
                <button className="btn btn-leaf btn-sm" onClick={addNote} disabled={!newNote.trim()}>Save</button>
              </div>
              {(notes[sel.id] || []).map((n, i) => (
                <div key={i} className="note-item">
                  <div className="note-header">
                    <span className="note-date">{n.date}</span>
                    <span className="note-author">— {n.author}</span>
                  </div>
                  <div className="note-text">{n.text}</div>
                </div>
              ))}
              {!(notes[sel.id] || []).length && <div style={{ fontSize:".78rem", color:"var(--muted)" }}>No notes yet</div>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── SERVICES ─────────────────────────────────────────────────────────────────

function Services({ toast }) {
  const [filter, setFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const cats = ["all","nutrition","herbal","coaching","group"];
  const filtered = filter === "all" ? SERVICES_DB : SERVICES_DB.filter(s => s.category === filter);

  return (
    <>
      <div className="topbar">
        <div className="topbar-left"><small>Catalogue</small><h1>Services & <em>Treatments</em></h1></div>
        <button className="btn btn-forest" onClick={() => setAddOpen(true)}>+ Add Service</button>
      </div>

      <div className="tabs" style={{ animation:"fadeDown .4s ease both" }}>
        {cats.map(c => (
          <button key={c} className={`tab ${filter===c?"active":""}`} onClick={() => setFilter(c)}>
            {c === "all" ? "All" : c.charAt(0).toUpperCase()+c.slice(1)}
          </button>
        ))}
      </div>

      <div className="services-grid">
        {filtered.map((s,i) => (
          <div key={s.id} className="service-card" style={{ animationDelay:`${i*.06}s`, borderTop:`3px solid ${s.color}` }}>
            <div className="sc-icon" style={{ background:s.color+"22" }}>{s.icon}</div>
            <div className="sc-name">{s.name}</div>
            <div className="sc-desc">{s.desc}</div>
            <div className="sc-footer">
              <div>
                <div className="sc-price">{fmt(s.price)}</div>
                <div className="sc-dur">{dur(s.duration)} session</div>
              </div>
              <div style={{ display:"flex", gap:".35rem" }}>
                <button className="btn btn-ghost btn-xs" onClick={() => toast(`Editing ${s.name}`,"info")}>Edit</button>
                <button className="btn btn-leaf btn-xs"  onClick={() => toast(`Booking ${s.name}`,"info")}>Book</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Service" subtitle="Create a new service or treatment offering">
        <div className="form-group"><label className="form-label">Service Name</label><input className="form-input" placeholder="e.g. Initial Wellness Consultation" /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Duration (minutes)</label><input className="form-input" type="number" placeholder="60" /></div>
          <div className="form-group"><label className="form-label">Price (₦)</label><input className="form-input" type="number" placeholder="15000" /></div>
        </div>
        <div className="form-group"><label className="form-label">Category</label>
          <select className="form-select">
            {cats.filter(c=>c!=="all").map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" placeholder="Describe what this service includes..." /></div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:".5rem", marginTop:"1rem" }}>
          <button className="btn btn-ghost" onClick={() => setAddOpen(false)}>Cancel</button>
          <button className="btn btn-forest" onClick={() => { setAddOpen(false); toast("Service added successfully ✓","success"); }}>Add Service</button>
        </div>
      </Modal>
    </>
  );
}

// ─── REVENUE ──────────────────────────────────────────────────────────────────

function Revenue({ appointments }) {
  const paid       = appointments.filter(a => a.paid);
  const total      = appointments.reduce((s,a) => s+a.amount, 0);
  const collected  = paid.reduce((s,a) => s+a.amount, 0);
  const outstanding = total - collected;

  return (
    <>
      <div className="topbar">
        <div className="topbar-left"><small>Finance</small><h1>Revenue & <em>Payments</em></h1></div>
        <button className="btn btn-ghost btn-sm">↓ Export Report</button>
      </div>

      <div className="stats-row">
        {[
          { l:"Total Billed",     v:fmt(total),      icon:"💳", bg:"#e8f2e8" },
          { l:"Collected",        v:fmt(collected),  icon:"✅", bg:"#e8f5e9" },
          { l:"Outstanding",      v:fmt(outstanding), icon:"⏳", bg:"#fceef4" },
          { l:"Avg per Session",  v:fmt(Math.round(total/appointments.length)), icon:"📊", bg:"#f0eef8" },
        ].map((s,i) => (
          <div key={i} className="stat" style={{ animationDelay:`${i*.06}s` }}>
            <div className="stat-header">
              <span className="stat-label">{s.l}</span>
              <div className="stat-icon-wrap" style={{ background:s.bg }}>{s.icon}</div>
            </div>
            <div className="stat-val" style={{ fontSize:"1.35rem" }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Monthly chart */}
      <div className="card" style={{ marginBottom:"1rem", animation:"fadeUp .4s ease both" }}>
        <div className="card-hd">
          <div className="card-hd-icon" style={{ background:"#fdf0e0" }}>📈</div>
          <div><h3>Monthly Revenue</h3><p>March 2026</p></div>
        </div>
        <div className="card-bd">
          <div style={{ display:"flex", alignItems:"flex-end", gap:".5rem", height:80, marginBottom:".5rem" }}>
            {[65,80,55,90,75,100,85,95,70,88,62,78].map((v,i) => (
              <div key={i} style={{ flex:1, height:`${v}%`, background:v===100?"var(--leaf)":"var(--leaf-light)", border:"1px solid var(--leaf)", borderRadius:"4px 4px 0 0", transition:"all .3s", cursor:"pointer" }}
                onMouseEnter={e=>e.target.style.background="var(--leaf)"}
                onMouseLeave={e=>e.target.style.background=v===100?"var(--leaf)":"var(--leaf-light)"}
              />
            ))}
          </div>
          <div style={{ display:"flex", gap:".5rem" }}>
            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(m=>(
              <div key={m} style={{ flex:1, textAlign:"center", fontSize:".6rem", color:"var(--muted)", fontWeight:600 }}>{m}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Payments table */}
      <div className="card" style={{ animation:"fadeUp .5s .1s ease both", animationFillMode:"both" }}>
        <div className="card-hd">
          <div className="card-hd-icon" style={{ background:"#e4f2f5" }}>💳</div>
          <div><h3>Recent Payments</h3></div>
        </div>
        <div>
          {appointments.map(a => {
            const svc = SERVICES_DB.find(s => s.id === a.serviceId);
            const pat = PATIENTS_DB.find(p => p.id === a.patientId);
            if (!svc || !pat) return null;
            return (
              <div key={a.id} className="payment-row">
                <Av initials={pat.initials} color={pat.color} size="av-sm" />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:".83rem", fontWeight:600 }}>{pat.name}</div>
                  <div style={{ fontSize:".7rem", color:"var(--muted)" }}>{svc.name} · {DAYS[a.day]}, March {DATE_NUMS[a.day]}</div>
                </div>
                <div style={{ fontFamily:"'Lora',serif", fontWeight:700, fontSize:".9rem" }}>{fmt(a.amount)}</div>
                <span className={`badge ${a.paid?"badge-green":"badge-rose"}`}>{a.paid?"Paid":"Unpaid"}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── HEALTH TRACKING ──────────────────────────────────────────────────────────

function HealthTracking({ toast }) {
  const [period, setPeriod] = useState("7d");
  const [logOpen, setLogOpen] = useState(false);
  const [logForm, setLogForm] = useState({ weight:"", glucose:"", mood:"", sleep:"" });

  const maxWeight = Math.max(...HEALTH_LOGS.map(l => l.weight));

  return (
    <>
      <div className="topbar">
        <div className="topbar-left"><small>My Health</small><h1>Health <em>Tracking</em></h1></div>
        <div className="topbar-actions">
          <div className="tabs" style={{ margin:0 }}>
            {["7d","30d","90d"].map(p => (
              <button key={p} className={`tab ${period===p?"active":""}`} onClick={() => setPeriod(p)}>{p}</button>
            ))}
          </div>
          <button className="btn btn-forest" onClick={() => setLogOpen(true)}>+ Log Entry</button>
        </div>
      </div>

      <HipaaBanner text="Your health data is end-to-end encrypted. Only you and your practitioners can access these records." />

      {/* Metric cards */}
      <div className="metric-cards">
        {HEALTH_METRICS.map((m,i) => (
          <div key={i} className="metric-card" style={{ animationDelay:`${i*.06}s`, animation:"fadeUp .4s ease both", animationFillMode:"both" }}>
            <div className="metric-icon">{m.icon}</div>
            <div className="metric-val">{m.val}</div>
            <div className="metric-unit">{m.unit}</div>
            <div className="metric-lbl">{m.label}</div>
            <div style={{ fontSize:".68rem", color:"var(--leaf)", fontWeight:600, marginTop:".25rem" }}>{m.trend}</div>
          </div>
        ))}
      </div>

      {/* Weight trend chart */}
      <div className="card" style={{ marginBottom:"1rem", animation:"fadeUp .5s .1s ease both", animationFillMode:"both" }}>
        <div className="card-hd">
          <div className="card-hd-icon" style={{ background:"#e8f2e8" }}>⚖️</div>
          <div><h3>Weight Trend</h3><p>Past 7 days</p></div>
        </div>
        <div className="card-bd">
          <div className="chart-bar-wrap" style={{ height:90, marginBottom:".35rem" }}>
            {HEALTH_LOGS.map((l,i) => (
              <div key={i} className="chart-bar-item">
                <div
                  className="chart-bar-bar"
                  style={{ height:`${((l.weight - 77.5) / (maxWeight - 77.5)) * 100}%`, minHeight:8 }}
                  title={`${l.weight}kg`}
                />
                <div className="chart-bar-lbl">{l.day}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:".72rem", color:"var(--muted)" }}>
            <span>Start: 79.2 kg</span>
            <span style={{ color:"var(--leaf)", fontWeight:700 }}>Now: 78.2 kg (-1.0 kg)</span>
          </div>
        </div>
      </div>

      {/* Goals progress */}
      <div className="card" style={{ animation:"fadeUp .5s .15s ease both", animationFillMode:"both" }}>
        <div className="card-hd">
          <div className="card-hd-icon" style={{ background:"#f0eef8" }}>🎯</div>
          <div><h3>Health Goals</h3><p>Set during onboarding</p></div>
        </div>
        <div className="card-bd">
          {[
            { label:"Reach target weight (76 kg)",   progress:65, icon:"⚖️" },
            { label:"Blood glucose < 5.5 mmol/L",    progress:42, icon:"💉" },
            { label:"8h sleep consistently",          progress:80, icon:"😴" },
            { label:"10,000 steps daily",             progress:55, icon:"🚶" },
            { label:"Reduce stress (HRV > 45)",       progress:90, icon:"🧘" },
            { label:"Drink 2.5L water daily",         progress:70, icon:"💧" },
          ].map((g,i) => (
            <div key={i} style={{ marginBottom:".9rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:".3rem" }}>
                <div style={{ fontSize:".82rem", fontWeight:500 }}>{g.icon} {g.label}</div>
                <div style={{ fontSize:".78rem", fontWeight:700, color:g.progress>=70?"var(--leaf)":"var(--gold)" }}>{g.progress}%</div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width:`${g.progress}%`, background: g.progress >= 70 ? "linear-gradient(90deg,var(--leaf),var(--forest3))" : "linear-gradient(90deg,var(--gold),var(--earth))" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Log entry modal */}
      <Modal
        open={logOpen}
        onClose={() => setLogOpen(false)}
        title="📊 Log Health Entry"
        subtitle="Your data is encrypted and stored securely"
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setLogOpen(false)}>Cancel</button>
            <button className="btn btn-forest btn-sm" onClick={() => { setLogOpen(false); toast("Health entry saved ✓","success"); }}>Save Entry</button>
          </>
        }
      >
        <div className="form-row">
          <div className="form-group"><label className="form-label">Weight (kg)</label><input className="form-input" type="number" step=".1" placeholder="78.2" value={logForm.weight} onChange={e=>setLogForm(p=>({...p,weight:e.target.value}))} /></div>
          <div className="form-group"><label className="form-label">Blood Glucose (mmol/L)</label><input className="form-input" type="number" step=".1" placeholder="6.1" value={logForm.glucose} onChange={e=>setLogForm(p=>({...p,glucose:e.target.value}))} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Mood (1–10)</label><input className="form-input" type="number" min="1" max="10" placeholder="8" value={logForm.mood} onChange={e=>setLogForm(p=>({...p,mood:e.target.value}))} /></div>
          <div className="form-group"><label className="form-label">Sleep (hours)</label><input className="form-input" type="number" step=".5" placeholder="7.5" value={logForm.sleep} onChange={e=>setLogForm(p=>({...p,sleep:e.target.value}))} /></div>
        </div>
        <div className="form-group"><label className="form-label">Notes (optional)</label><textarea className="form-textarea" placeholder="How are you feeling today?" /></div>
      </Modal>
    </>
  );
}

// ─── MESSAGING ────────────────────────────────────────────────────────────────

function Messaging({ user, toast }) {
  const [activeConv, setActiveConv] = useState(1);
  const [draft, setDraft]           = useState("");
  const [messages, setMessages]     = useState(MESSAGES_DB);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const conversations = [
    { id:1, name:"Dr. Adaeze Obi",  initials:"AO", color:"#5a8a5a", lastMsg:"That's wonderful to hear.", time:"9:34am", unread:0 },
    { id:2, name:"Ngozi Afolabi",   initials:"NA", color:"#7a6aaa", lastMsg:"Our session is tomorrow at 2pm", time:"Yesterday", unread:1 },
    { id:3, name:"Funmi Adeyemi",   initials:"FA", color:"#c97d4e", lastMsg:"I'll send the protocol doc", time:"Mon", unread:0 },
  ];

  const threadMessages = messages.filter(m =>
    (m.fromId === 1 && activeConv === 1) ||
    (m.fromId === 3 && activeConv === 2) ||
    m.fromId === 0
  ).filter((_, i) => i < 3);

  const sendMessage = () => {
    if (!draft.trim()) return;
    setMessages(prev => [...prev, { id:Date.now(), from:"Me", fromId:0, text:draft, time:"now", initials:user?.initials||"ME", color:user?.color||"#3a5a3a" }]);
    setDraft("");
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-left"><small>Secure Messaging</small><h1>Messages</h1></div>
      </div>

      <HipaaBanner text="Messages are end-to-end encrypted. Files are stored securely — never in your browser." />

      <div className="card" style={{ overflow:"hidden" }}>
        <div className="msg-layout">
          {/* Conversation list */}
          <div className="conv-list">
            {conversations.map(c => (
              <div
                key={c.id}
                className={`conv-item ${activeConv===c.id?"active":""}`}
                onClick={() => setActiveConv(c.id)}
                role="button" tabIndex={0}
                aria-current={activeConv===c.id}
              >
                <Av initials={c.initials} color={c.color} size="av-md" online />
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="conv-name">{c.name}</div>
                  <div className="conv-preview">{c.lastMsg}</div>
                </div>
                <div>
                  <div className="conv-time">{c.time}</div>
                  {c.unread > 0 && <div className="conv-unread">{c.unread}</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Thread */}
          <div className="msg-thread">
            <div className="msg-thread-header">
              {(() => { const c = conversations.find(c=>c.id===activeConv); return c ? (
                <>
                  <Av initials={c.initials} color={c.color} size="av-sm" online />
                  <div>
                    <div style={{ fontWeight:700, fontSize:".85rem" }}>{c.name}</div>
                    <div style={{ fontSize:".68rem", color:"var(--leaf)" }}>Online</div>
                  </div>
                  <div style={{ marginLeft:"auto", display:"flex", gap:".35rem" }}>
                    <button className="btn btn-ghost btn-xs" onClick={() => toast("File attachment dialog","info")}>📎</button>
                    <button className="btn btn-ghost btn-xs" onClick={() => toast("Video call (v2 feature)","info")}>📹</button>
                  </div>
                </>
              ) : null; })()}
            </div>

            <div className="msg-thread-body">
              {threadMessages.map(m => (
                <div key={m.id} className={`msg-bubble-wrap ${m.fromId===0?"own":""}`}>
                  {m.fromId !== 0 && <Av initials={m.initials} color={m.color} size="av-xs" />}
                  <div>
                    {m.fromId !== 0 && <div className="msg-time">{m.time}</div>}
                    <div className={`msg-bubble ${m.fromId===0?"own":"other"}`}>{m.text}</div>
                    {m.fromId === 0 && <div className="msg-time" style={{ textAlign:"right" }}>{m.time}</div>}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="msg-input-area">
              <input
                className="msg-input"
                placeholder="Type a secure message..."
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                aria-label="Message input"
              />
              <button className="btn btn-forest btn-sm" onClick={sendMessage} disabled={!draft.trim()}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

function NotificationsView({ notifs, setNotifs, toast }) {
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read:true })));

  return (
    <>
      <div className="topbar">
        <div className="topbar-left"><small>Activity</small><h1>Notifications</h1></div>
        <div className="topbar-actions">
          <button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark all read</button>
        </div>
      </div>

      <div className="card" style={{ animation:"fadeUp .4s ease both" }}>
        <div className="card-hd">
          <div className="card-hd-icon" style={{ background:"#fdf0e0" }}>🔔</div>
          <div><h3>All Notifications</h3><p>{notifs.filter(n=>!n.read).length} unread</p></div>
        </div>
        {notifs.length === 0 ? (
          <EmptyState icon="🔔" title="No notifications" desc="You're all caught up!" />
        ) : notifs.map(n => (
          <div
            key={n.id}
            className={`notif-item ${n.read?"":"unread"}`}
            onClick={() => setNotifs(prev => prev.map(x => x.id===n.id ? {...x,read:true} : x))}
            role="button" tabIndex={0}
          >
            <div className="notif-icon-wrap" style={{ background:n.bg }}>{n.icon}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div className="notif-title">{n.title}</div>
              <div className="notif-body">{n.body}</div>
              <div className="notif-time">{n.time}</div>
            </div>
            {!n.read && <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--leaf)", flexShrink:0, marginTop:4 }} />}
          </div>
        ))}
      </div>
    </>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────

function AdminPanel({ view, toast }) {
  const [tab, setTab] = useState(view === "admin-verif" ? "verif" : view === "admin-users" ? "users" : "overview");

  const pendingVerif = PRACTITIONERS_DB.filter(p => p.id <= 2);

  return (
    <>
      <div className="topbar">
        <div className="topbar-left"><small>Admin Console</small><h1>Platform <em>Management</em></h1></div>
        <span className="badge badge-plum">Admin Access</span>
      </div>

      <div className="tabs">
        {[["overview","📊 Overview"],["users","👥 Users"],["verif","🛡️ Verification Queue"],["stats","📈 Stats"]].map(([id,label]) => (
          <button key={id} className={`tab ${tab===id?"active":""}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div className="stats-row">
            {[
              { l:"Total Users",       v:"1,284", icon:"👥", bg:"#e8f2e8", trend:"+48 this week" },
              { l:"Active Bookings",   v:"312",   icon:"📅", bg:"#f0eef8", trend:"89% confirmed" },
              { l:"Platform Revenue",  v:"₦4.2M", icon:"💰", bg:"#fdf0e0", trend:"March 2026" },
              { l:"Pending Verif.",    v:"4",     icon:"🛡️", bg:"#fceef4", trend:"Needs review" },
            ].map((s,i) => (
              <div key={i} className="stat" style={{ animationDelay:`${i*.07}s` }}>
                <div className="stat-header">
                  <span className="stat-label">{s.l}</span>
                  <div className="stat-icon-wrap" style={{ background:s.bg }}>{s.icon}</div>
                </div>
                <div className="stat-val">{s.v}</div>
                <div className="stat-trend">{s.trend}</div>
              </div>
            ))}
          </div>
          <div className="card" style={{ animation:"fadeUp .4s .1s ease both", animationFillMode:"both" }}>
            <div className="card-hd">
              <div className="card-hd-icon" style={{ background:"#fceef4" }}>🛡️</div>
              <div><h3>Pending Verifications</h3><p>Practitioners awaiting approval</p></div>
              <div className="card-hd-actions"><button className="btn btn-ghost btn-xs" onClick={() => setTab("verif")}>View all →</button></div>
            </div>
            <div className="card-bd">
              {pendingVerif.map(p => (
                <div key={p.id} className="verif-card">
                  <div style={{ display:"flex", alignItems:"center", gap:".75rem", marginBottom:".65rem" }}>
                    <Av initials={p.initials} color={p.color} size="av-md" />
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:".88rem" }}>{p.name}</div>
                      <div style={{ fontSize:".72rem", color:"var(--muted)" }}>{p.role}</div>
                    </div>
                    <span className="badge badge-gold">Pending</span>
                  </div>
                  <div style={{ display:"flex", gap:".45rem" }}>
                    <button className="btn btn-ghost btn-xs" onClick={() => toast("Viewing credentials...","info")}>📄 View Docs</button>
                    <button className="btn btn-leaf btn-xs" onClick={() => toast(`✓ ${p.name} verified`,"success")}>✓ Approve</button>
                    <button className="btn btn-danger btn-xs" onClick={() => toast(`${p.name} rejected`,"error")}>✕ Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === "users" && (
        <div className="card" style={{ animation:"fadeUp .4s ease both" }}>
          <div className="card-hd">
            <div className="card-hd-icon" style={{ background:"#e8f2e8" }}>👥</div>
            <div><h3>All Users</h3><p>1,284 total</p></div>
            <div className="card-hd-actions">
              <div className="searchbar" style={{ width:220 }}>
                <span>🔍</span>
                <input placeholder="Search users..." aria-label="Search users" />
              </div>
            </div>
          </div>
          <div>
            {[...PATIENTS_DB, ...PRACTITIONERS_DB.slice(0,2)].map((u, i) => (
              <div key={i} className="admin-user-row">
                <Av initials={u.initials} color={u.color} size="av-sm" />
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:".84rem" }}>{u.name}</div>
                  <div style={{ fontSize:".7rem", color:"var(--muted)" }}>{u.email || "practitioner@email.com"}</div>
                </div>
                <span className={`badge ${u.role?"badge-plum":"badge-teal"}`}>{u.role?"Practitioner":"Patient"}</span>
                <StatusBadge status={u.status||"active"} />
                <button className="btn btn-ghost btn-xs" onClick={() => toast("Opening user profile","info")}>View</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "verif" && (
        <>
          <div className="card" style={{ animation:"fadeUp .4s ease both" }}>
            <div className="card-hd">
              <div className="card-hd-icon" style={{ background:"#fceef4" }}>🛡️</div>
              <div><h3>Verification Queue</h3><p>4 practitioners pending review</p></div>
            </div>
            <div className="card-bd">
              {PRACTITIONERS_DB.map(p => (
                <div key={p.id} className="verif-card">
                  <div style={{ display:"flex", alignItems:"center", gap:".75rem", marginBottom:".65rem" }}>
                    <Av initials={p.initials} color={p.color} size="av-lg" />
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:".9rem" }}>{p.name}</div>
                      <div style={{ fontSize:".73rem", color:"var(--muted)" }}>{p.role}</div>
                      <div style={{ fontSize:".7rem", color:"var(--muted)", marginTop:".15rem" }}>Applied: March 10, 2026</div>
                    </div>
                    {p.verified ? <span className="verified-badge">✓ Already Verified</span> : <span className="badge badge-gold">🕐 Pending Review</span>}
                  </div>
                  <div style={{ display:"flex", gap:".4rem", flexWrap:"wrap" }}>
                    <button className="btn btn-ghost btn-xs" onClick={() => toast("Viewing credentials document","info")}>📄 Credentials</button>
                    <button className="btn btn-ghost btn-xs" onClick={() => toast("Viewing CAC certificate","info")}>🏛️ CAC Cert</button>
                    <button className="btn btn-leaf btn-xs" onClick={() => toast(`✓ ${p.name} approved`,"success")}>✓ Approve</button>
                    <button className="btn btn-danger btn-xs" onClick={() => toast(`${p.name} rejected`,"error")}>✕ Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === "stats" && (
        <div className="card" style={{ animation:"fadeUp .4s ease both" }}>
          <div className="card-hd">
            <div className="card-hd-icon" style={{ background:"#e8f2e8" }}>📈</div>
            <div><h3>Platform Statistics</h3><p>March 2026</p></div>
          </div>
          <div className="card-bd">
            {[
              { l:"Daily Active Users (DAU)", v:"284", trend:"+12% vs last week" },
              { l:"Sessions Booked",          v:"1,048", trend:"+8% vs last month" },
              { l:"Avg Session Rating",        v:"4.8/5.0", trend:"Stable" },
              { l:"Practitioner Utilisation",  v:"76%", trend:"+4% vs last month" },
              { l:"Patient Retention Rate",    v:"82%", trend:"Strong" },
              { l:"Average Response Time",     v:"< 2hr", trend:"Within SLA" },
            ].map((s,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:".75rem 0", borderBottom:"1px solid var(--border)" }}>
                <div style={{ fontSize:".83rem", color:"var(--text2)" }}>{s.l}</div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"'Lora',serif", fontWeight:700, fontSize:".95rem" }}>{s.v}</div>
                  <div style={{ fontSize:".68rem", color:"var(--leaf)" }}>{s.trend}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────

function Settings({ user, toast }) {
  const [tab, setTab] = useState("profile");
  const navItems = [
    ["profile",  "👤 Profile"],
    ["notifs",   "🔔 Notifications"],
    ["security", "🔒 Security"],
    ...(user?.role === "practitioner" ? [["practice","🌿 Practice"]] : []),
    ["data",     "📁 My Data"],
  ];

  return (
    <>
      <div className="topbar">
        <div className="topbar-left"><small>Account</small><h1>Settings & <em>Profile</em></h1></div>
      </div>

      <div className="settings-grid">
        {/* Side nav */}
        <div className="settings-nav">
          {navItems.map(([id,label]) => (
            <div
              key={id}
              className={`settings-nav-item ${tab===id?"active":""}`}
              onClick={() => setTab(id)}
              role="button" tabIndex={0}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Content */}
        <div>
          {tab === "profile" && (
            <div className="card">
              <div className="card-hd"><div className="card-hd-icon" style={{ background:"#e8f2e8" }}>👤</div><div><h3>Profile Information</h3></div></div>
              <div className="card-bd">
                <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1.5rem" }}>
                  <Av initials={user?.initials||"ME"} color={user?.color||"#5a8a5a"} size="av-xxl" />
                  <div>
                    <button className="btn btn-ghost btn-sm" onClick={() => toast("Photo upload dialog","info")}>Change Photo</button>
                    <div className="form-hint">JPG or PNG, max 2MB</div>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">First Name</label><input className="form-input" defaultValue={user?.name?.split(" ")[0]} /></div>
                  <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" defaultValue={user?.name?.split(" ").slice(1).join(" ")} /></div>
                </div>
                <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" defaultValue={user?.email} /></div>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-input" defaultValue="+234 800 000 0000" /></div>
                <button className="btn btn-forest btn-sm" onClick={() => toast("Profile updated ✓","success")}>Save Changes</button>
              </div>
            </div>
          )}

          {tab === "notifs" && (
            <div className="card">
              <div className="card-hd"><div className="card-hd-icon" style={{ background:"#fdf0e0" }}>🔔</div><div><h3>Notification Preferences</h3></div></div>
              <div className="card-bd">
                {[
                  "Appointment confirmations & reminders",
                  "New messages from practitioners",
                  "AI match recommendations",
                  "Review requests after sessions",
                  "Platform announcements",
                  "Billing & payment notifications",
                ].map((label, i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:".7rem 0", borderBottom:"1px solid var(--border)" }}>
                    <div style={{ fontSize:".84rem" }}>{label}</div>
                    <div style={{ display:"flex", gap:".5rem" }}>
                      {["Email","WhatsApp","In-app"].map(ch => (
                        <label key={ch} style={{ display:"flex", alignItems:"center", gap:".25rem", fontSize:".72rem", color:"var(--muted)", cursor:"pointer" }}>
                          <input type="checkbox" defaultChecked style={{ accentColor:"var(--leaf)" }} /> {ch}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button className="btn btn-forest btn-sm" style={{ marginTop:"1rem" }} onClick={() => toast("Preferences saved ✓","success")}>Save Preferences</button>
              </div>
            </div>
          )}

          {tab === "security" && (
            <div className="card">
              <div className="card-hd"><div className="card-hd-icon" style={{ background:"#fceef4" }}>🔒</div><div><h3>Security Settings</h3></div></div>
              <div className="card-bd">
                <div style={{ marginBottom:"1.5rem" }}>
                  <div style={{ fontWeight:700, fontSize:".88rem", marginBottom:".9rem" }}>Change Password</div>
                  <div className="form-group"><label className="form-label">Current Password</label><input className="form-input" type="password" placeholder="••••••••" /></div>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">New Password</label><input className="form-input" type="password" placeholder="Min 12 characters" /></div>
                    <div className="form-group"><label className="form-label">Confirm New Password</label><input className="form-input" type="password" placeholder="••••••••" /></div>
                  </div>
                  <button className="btn btn-forest btn-sm" onClick={() => toast("Password updated ✓","success")}>Update Password</button>
                </div>
                <hr className="divider" />
                <div>
                  <div style={{ fontWeight:700, fontSize:".88rem", marginBottom:".5rem" }}>Active Sessions</div>
                  <div style={{ fontSize:".78rem", color:"var(--muted)", marginBottom:".9rem" }}>You are logged in from 1 device</div>
                  <button className="btn btn-danger btn-sm" onClick={() => toast("All other sessions signed out","success")}>Sign out all other devices</button>
                </div>
              </div>
            </div>
          )}

          {tab === "data" && (
            <div className="card">
              <div className="card-hd"><div className="card-hd-icon" style={{ background:"#e4f2f5" }}>📁</div><div><h3>My Data (NDPR / GDPR)</h3></div></div>
              <div className="card-bd">
                <div style={{ fontSize:".83rem", color:"var(--text2)", lineHeight:1.6, marginBottom:"1.2rem" }}>
                  You have the right to access, export, and delete your personal data under Nigeria's NDPR and applicable data protection regulations.
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:".6rem" }}>
                  <button className="btn btn-ghost btn-sm" style={{ justifyContent:"flex-start" }} onClick={() => toast("Data export request submitted — you'll receive an email within 48hrs","success")}>📤 Request Data Export</button>
                  <button className="btn btn-ghost btn-sm" style={{ justifyContent:"flex-start" }} onClick={() => toast("Correction request submitted","success")}>✏️ Request Data Correction</button>
                  <button className="btn btn-danger btn-sm" style={{ justifyContent:"flex-start" }} onClick={() => toast("Account deletion request submitted — you'll receive a confirmation email","info")}>🗑️ Request Account Deletion</button>
                </div>
              </div>
            </div>
          )}

          {tab === "practice" && (
            <div className="card">
              <div className="card-hd"><div className="card-hd-icon" style={{ background:"#e8f2e8" }}>🌿</div><div><h3>Practice Settings</h3></div></div>
              <div className="card-bd">
                <div className="form-group"><label className="form-label">Consultation Fee (₦)</label><input className="form-input" defaultValue="15000" /></div>
                <div className="form-group"><label className="form-label">Session Duration (minutes)</label><input className="form-input" defaultValue="60" /></div>
                <div className="form-group"><label className="form-label">Buffer between appointments (minutes)</label><input className="form-input" defaultValue="15" /></div>
                <div className="form-group"><label className="form-label">Payout Account (Bank Name)</label><input className="form-input" placeholder="GTBank" /></div>
                <button className="btn btn-forest btn-sm" onClick={() => toast("Practice settings saved ✓","success")}>Save Settings</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── BOOKING WIZARD ───────────────────────────────────────────────────────────

function BookingWizard({ onClose, toast, prefillPractitioner }) {
  const [step, setStep] = useState(1);
  const [sel, setSel]   = useState({
    service: null, practitioner: prefillPractitioner || null,
    day: null, hour: null, note: ""
  });

  const steps = ["Service","Practitioner","Date","Time","Confirm"];

  const book = () => {
    onClose();
    toast("Session booked! Confirmation sent via WhatsApp & email ✓","success");
  };

  return (
    <div>
      {/* Progress dots */}
      <div className="step-indicator" style={{ justifyContent:"center", marginBottom:"1.25rem" }}>
        {steps.map((s,i) => (
          <div key={i} className={`step-dot ${i+1===step?"active":i+1<step?"done":""}`} title={s} />
        ))}
      </div>
      <div style={{ textAlign:"center", fontSize:".72rem", color:"var(--muted)", fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", marginBottom:"1.1rem" }}>
        Step {step} of {steps.length}: {steps[step-1]}
      </div>

      {/* Step 1 — Service */}
      {step === 1 && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:".55rem", marginBottom:"1rem" }}>
            {SERVICES_DB.map(s => (
              <div
                key={s.id}
                onClick={() => setSel(prev => ({ ...prev, service:s }))}
                style={{
                  padding:".75rem .85rem", borderRadius:10,
                  border:`2px solid ${sel.service?.id===s.id?"var(--leaf)":"var(--border)"}`,
                  background:sel.service?.id===s.id?"var(--leaf-light)":"#fdfcfa",
                  cursor:"pointer", transition:"all .18s",
                }}
              >
                <div style={{ fontSize:"1.1rem", marginBottom:".3rem" }}>{s.icon}</div>
                <div style={{ fontSize:".8rem", fontWeight:700 }}>{s.name}</div>
                <div style={{ fontSize:".68rem", color:"var(--muted)", margin:".12rem 0" }}>{dur(s.duration)}</div>
                <div style={{ fontFamily:"'Lora',serif", fontWeight:700, fontSize:".85rem", color:"var(--forest)" }}>{fmt(s.price)}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <button className="btn btn-forest" disabled={!sel.service} onClick={() => setStep(2)}>Next →</button>
          </div>
        </>
      )}

      {/* Step 2 — Practitioner */}
      {step === 2 && (
        <>
          <div style={{ display:"flex", flexDirection:"column", gap:".5rem", marginBottom:"1rem" }}>
            {PRACTITIONERS_DB.map(p => (
              <div
                key={p.id}
                onClick={() => setSel(prev => ({ ...prev, practitioner:p }))}
                style={{
                  display:"flex", alignItems:"center", gap:".75rem", padding:".75rem .9rem",
                  borderRadius:10, border:`2px solid ${sel.practitioner?.id===p.id?"var(--leaf)":"var(--border)"}`,
                  background:sel.practitioner?.id===p.id?"var(--leaf-light)":"#fdfcfa",
                  cursor:"pointer", transition:"all .18s",
                }}
              >
                <Av initials={p.initials} color={p.color} size="av-md" />
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:".85rem" }}>{p.name}</div>
                  <div style={{ fontSize:".72rem", color:"var(--muted)" }}>{p.role} · ⭐ {p.rating}</div>
                </div>
                <span className="badge badge-green">{p.availability}</span>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-forest btn-sm" disabled={!sel.practitioner} onClick={() => setStep(3)}>Next →</button>
          </div>
        </>
      )}

      {/* Step 3 — Date */}
      {step === 3 && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:".5rem", marginBottom:"1rem" }}>
            {DAYS.map((d,i) => (
              <div
                key={d}
                onClick={() => setSel(prev => ({ ...prev, day:i, hour:null }))}
                style={{
                  textAlign:"center", padding:".75rem .5rem", borderRadius:10,
                  border:`2px solid ${sel.day===i?"var(--leaf)":"var(--border)"}`,
                  background:sel.day===i?"var(--leaf-light)":"#fdfcfa",
                  cursor:"pointer", transition:"all .18s",
                }}
              >
                <div style={{ fontSize:".72rem", fontWeight:700, color:"var(--muted)", marginBottom:".2rem", textTransform:"uppercase", letterSpacing:".06em" }}>{d}</div>
                <div style={{ fontFamily:"'Lora',serif", fontSize:"1.1rem", fontWeight:700 }}>Mar {DATE_NUMS[i]}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setStep(2)}>← Back</button>
            <button className="btn btn-forest btn-sm" disabled={sel.day === null} onClick={() => setStep(4)}>Next →</button>
          </div>
        </>
      )}

      {/* Step 4 — Time */}
      {step === 4 && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:".45rem", marginBottom:"1rem" }}>
            {HOURS.map((h,hi) => (
              <button
                key={h}
                className={`btn ${sel.hour===hi?"btn-forest":"btn-ghost"} btn-sm`}
                style={{ justifyContent:"center" }}
                onClick={() => setSel(prev => ({ ...prev, hour:hi }))}
              >
                {h}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setStep(3)}>← Back</button>
            <button className="btn btn-forest btn-sm" disabled={sel.hour === null} onClick={() => setStep(5)}>Next →</button>
          </div>
        </>
      )}

      {/* Step 5 — Confirm */}
      {step === 5 && sel.service && sel.practitioner && (
        <>
          <div className="booking-summary">
            {[
              ["Service",      `${sel.service.icon} ${sel.service.name}`],
              ["Practitioner", sel.practitioner.name],
              ["Date & Time",  sel.day !== null && sel.hour !== null ? `${DAYS[sel.day]}, March ${DATE_NUMS[sel.day]} · ${HOURS[sel.hour]}` : "—"],
              ["Duration",     dur(sel.service.duration)],
              ["Amount",       fmt(sel.service.price)],
            ].map(([l,v]) => (
              <div key={l} className="bs-row">
                <span className="bs-label">{l}</span>
                <span className="bs-val">{v}</span>
              </div>
            ))}
          </div>
          <div className="form-group">
            <label className="form-label">Session notes (optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Any specific concerns or goals for this session..."
              value={sel.note}
              onChange={e => setSel(prev => ({ ...prev, note:e.target.value }))}
            />
          </div>
          <div className="wa-hint" style={{ marginBottom:".9rem" }}>
            <span>📱</span> WhatsApp confirmation will be sent to both parties
          </div>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setStep(4)}>← Back</button>
            <button className="btn btn-forest btn-sm" onClick={book}>✓ Confirm Booking</button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── AUTH SCREENS ─────────────────────────────────────────────────────────────

function AuthScreen({ onLogin }) {
  const [mode, setMode]         = useState("login"); // login | register
  const [role, setRole]         = useState("patient");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const { login } = useAuth();
  const toast = useToast();

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter email and password"); return; }
    setError(""); setLoading(true);
    try {
      const user = await login(email, password, role);
      toast(`Welcome back, ${user.name.split(" ")[0]}! 🌿`,"success");
      onLogin(user);
    } catch {
      setError("Invalid credentials. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-shell">
      {/* Left panel */}
      <div className="auth-panel-left">
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:"3.5rem", marginBottom:"1rem" }}>🌿</div>
          <h1 style={{ fontFamily:"'Lora',serif", fontSize:"2rem", fontWeight:700, marginBottom:".5rem" }}>
            Herbit <em style={{ fontStyle:"italic", color:"#a8d4a8" }}>Habitat</em>
          </h1>
          <p style={{ color:"rgba(255,255,255,.6)", fontSize:".9rem", marginBottom:"2rem", lineHeight:1.7 }}>
            A HIPAA-conscious marketplace connecting patients with verified natural healthcare practitioners.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:".7rem", textAlign:"left" }}>
            {[
              ["✨","AI-powered practitioner matching"],
              ["🔒","End-to-end encrypted health records"],
              ["📅","Seamless appointment booking"],
              ["📊","Integrated health tracking"],
            ].map(([icon,text]) => (
              <div key={text} style={{ display:"flex", alignItems:"center", gap:".65rem", fontSize:".85rem", color:"rgba(255,255,255,.7)" }}>
                <span>{icon}</span> {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-panel-right">
        <div className="auth-form-box">
          <div className="auth-logo">
            <h2>Herbit <em>Habitat</em></h2>
            <p>Rooted in nature, guided by science</p>
          </div>

          {mode === "login" ? (
            <>
              <div className="auth-title">Sign in</div>
              <div className="auth-sub">Access your wellness platform</div>

              {/* Role selector for demo */}
              <div className="role-selector" style={{ marginBottom:"1rem" }}>
                {[
                  { id:"patient",      icon:"🌿", label:"Patient",       desc:"Book & track health" },
                  { id:"practitioner", icon:"🩺", label:"Practitioner",  desc:"Manage your practice" },
                  { id:"admin",        icon:"🛡️", label:"Admin",         desc:"Platform management" },
                ].map(r => (
                  <div
                    key={r.id}
                    className={`role-option ${role===r.id?"selected":""}`}
                    onClick={() => setRole(r.id)}
                    role="radio" aria-checked={role===r.id} tabIndex={0}
                  >
                    <div className="role-option-icon">{r.icon}</div>
                    <div className="role-option-label">{r.label}</div>
                    <div className="role-option-desc">{r.desc}</div>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label">Email address</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key==="Enter" && handleLogin()}
                  autoComplete="email"
                  aria-label="Email address"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Min 12 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key==="Enter" && handleLogin()}
                  autoComplete="current-password"
                  aria-label="Password"
                />
              </div>
              {error && <div className="form-error" style={{ marginBottom:".75rem" }}>⚠️ {error}</div>}

              <button
                className="btn btn-forest"
                style={{ width:"100%", justifyContent:"center", padding:".7rem" }}
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? <><Spinner /> Signing in...</> : "Sign In →"}
              </button>

              <div className="auth-divider">or</div>
              <div style={{ textAlign:"center", fontSize:".8rem", color:"var(--muted)" }}>
                Don't have an account?{" "}
                <span style={{ color:"var(--leaf)", fontWeight:700, cursor:"pointer" }} onClick={() => setMode("register")}>
                  Create one
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="auth-title">Create account</div>
              <div className="auth-sub">Join Herbit Habitat</div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">First Name</label><input className="form-input" placeholder="Chiamaka" /></div>
                <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" placeholder="Osei" /></div>
              </div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="you@example.com" /></div>
              <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" placeholder="Min 12 characters" /></div>
              <div className="form-group">
                <label className="form-label">I am joining as</label>
                <select className="form-select" value={role} onChange={e=>setRole(e.target.value)}>
                  <option value="patient">Patient — I want to find a practitioner</option>
                  <option value="practitioner">Practitioner — I want to manage my practice</option>
                </select>
              </div>
              <div className="hipaa-banner" style={{ marginBottom:".9rem", fontSize:".72rem" }}>
                <span>🔒</span> Your data is protected. No PHI stored locally. HIPAA-conscious design.
              </div>
              <button className="btn btn-forest" style={{ width:"100%", justifyContent:"center" }} onClick={() => { setMode("login"); }}>
                Create Account →
              </button>
              <div style={{ textAlign:"center", fontSize:".8rem", color:"var(--muted)", marginTop:".85rem" }}>
                Already have an account?{" "}
                <span style={{ color:"var(--leaf)", fontWeight:700, cursor:"pointer" }} onClick={() => setMode("login")}>Sign in</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────

function AppContent() {
  const { user } = useAuth();
  const toast = useToast();

  const [view, setView]               = useState(() => null); // derived from role on login
  const [appointments, setAppointments] = useState(APPOINTMENTS_DB);
  const [notifs, setNotifs]           = useState(NOTIFICATIONS_DB);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingPrac, setBookingPrac] = useState(null);
  const [notifDrawer, setNotifDrawer] = useState(false);

  // Set initial view based on role
  useEffect(() => {
    if (!user) return;
    const defaultViews = { patient:"p-dashboard", practitioner:"pr-dashboard", admin:"admin-dash" };
    setView(defaultViews[user.role] || "p-dashboard");
  }, [user]);

  const handleBook = (prac = null) => {
    setBookingPrac(prac);
    setBookingOpen(true);
  };

  const unreadCount = notifs.filter(n => !n.read).length;

  if (!user) {
    return <AuthScreen onLogin={() => {}} />;
  }

  // Render the correct view
  const renderView = () => {
    switch(view) {
      case "pr-dashboard":   return <PractitionerDashboard appointments={appointments} setView={setView} setBookingOpen={setBookingOpen} toast={toast} />;
      case "p-dashboard":    return <PatientDashboard setView={setView} toast={toast} />;
      case "discover":       return <Discovery onBook={handleBook} toast={toast} />;
      case "p-match":        return <AIMatching onBook={handleBook} toast={toast} />;
      case "schedule":       return <Schedule appointments={appointments} setBookingOpen={() => setBookingOpen(true)} toast={toast} />;
      case "patients":       return <Patients appointments={appointments} toast={toast} setBookingOpen={() => setBookingOpen(true)} />;
      case "services":       return <Services toast={toast} />;
      case "revenue":        return <Revenue appointments={appointments} />;
      case "messages":       return <Messaging user={user} toast={toast} />;
      case "p-health":       return <HealthTracking toast={toast} />;
      case "notifications":  return <NotificationsView notifs={notifs} setNotifs={setNotifs} toast={toast} />;
      case "settings":       return <Settings user={user} toast={toast} />;
      case "p-appointments": return <Schedule appointments={appointments} setBookingOpen={() => setBookingOpen(true)} toast={toast} />;
      case "admin-dash":
      case "admin-users":
      case "admin-verif":
      case "admin-stats":    return <AdminPanel view={view} toast={toast} />;
      default:               return <div style={{ padding:"2rem", color:"var(--muted)" }}>Page coming soon...</div>;
    }
  };

  return (
    <div className="shell">
      {/* Sidebar */}
      <Sidebar
        user={user}
        view={view}
        setView={setView}
        notifCount={unreadCount}
        onNotif={() => setNotifDrawer(true)}
      />

      {/* Topbar notification bell — floats over main */}
      <div style={{ position:"fixed", top:"1rem", right:"1.5rem", zIndex:150, display:"flex", gap:".5rem", alignItems:"center" }}>
        <div className="notif-bell">
          <button className="btn btn-icon" onClick={() => setNotifDrawer(true)} aria-label="Notifications">
            🔔
          </button>
          {unreadCount > 0 && <div className="notif-count">{unreadCount}</div>}
        </div>
        <div className="notif-bell">
          <button className="btn btn-icon" style={{ fontSize:".75rem", width:"auto", borderRadius:"100px", padding:".35rem .7rem" }}
            onClick={() => { if (window.confirm("Sign out?")) window.location.reload(); }}
            aria-label="Sign out"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="main" role="main" id="main-content">
        {renderView()}
      </main>

      {/* Booking modal */}
      <Modal
        open={bookingOpen}
        onClose={() => { setBookingOpen(false); setBookingPrac(null); }}
        title="🌿 Book a Session"
        subtitle="Schedule an appointment in 5 steps"
        wide
      >
        <BookingWizard
          prefillPractitioner={bookingPrac}
          onClose={() => { setBookingOpen(false); setBookingPrac(null); }}
          toast={toast}
        />
      </Modal>

      {/* Notification drawer */}
      {notifDrawer && (
        <>
          <div className="modal-overlay" onClick={() => setNotifDrawer(false)} style={{ background:"transparent" }} />
          <div className="notif-drawer">
            <div className="notif-drawer-header">
              <h3>Notifications</h3>
              <div style={{ display:"flex", gap:".5rem", alignItems:"center" }}>
                <button className="btn btn-ghost btn-xs" onClick={() => setNotifs(prev => prev.map(n=>({...n,read:true})))}>Mark all read</button>
                <button className="btn btn-icon btn-sm" onClick={() => setNotifDrawer(false)} aria-label="Close">✕</button>
              </div>
            </div>
            <div className="notif-list">
              {notifs.map(n => (
                <div
                  key={n.id}
                  className={`notif-item ${n.read?"":"unread"}`}
                  onClick={() => setNotifs(prev => prev.map(x => x.id===n.id?{...x,read:true}:x))}
                  role="button" tabIndex={0}
                >
                  <div className="notif-icon-wrap" style={{ background:n.bg }}>{n.icon}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-body">{n.body}</div>
                    <div className="notif-time">{n.time}</div>
                  </div>
                  {!n.read && <div style={{ width:8,height:8,borderRadius:"50%",background:"var(--leaf)",flexShrink:0,marginTop:4 }} />}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── ENTRY POINT ──────────────────────────────────────────────────────────────

export default function App() {
  return (
    <>
      <style>{CSS}</style>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </>
  );
}
