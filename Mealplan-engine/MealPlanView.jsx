/**
 * MEAL PLAN ENRICHMENT ENGINE — Patient-Facing Interactive View
 * ================================================================
 * "Sanctu-Tech" design system per spec.
 * Renders two payload shapes: item_type "MEAL" | "HERBAL_PRODUCT"
 *
 * HIPAA NOTE: The spec calls for LocalStorage persistence of checklist
 * progress. HerbitHabitat's existing architecture explicitly forbids
 * writing health-adjacent state to disk (see HIPAA GUARDRAILS in the
 * host app). Dietary/herbal-regimen adherence data is health data, so
 * this component keeps progress in memory only and syncs to the API
 * on each toggle (mocked here via onSyncProgress). This is a deliberate
 * deviation from the literal spec to keep the app's guardrails intact —
 * flagging it rather than silently building the localStorage version.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";

// ─── MOCK PAYLOADS (matches the API contract in the spec) ────────────────────

const MEAL_PAYLOAD = {
  id: "plan_982734918",
  item_type: "MEAL",
  food_name: "Jollof Fonio with Grilled Salmon",
  banner_image_url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1200&q=80&auto=format&fit=crop",
  description: "A low-glycemic, fibre-rich alternative to traditional rice using native West African ancient grains, finished with omega-rich grilled salmon. Built for steady blood sugar and an unhurried evening.",
  servings: 2,
  prep_time_min: 35,
  nutritional_value: { calories: 420, protein_g: 35, fiber_g: 12, carbs_g: 45 },
  important_notes: [
    "Excellent for managing Type-2 diabetes.",
    "⚠️ Do not consume if taking blood pressure medication before bed.",
  ],
  ingredients: [
    { id: "i1", name: "Fonio Grain", amount: "1 Cup", image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&q=80&auto=format&fit=crop" },
    { id: "i2", name: "Salmon Fillet", amount: "2 pcs (150g)", image_url: "https://images.unsplash.com/photo-1499125562588-29fb8a56b5d5?w=300&q=80&auto=format&fit=crop" },
    { id: "i3", name: "Scotch Bonnet", amount: "1 whole", image_url: "https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=300&q=80&auto=format&fit=crop" },
    { id: "i4", name: "Fresh Tomatoes", amount: "3 medium", image_url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&q=80&auto=format&fit=crop" },
    { id: "i5", name: "Red Onion", amount: "1 large", image_url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&q=80&auto=format&fit=crop" },
    { id: "i6", name: "Garlic & Ginger", amount: "2 tbsp paste", image_url: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=300&q=80&auto=format&fit=crop" },
  ],
  recipe_steps: [
    { step_number: 1, instruction: "Gently rinse the fonio grain under cold running water to remove excess starch.", action_image_url: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&q=80&auto=format&fit=crop", voice_transcript: "Rinse one cup of fonio grain under cold running water." },
    { step_number: 2, instruction: "Blend tomatoes, scotch bonnet, onion, garlic and ginger into a smooth base.", action_image_url: "https://images.unsplash.com/photo-1599909533144-eb7d4a982044?w=500&q=80&auto=format&fit=crop", voice_transcript: "Blend the tomatoes, scotch bonnet, onion, garlic and ginger into a smooth base." },
    { step_number: 3, instruction: "Pat the salmon fillets dry, season lightly, and sear skin-side down for 4 minutes.", action_image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&q=80&auto=format&fit=crop", voice_transcript: "Pat the salmon dry, season it, and sear skin side down for four minutes." },
    { step_number: 4, instruction: "Simmer the blended base for 12 minutes until it deepens in colour and the oil separates.", action_image_url: "https://images.unsplash.com/photo-1604152135912-04a022e23696?w=500&q=80&auto=format&fit=crop", voice_transcript: "Simmer the sauce for twelve minutes until the oil separates." },
    { step_number: 5, instruction: "Fold the rinsed fonio into the sauce, cover, and steam on low heat for 8 minutes.", action_image_url: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&q=80&auto=format&fit=crop", voice_transcript: "Fold the fonio into the sauce, cover, and steam on low heat for eight minutes." },
    { step_number: 6, instruction: "Plate the fonio jollof and top with the grilled salmon. Serve warm.", action_image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&q=80&auto=format&fit=crop", voice_transcript: "Plate the fonio jollof and top it with the grilled salmon." },
  ],
  enrichment_library: {
    videos: [{ title: "How to fluff fonio without clumping", duration: "2:14" }],
    articles: [{ title: "Why ancient grains help with glucose response" }],
  },
};

const HERBAL_PAYLOAD = {
  id: "plan_771122334",
  item_type: "HERBAL_PRODUCT",
  food_name: "Zobo & Ginger Infusion",
  banner_image_url: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=1200&q=80&auto=format&fit=crop",
  package_image_url: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&q=80&auto=format&fit=crop",
  brewed_image_url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&q=80&auto=format&fit=crop",
  description: "A cooling hibiscus infusion layered with ginger and clove, traditionally used to support healthy blood pressure and ease digestion after meals.",
  servings: 4,
  prep_time_min: 20,
  nutritional_value: { calories: 35, protein_g: 0, fiber_g: 1, carbs_g: 8 },
  important_notes: [
    "Naturally caffeine-free — safe for evening consumption.",
    "⚠️ May lower blood pressure further. Space at least 2 hours from antihypertensive medication.",
  ],
  ingredients: [
    { id: "h1", name: "Dried Hibiscus (Zobo Leaves)", amount: "2 Cups", image_url: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=300&q=80&auto=format&fit=crop" },
    { id: "h2", name: "Fresh Ginger", amount: "1 thumb-size", image_url: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=300&q=80&auto=format&fit=crop" },
    { id: "h3", name: "Whole Cloves", amount: "4 pieces", image_url: "https://images.unsplash.com/photo-1599909533144-eb7d4a982044?w=300&q=80&auto=format&fit=crop" },
  ],
  recipe_steps: [
    { step_number: 1, instruction: "Rinse the dried hibiscus leaves once to remove dust and debris.", action_image_url: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&q=80&auto=format&fit=crop", voice_transcript: "Rinse the dried hibiscus leaves once to remove dust." },
    { step_number: 2, instruction: "Bring 1.5 litres of water to a rolling boil, then remove from direct heat.", action_image_url: "https://images.unsplash.com/photo-1604152135912-04a022e23696?w=500&q=80&auto=format&fit=crop", voice_transcript: "Bring one point five litres of water to a rolling boil, then remove from heat." },
    { step_number: 3, instruction: "Steep the hibiscus, ginger and cloves for exactly 15 minutes, covered.", action_image_url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80&auto=format&fit=crop", voice_transcript: "Steep the hibiscus, ginger and cloves for exactly fifteen minutes, covered." },
    { step_number: 4, instruction: "Filter through a fine sieve or muslin cloth into a clean jug.", action_image_url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80&auto=format&fit=crop", voice_transcript: "Filter through a fine sieve into a clean jug." },
    { step_number: 5, instruction: "Chill for at least 1 hour before serving over ice.", action_image_url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80&auto=format&fit=crop", voice_transcript: "Chill for at least one hour before serving over ice." },
  ],
  enrichment_library: {
    videos: [{ title: "Reading a proper zobo steep colour", duration: "1:48" }],
    articles: [{ title: "Hibiscus and blood pressure: what the evidence says" }],
  },
};

// ─── DESIGN TOKENS (scoped CSS, injected once) ────────────────────────────────

const MP_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

.mp-root {
  --mp-canvas: #FBF9F6;
  --mp-canvas2: #F4F0E8;
  --mp-charcoal: #1E2220;
  --mp-charcoal2: #3A413D;
  --mp-muted: #7C8680;
  --mp-forest: #0A3C26;
  --mp-forest-light: #E4ECE7;
  --mp-sage: #8FA89B;
  --mp-sage-light: #EEF2EF;
  --mp-amber: #C8893D;
  --mp-amber-light: #FBF0DF;
  --mp-amber-border: #E8C99A;
  --mp-gold: #D4A95E;
  --mp-card: #FFFFFF;
  --mp-border: #E9E3D8;
  --mp-shadow: 0 8px 28px rgba(20,30,24,.07);
  --mp-shadow-md: 0 16px 44px rgba(20,30,24,.12);
  --mp-r: 22px;
  --mp-r-lg: 28px;
  --mp-ease: cubic-bezier(.4,0,.2,1);

  font-family: 'DM Sans', sans-serif;
  background: var(--mp-canvas);
  color: var(--mp-charcoal);
  max-width: 560px;
  margin: 0 auto;
  position: relative;
}

.mp-root * { box-sizing: border-box; }
.mp-serif { font-family: 'Playfair Display', serif; }

@keyframes mpFadeUp { from { opacity:0; transform:translateY(10px);} to { opacity:1; transform:translateY(0);} }
@keyframes mpFadeIn { from { opacity:0;} to { opacity:1;} }
@keyframes mpPulseRing {
  0%   { box-shadow: 0 0 0 0 rgba(10,60,38,.35); }
  70%  { box-shadow: 0 0 0 10px rgba(10,60,38,0); }
  100% { box-shadow: 0 0 0 0 rgba(10,60,38,0); }
}
@keyframes mpDrift { from { transform: scale(1.04) translateX(0); } to { transform: scale(1.1) translateX(-2%); } }
@keyframes mpCheckPop { 0% { transform: scale(1); } 40% { transform: scale(1.18); } 100% { transform: scale(1); } }
@keyframes mpBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
@keyframes mpWave {
  0%,100% { transform: scaleY(.4); }
  50% { transform: scaleY(1); }
}

/* ── Block 1: Hero ── */
.mp-hero { position: relative; width: 100%; aspect-ratio: 16/9; overflow: hidden; }
.mp-hero img { width:100%; height:100%; object-fit:cover; display:block; }
.mp-hero-overlay {
  position:absolute; inset:0;
  background: linear-gradient(180deg, rgba(10,16,12,0) 35%, rgba(10,16,12,.7) 100%);
}
.mp-hero-back {
  position:absolute; top:1rem; left:1rem; width:38px; height:38px; border-radius:50%;
  background:rgba(251,249,246,.92); display:flex; align-items:center; justify-content:center;
  font-size:1rem; color:var(--mp-charcoal); border:none; cursor:pointer; backdrop-filter:blur(4px);
}
.mp-hero-type-tag {
  position:absolute; top:1rem; right:1rem; background:rgba(251,249,246,.92);
  color:var(--mp-forest); font-size:.68rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase;
  padding:.35rem .75rem; border-radius:100px; backdrop-filter:blur(4px);
}
.mp-hero-caption {
  position:absolute; bottom:1rem; left:1.25rem; right:1.25rem; color:#fff;
}
.mp-hero-caption .mp-eyebrow { color:rgba(255,255,255,.75); }

/* ── Split-frame package image (herbal mode) ── */
.mp-split-frame { display:flex; gap:2px; aspect-ratio:16/9; overflow:hidden; }
.mp-split-frame > div { flex:1; position:relative; overflow:hidden; }
.mp-split-frame img { width:100%; height:100%; object-fit:cover; display:block; }
.mp-split-label {
  position:absolute; bottom:.6rem; left:.6rem; background:rgba(30,34,32,.65); color:#fff;
  font-size:.62rem; font-weight:700; letter-spacing:.06em; text-transform:uppercase;
  padding:.25rem .6rem; border-radius:100px; backdrop-filter:blur(3px);
}

.mp-section { padding: 1.5rem 1.25rem; }
.mp-section-tight { padding: 0 1.25rem; }
.mp-eyebrow {
  font-size:.66rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase;
  color: var(--mp-sage); margin-bottom:.4rem; display:flex; align-items:center; gap:.4rem;
}

/* ── Block 2/3: Ingredient rail ── */
.mp-rail { display:flex; gap:.7rem; overflow-x:auto; padding: 0 1.25rem 1.25rem; scroll-snap-type:x proximity; }
.mp-rail::-webkit-scrollbar { display:none; }
.mp-ing-card {
  scroll-snap-align:start; flex-shrink:0; width:108px; border-radius:var(--mp-r);
  overflow:hidden; background:var(--mp-card); box-shadow:var(--mp-shadow); border:1px solid var(--mp-border);
}
.mp-ing-img { width:100%; height:88px; object-fit:cover; display:block; }
.mp-ing-meta { padding:.55rem .6rem .65rem; }
.mp-ing-amount { font-weight:700; font-size:.74rem; color:var(--mp-charcoal); line-height:1.25; }
.mp-ing-name { font-size:.66rem; color:var(--mp-muted); margin-top:.1rem; }

/* ── Block 4/5: Title + description ── */
.mp-title { font-size:1.7rem; font-weight:700; line-height:1.15; color:var(--mp-charcoal); margin-bottom:.6rem; }
.mp-desc { font-size:.9rem; line-height:1.65; color:var(--mp-charcoal2); }
.mp-meta-row { display:flex; gap:.6rem; margin-top:1rem; flex-wrap:wrap; }
.mp-meta-chip {
  display:inline-flex; align-items:center; gap:.35rem; background:var(--mp-sage-light);
  color:var(--mp-forest); font-size:.72rem; font-weight:600; padding:.35rem .7rem; border-radius:100px;
}

/* ── Block 6/7: Steps ── */
.mp-steps { display:flex; flex-direction:column; gap:.85rem; }
.mp-step {
  background:var(--mp-card); border-radius:var(--mp-r-lg); border:1.5px solid var(--mp-border);
  overflow:hidden; transition: all .35s var(--mp-ease); position:relative;
}
.mp-step.done { opacity:.6; }
.mp-step.active {
  border-color: var(--mp-forest);
  box-shadow: var(--mp-shadow-md);
  transform: scale(1.015);
}
.mp-step-img-wrap { width:100%; aspect-ratio:16/8; overflow:hidden; position:relative; }
.mp-step-img { width:100%; height:100%; object-fit:cover; display:block; transform:scale(1.04); transition:transform 6s linear; }
.mp-step.active .mp-step-img { animation: mpDrift 7s linear forwards; }
.mp-step-num-badge {
  position:absolute; top:.65rem; left:.65rem; background:rgba(251,249,246,.93);
  color:var(--mp-forest); font-family:'Playfair Display',serif; font-weight:700; font-size:.85rem;
  width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center;
  backdrop-filter:blur(3px);
}
.mp-step.active .mp-step-num-badge { background:var(--mp-forest); color:#fff; animation: mpPulseRing 2s ease infinite; }
.mp-step-body { display:flex; align-items:flex-start; gap:.75rem; padding:.95rem 1.05rem; }
.mp-step-text { flex:1; font-size:.86rem; line-height:1.55; color:var(--mp-charcoal2); transition: opacity .3s var(--mp-ease); }
.mp-step.done .mp-step-text { text-decoration: line-through; opacity:.55; }
.mp-checkbox {
  flex-shrink:0; width:26px; height:26px; border-radius:8px; border:2px solid var(--mp-sage);
  display:flex; align-items:center; justify-content:center; cursor:pointer; background:#fff;
  transition: all .2s var(--mp-ease); margin-top:.05rem;
}
.mp-checkbox.checked { background:var(--mp-forest); border-color:var(--mp-forest); animation: mpCheckPop .3s var(--mp-ease); }
.mp-checkbox.checked svg { animation: mpFadeIn .2s ease both; }
.mp-checkbox:focus-visible { outline: 2px solid var(--mp-forest); outline-offset: 2px; }

/* ── Voice FAB ── */
.mp-voice-fab {
  position: sticky; bottom: 1rem; margin: .5rem 1.25rem 0; z-index: 20;
  display:flex; align-items:center; justify-content:center; gap:.55rem;
  background: var(--mp-forest); color:#fff; font-weight:700; font-size:.82rem;
  padding:.85rem 1.25rem; border-radius:100px; border:none; cursor:pointer;
  box-shadow: 0 10px 30px rgba(10,60,38,.35); width:calc(100% - 2.5rem);
  transition: all .25s var(--mp-ease);
}
.mp-voice-fab.live { background: var(--mp-charcoal); }
.mp-voice-fab:active { transform: scale(.98); }
.mp-voice-bars { display:flex; align-items:center; gap:2px; height:14px; }
.mp-voice-bars span { width:3px; background:#fff; border-radius:2px; height:100%; animation: mpWave 1s ease-in-out infinite; }
.mp-voice-bars span:nth-child(2) { animation-delay:.15s; }
.mp-voice-bars span:nth-child(3) { animation-delay:.3s; }
.mp-voice-status {
  text-align:center; font-size:.7rem; color:var(--mp-muted); margin: .55rem 1.25rem 0; min-height: 1.2em;
}

/* ── Block 8: Macro rings ── */
.mp-macro-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:.6rem; }
.mp-macro-item { display:flex; flex-direction:column; align-items:center; gap:.5rem; }
.mp-macro-ring {
  width:58px; height:58px; border-radius:50%; display:flex; align-items:center; justify-content:center;
  border: 3px solid var(--mp-border); position:relative; background: var(--mp-card);
}
.mp-macro-ring-fill {
  position:absolute; inset:-3px; border-radius:50%;
  background: conic-gradient(var(--mp-gold) calc(var(--pct) * 1%), transparent 0);
  mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
}
.mp-macro-val { font-family:'Playfair Display',serif; font-weight:700; font-size:.92rem; color:var(--mp-charcoal); z-index:1; }
.mp-macro-label { font-size:.66rem; color:var(--mp-muted); font-weight:600; text-align:center; }

/* ── Block 9: Enrichment ── */
.mp-enrich-list { display:flex; flex-direction:column; gap:.5rem; }
.mp-enrich-row {
  display:flex; align-items:center; gap:.75rem; background:var(--mp-card); border:1.5px solid var(--mp-border);
  border-radius:16px; padding:.75rem .9rem; cursor:pointer; transition: border-color .2s;
}
.mp-enrich-row:hover { border-color: var(--mp-sage); }
.mp-enrich-icon {
  width:36px; height:36px; border-radius:11px; background:var(--mp-sage-light); color:var(--mp-forest);
  display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0;
}
.mp-enrich-title { font-size:.82rem; font-weight:600; color:var(--mp-charcoal); }
.mp-enrich-sub { font-size:.68rem; color:var(--mp-muted); margin-top:.1rem; }

/* ── Block 10/11: Servings + warnings ── */
.mp-servings-tag {
  display:inline-flex; align-items:center; gap:.4rem; background:var(--mp-canvas2);
  border:1.5px solid var(--mp-border); padding:.4rem .8rem; border-radius:100px;
  font-size:.78rem; font-weight:700; color:var(--mp-charcoal);
}
.mp-warning-card {
  background: var(--mp-amber-light); border:1.5px solid var(--mp-amber-border); border-radius: var(--mp-r);
  padding: 1rem 1.1rem;
}
.mp-warning-row { display:flex; gap:.6rem; align-items:flex-start; font-size:.82rem; line-height:1.55; color:var(--mp-charcoal2); }
.mp-warning-row + .mp-warning-row { margin-top:.55rem; }

/* ── Block 12: Outsource module ── */
.mp-outsource {
  background: linear-gradient(135deg, var(--mp-forest) 0%, #0d4a2e 100%);
  border-radius: var(--mp-r-lg); padding: 1.4rem 1.3rem; color:#fff; position:relative; overflow:hidden;
}
.mp-outsource::before {
  content:''; position:absolute; top:-30%; right:-15%; width:220px; height:220px; border-radius:50%;
  background: radial-gradient(circle, rgba(143,168,155,.35), transparent 70%);
}
.mp-outsource-icon { font-size:1.6rem; margin-bottom:.6rem; }
.mp-outsource-title { font-family:'Playfair Display',serif; font-size:1.05rem; font-weight:700; margin-bottom:.4rem; }
.mp-outsource-copy { font-size:.82rem; color:rgba(255,255,255,.78); line-height:1.55; margin-bottom:1.1rem; max-width:340px; }
.mp-outsource-btn {
  background:#fff; color:var(--mp-forest); border:none; font-weight:700; font-size:.82rem;
  padding:.7rem 1.1rem; border-radius:100px; cursor:pointer; display:inline-flex; align-items:center; gap:.4rem;
  transition: transform .2s var(--mp-ease);
}
.mp-outsource-btn:hover { transform: translateY(-1px); }

/* ── Vendor sheet ── */
.mp-vendor-row {
  display:flex; align-items:center; gap:.75rem; padding:.8rem; background:var(--mp-card);
  border:1.5px solid var(--mp-border); border-radius:16px; margin-bottom:.55rem;
}
.mp-vendor-avatar { width:42px; height:42px; border-radius:12px; flex-shrink:0; object-fit:cover; }
.mp-vendor-name { font-size:.84rem; font-weight:700; color:var(--mp-charcoal); }
.mp-vendor-meta { font-size:.7rem; color:var(--mp-muted); margin-top:.1rem; }
.mp-vendor-price { font-family:'Playfair Display',serif; font-weight:700; font-size:.85rem; color:var(--mp-charcoal); }
.mp-vendor-cta {
  background:var(--mp-forest); color:#fff; border:none; font-size:.7rem; font-weight:700;
  padding:.45rem .75rem; border-radius:100px; cursor:pointer; flex-shrink:0;
}

.mp-toast {
  position: fixed; bottom: 1.25rem; left:50%; transform:translateX(-50%); z-index:300;
  background: var(--mp-charcoal); color:#fff; font-size:.78rem; font-weight:500;
  padding:.7rem 1.1rem; border-radius:100px; box-shadow:var(--mp-shadow-md);
  display:flex; align-items:center; gap:.5rem; animation: mpFadeUp .3s var(--mp-ease) both;
  max-width: calc(100% - 2.5rem); text-align:center;
}

.mp-divider { height:1px; background: var(--mp-border); margin: 0 1.25rem; }
.mp-section-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:.85rem; }
.mp-section-head h3 { font-size:.95rem; font-weight:700; }

@media (max-width: 420px) {
  .mp-macro-grid { gap:.4rem; }
  .mp-macro-ring { width:50px; height:50px; }
}
`;

// ─── HELPERS ───────────────────────────────────────────────────────────────────

function vibrate(pattern = 12) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch (_) { /* unsupported, no-op */ }
  }
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M3 8.5L6.2 11.5L13 4.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── MACRO RING ────────────────────────────────────────────────────────────────

function MacroRing({ value, label, pct }) {
  return (
    <div className="mp-macro-item">
      <div className="mp-macro-ring">
        <div className="mp-macro-ring-fill" style={{ "--pct": pct }} />
        <span className="mp-macro-val">{value}</span>
      </div>
      <span className="mp-macro-label">{label}</span>
    </div>
  );
}

// ─── VOICE MODE HOOK ───────────────────────────────────────────────────────────
// Wraps Web Speech API (recognition + synthesis) with graceful fail-safes per
// spec deliverable #2: mic-denied or unsupported browsers silently disable
// voice mode with a toast, without breaking the touch UI.

function useVoiceCookingMode({ steps, doneSteps, onCheckStep, notify }) {
  const [active, setActive] = useState(false);
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const activeRef = useRef(false);
  const supported = useRef(
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition) &&
    window.speechSynthesis
  );

  // BUGFIX (stale closure): the SpeechRecognition instance is created once
  // per voice-mode session and its onresult handler is bound at that single
  // moment. If that handler reads activeStepIdx / doneSteps / steps directly
  // from the closure, those values freeze at session-start forever — saying
  // "repeat step" after advancing through several steps would still replay
  // step 1. We keep a ref with the latest values so the (stable, never
  // rebound) onresult handler always reads current state.
  const liveRef = useRef({ steps, doneSteps, onCheckStep, activeStepIdx });
  useEffect(() => {
    liveRef.current = { steps, doneSteps, onCheckStep, activeStepIdx };
  }, [steps, doneSteps, onCheckStep, activeStepIdx]);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.98;
    window.speechSynthesis.speak(u);
  }, []);

  const speakStep = useCallback((idx) => {
    const { steps: liveSteps } = liveRef.current;
    const step = liveSteps[idx];
    if (!step) {
      speak("That's the last step. Your dish is ready.");
      return;
    }
    speak(`Step ${step.step_number}. ${step.voice_transcript || step.instruction}`);
  }, [speak]);

  const advance = useCallback(() => {
    const { steps: liveSteps, doneSteps: liveDone, onCheckStep: liveOnCheck } = liveRef.current;
    setActiveStepIdx(prev => {
      const cur = liveSteps[prev];
      if (cur && !liveDone.has(cur.step_number)) liveOnCheck(cur.step_number);
      const next = prev + 1;
      if (next < liveSteps.length) {
        speakStep(next);
        return next;
      }
      speak("All steps complete. Enjoy your meal.");
      return prev;
    });
  }, [speakStep, speak]);

  const repeatCurrent = useCallback(() => {
    speakStep(liveRef.current.activeStepIdx);
  }, [speakStep]);

  const startRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return false;
    try {
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onresult = (e) => {
        const transcript = Array.from(e.results)
          .slice(e.resultIndex)
          .map(r => r[0].transcript.toLowerCase())
          .join(" ");
        if (transcript.includes("next")) {
          advance();
        } else if (transcript.includes("repeat")) {
          repeatCurrent();
        }
      };
      rec.onerror = () => {
        // Mic denied / network drop — fail gracefully, don't kill touch UI.
        setListening(false);
        notify("Voice mode paused — switched back to tap controls.", "warning");
      };
      rec.onend = () => {
        // BUGFIX: was checking `active` (stale closed-over state) — use the
        // ref so this always reflects whether voice mode is *currently* on,
        // not whether it was on when this onend callback was first created.
        if (recognitionRef.current && activeRef.current) {
          try { rec.start(); } catch (_) { /* already starting */ }
        }
      };
      rec.start();
      recognitionRef.current = rec;
      setListening(true);
      return true;
    } catch (_) {
      return false;
    }
  }, [advance, repeatCurrent, notify]);

  const stopRecognition = useCallback(() => {
    activeRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }
    setListening(false);
    window.speechSynthesis?.cancel();
  }, []);

  const toggle = useCallback(() => {
    if (active) {
      stopRecognition();
      setActive(false);
      return;
    }
    if (!supported.current) {
      notify("Voice mode isn't supported on this browser — use tap controls instead.", "warning");
      return;
    }
    activeRef.current = true;
    setActive(true);
    const ok = startRecognition();
    if (!ok) {
      activeRef.current = false;
      notify("Couldn't access the microphone — using tap controls instead.", "warning");
      setActive(false);
      return;
    }
    speakStep(liveRef.current.activeStepIdx);
  }, [active, startRecognition, stopRecognition, speakStep, notify]);

  useEffect(() => () => stopRecognition(), [stopRecognition]);

  return { active, listening, activeStepIdx, setActiveStepIdx, toggle, speakStep };
}

// ─── INGREDIENT RAIL ───────────────────────────────────────────────────────────

function IngredientRail({ ingredients }) {
  return (
    <div className="mp-rail" role="list" aria-label="Ingredients">
      {ingredients.map(ing => (
        <div className="mp-ing-card" key={ing.id} role="listitem">
          <img className="mp-ing-img" src={ing.image_url} alt={ing.name} loading="lazy" />
          <div className="mp-ing-meta">
            <div className="mp-ing-amount">{ing.amount}</div>
            <div className="mp-ing-name">{ing.name}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── RECIPE STEP CARD ──────────────────────────────────────────────────────────

function StepCard({ step, isDone, isActive, onToggle }) {
  return (
    <div className={`mp-step ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}>
      <div className="mp-step-img-wrap">
        <img className="mp-step-img" src={step.action_image_url} alt={`Step ${step.step_number}`} loading="lazy" />
        <div className="mp-step-num-badge">{step.step_number}</div>
      </div>
      <div className="mp-step-body">
        <p className="mp-step-text">{step.instruction}</p>
        <button
          className={`mp-checkbox ${isDone ? "checked" : ""}`}
          onClick={onToggle}
          aria-pressed={isDone}
          aria-label={`Mark step ${step.step_number} ${isDone ? "incomplete" : "complete"}`}
        >
          {isDone && <CheckIcon />}
        </button>
      </div>
    </div>
  );
}

// ─── OUTSOURCE / DELIVERY SHEET (Block 12) ────────────────────────────────────

const CHEF_VENDORS = [
  { name: "Leafy Plate Kitchen", meta: "1.2km · 25–35 min", price: "₦6,500", img: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=120&q=80&auto=format&fit=crop" },
  { name: "Root & Grain Co.", meta: "2.0km · 30–40 min", price: "₦7,200", img: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=120&q=80&auto=format&fit=crop" },
  { name: "The Wellness Pot", meta: "0.8km · 20–30 min", price: "₦6,000", img: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=120&q=80&auto=format&fit=crop" },
];

const HERBAL_VENDORS = [
  { name: "Greenleaf Apothecary", meta: "0.6km · Open now", price: "₦2,800", img: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=120&q=80&auto=format&fit=crop" },
  { name: "Native Roots Pharmacy", meta: "1.4km · Open now", price: "₦3,100", img: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=120&q=80&auto=format&fit=crop" },
];

function OutsourceSheet({ open, onClose, isHerbal, notify }) {
  if (!open) return null;
  const vendors = isHerbal ? HERBAL_VENDORS : CHEF_VENDORS;
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(20,26,22,.45)", zIndex: 400, display: "flex", alignItems: "flex-end" }}
      onClick={onClose}
    >
      <div
        style={{ background: "var(--mp-canvas)", width: "100%", maxWidth: 560, margin: "0 auto", borderRadius: "28px 28px 0 0", padding: "1.4rem 1.25rem 1.6rem", animation: "mpFadeUp .3s ease both" }}
        onClick={e => e.stopPropagation()}
        className="mp-root"
      >
        <div style={{ width: 40, height: 4, background: "var(--mp-border)", borderRadius: 100, margin: "0 auto 1.1rem" }} />
        <h3 className="mp-serif" style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: ".25rem" }}>
          {isHerbal ? "Verified wellness suppliers nearby" : "Local healthy partners nearby"}
        </h3>
        <p style={{ fontSize: ".78rem", color: "var(--mp-muted)", marginBottom: "1.1rem" }}>
          {isHerbal ? "Pre-made or freshly prepared, ready for pickup or delivery." : "They'll prepare this exact meal profile and deliver it to you."}
        </p>
        {vendors.map(v => (
          <div className="mp-vendor-row" key={v.name}>
            <img className="mp-vendor-avatar" src={v.img} alt="" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="mp-vendor-name">{v.name}</div>
              <div className="mp-vendor-meta">{v.meta}</div>
            </div>
            <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: ".35rem", alignItems: "flex-end" }}>
              <span className="mp-vendor-price">{v.price}</span>
              <button className="mp-vendor-cta" onClick={() => { notify(`Order sent to ${v.name} ✓`, "success"); onClose(); }}>
                Order
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={onClose}
          style={{ width: "100%", marginTop: ".4rem", background: "transparent", border: "1.5px solid var(--mp-border)", borderRadius: 100, padding: ".7rem", fontWeight: 600, fontSize: ".8rem", color: "var(--mp-muted)", cursor: "pointer" }}
        >
          Not now, I'll cook
        </button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────

// INTEGRATION NOTE FOR CONSUMERS: this component keeps cooking/brewing
// progress (doneSteps) in its own local state, scoped to whatever payload
// it was mounted with. If you render this component for different plans
// without unmounting it (e.g. inside a router that swaps the `payload`
// prop on navigation), React will reuse the existing instance and the
// PREVIOUS plan's checked-off steps will still show as done on the new
// plan. Always mount this with `key={payload.id}` at the call site —
// see MealPlanDemo.jsx for the reference pattern — so navigating to a
// different plan forces a clean remount instead of leaking progress
// across plans.
export default function MealPlanView({ payload, onBack, onSyncProgress }) {
  // GUARD: this component requires a `payload` prop shaped like the API
  // contract (id, item_type, food_name, recipe_steps, ingredients, ...).
  // It does NOT supply its own default — MEAL_PAYLOAD / HERBAL_PAYLOAD are
  // exported as named mocks for callers/demos to use, not auto-applied
  // here. If you're seeing "Cannot read properties of undefined" when
  // previewing this file, it means nothing passed a `payload` prop — most
  // likely this file was rendered directly instead of through a wrapper
  // that supplies one. See MealPlanDemo.jsx for a working example, or
  // pass `payload={MEAL_PAYLOAD}` yourself.
  //
  // IMPORTANT: React requires every hook below to run on every render, in
  // the same order — we can't `return` early before calling them just
  // because payload is missing (that breaks Rules of Hooks and crashes
  // the app on the next render). So instead we fall back to a minimal
  // empty-but-valid payload shape for the hooks to safely operate on, and
  // only branch to the "no plan loaded" UI once we reach the JSX return,
  // after every hook has already run.
  const payloadIsValid = !!(payload && typeof payload === "object" && payload.item_type);
  const safePayload = payloadIsValid ? payload : {
    id: "missing",
    item_type: "MEAL",
    food_name: "",
    recipe_steps: [],
    ingredients: [],
    nutritional_value: { calories: 0, protein_g: 0, fiber_g: 0, carbs_g: 0 },
    important_notes: [],
  };

  const isHerbal = safePayload.item_type === "HERBAL_PRODUCT";
  const [doneSteps, setDoneSteps] = useState(() => new Set());
  const [toast, setToast] = useState(null);
  const [outsourceOpen, setOutsourceOpen] = useState(false);
  const toastTimer = useRef(null);

  const notify = useCallback((msg, type = "info") => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const toggleStep = useCallback((stepNumber) => {
    vibrate(14);
    setDoneSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepNumber)) next.delete(stepNumber);
      else next.add(stepNumber);
      // In production this debounces and POSTs progress to the API.
      // Never persisted to localStorage — see HIPAA note at file top.
      onSyncProgress?.(safePayload.id, Array.from(next));
      return next;
    });
  }, [safePayload.id, onSyncProgress]);

  const voice = useVoiceCookingMode({
    steps: safePayload.recipe_steps,
    doneSteps,
    onCheckStep: toggleStep,
    notify,
  });

  const completedCount = doneSteps.size;
  const totalSteps = safePayload.recipe_steps.length;
  const allDone = totalSteps > 0 && completedCount === totalSteps;

  useEffect(() => {
    if (allDone) {
      notify(isHerbal ? "Infusion ready 🌿" : "Dish complete — enjoy your meal 🌿", "success");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone]);

  const macros = safePayload.nutritional_value;
  const macroMax = { calories: 600, protein_g: 60, fiber_g: 20, carbs_g: 80 };

  // Now that every hook has run, it's safe to branch on validity.
  if (!payloadIsValid) {
    return (
      <div className="mp-root" style={{ padding: "2.5rem 1.5rem", textAlign: "center" }}>
        <style>{MP_CSS}</style>
        <div style={{ fontSize: "2rem", marginBottom: ".75rem" }}>🌿</div>
        <h3 className="mp-serif" style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: ".5rem" }}>
          No meal plan loaded
        </h3>
        <p style={{ fontSize: ".82rem", color: "var(--mp-muted)", maxWidth: 320, margin: "0 auto" }}>
          This view needs a <code>payload</code> prop (a MEAL or HERBAL_PRODUCT object) to render.
          Try <code>{"<MealPlanView payload={MEAL_PAYLOAD} />"}</code>, or use{" "}
          <code>MealPlanDemo.jsx</code> for a ready-to-run example.
        </p>
      </div>
    );
  }

  // payloadIsValid is true here (we returned above otherwise), so
  // safePayload === payload — the JSX below uses safePayload directly.

  return (
    <div className="mp-root">
      <style>{MP_CSS}</style>

      {/* Block 1 / Block 1b */}
      {isHerbal ? (
        <div className="mp-split-frame">
          <div>
            <img src={safePayload.package_image_url} alt="Package form" />
            <span className="mp-split-label">Package</span>
          </div>
          <div>
            <img src={safePayload.brewed_image_url} alt="Brewed, ready to consume" />
            <span className="mp-split-label">Brewed</span>
          </div>
          <button className="mp-hero-back" style={{ position: "absolute", top: "1rem", left: "1rem" }} onClick={onBack} aria-label="Back">←</button>
          <span className="mp-hero-type-tag" style={{ position: "absolute", top: "1rem", right: "1rem" }}>🌿 Herbal</span>
        </div>
      ) : (
        <div className="mp-hero">
          <img src={safePayload.banner_image_url} alt={safePayload.food_name} />
          <div className="mp-hero-overlay" />
          <button className="mp-hero-back" onClick={onBack} aria-label="Back">←</button>
          <span className="mp-hero-type-tag">🍽️ Meal</span>
        </div>
      )}

      {/* Block 2/3: Ingredients */}
      <div style={{ paddingTop: "1.25rem" }}>
        <div className="mp-section-tight mp-eyebrow">What you'll need</div>
        <IngredientRail ingredients={safePayload.ingredients} />
      </div>

      {/* Block 4/5: Title + description */}
      <div className="mp-section" style={{ paddingTop: 0 }}>
        <h1 className="mp-serif mp-title">{safePayload.food_name}</h1>
        <p className="mp-desc">{safePayload.description}</p>
        <div className="mp-meta-row">
          <span className="mp-meta-chip">⏱ {safePayload.prep_time_min} min</span>
          <span className="mp-meta-chip">👥 Serves {safePayload.servings}</span>
          {safePayload.important_notes?.[0] && <span className="mp-meta-chip">✓ {safePayload.important_notes[0]}</span>}
        </div>
      </div>

      <div className="mp-divider" />

      {/* Block 6/7: Steps */}
      <div className="mp-section">
        <div className="mp-section-head">
          <h3 className="mp-serif">{isHerbal ? "Preparation steps" : "Cooking steps"}</h3>
          <span style={{ fontSize: ".74rem", color: "var(--mp-muted)", fontWeight: 600 }}>{completedCount}/{totalSteps} done</span>
        </div>
        <div className="mp-steps">
          {safePayload.recipe_steps.map((step, idx) => (
            <StepCard
              key={step.step_number}
              step={step}
              isDone={doneSteps.has(step.step_number)}
              isActive={voice.active && voice.activeStepIdx === idx}
              onToggle={() => toggleStep(step.step_number)}
            />
          ))}
        </div>
      </div>

      {/* Block 6b: Voice FAB */}
      <button className={`mp-voice-fab ${voice.active ? "live" : ""}`} onClick={voice.toggle}>
        {voice.active ? (
          <>
            <span className="mp-voice-bars"><span /><span /><span /></span>
            Voice mode active — say "next step"
          </>
        ) : (
          <>🔊 Toggle voice mode</>
        )}
      </button>
      {voice.active && (
        <div className="mp-voice-status">
          {voice.listening ? "Listening for \u201cnext step\u201d or \u201crepeat step\u201d" : "Reconnecting microphone…"}
        </div>
      )}

      <div className="mp-divider" style={{ marginTop: "1.5rem" }} />

      {/* Block 8: Macros */}
      <div className="mp-section">
        <div className="mp-eyebrow" style={{ marginBottom: ".9rem" }}>Per serving</div>
        <div className="mp-macro-grid">
          <MacroRing value={macros.calories} label="Calories" pct={Math.min(100, (macros.calories / macroMax.calories) * 100)} />
          <MacroRing value={`${macros.protein_g}g`} label="Protein" pct={Math.min(100, (macros.protein_g / macroMax.protein_g) * 100)} />
          <MacroRing value={`${macros.fiber_g}g`} label="Fiber" pct={Math.min(100, (macros.fiber_g / macroMax.fiber_g) * 100)} />
          <MacroRing value={`${macros.carbs_g}g`} label="Carbs" pct={Math.min(100, (macros.carbs_g / macroMax.carbs_g) * 100)} />
        </div>
      </div>

      {/* Block 9: Enrichment */}
      {(safePayload.enrichment_library?.videos?.length || safePayload.enrichment_library?.articles?.length) > 0 && (
        <div className="mp-section" style={{ paddingTop: 0 }}>
          <div className="mp-section-head"><h3 className="mp-serif">Go deeper</h3></div>
          <div className="mp-enrich-list">
            {safePayload.enrichment_library.videos?.map(v => (
              <div className="mp-enrich-row" key={v.title} onClick={() => notify("Opening video…", "info")}>
                <div className="mp-enrich-icon">▶</div>
                <div>
                  <div className="mp-enrich-title">{v.title}</div>
                  <div className="mp-enrich-sub">Video · {v.duration}</div>
                </div>
              </div>
            ))}
            {safePayload.enrichment_library.articles?.map(a => (
              <div className="mp-enrich-row" key={a.title} onClick={() => notify("Opening article…", "info")}>
                <div className="mp-enrich-icon">📖</div>
                <div>
                  <div className="mp-enrich-title">{a.title}</div>
                  <div className="mp-enrich-sub">Article</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Block 10/11: Servings + warnings */}
      <div className="mp-section" style={{ paddingTop: 0 }}>
        <div style={{ marginBottom: "1rem" }}>
          <span className="mp-servings-tag">👥 Servings: {safePayload.servings}</span>
        </div>
        <div className="mp-warning-card">
          {safePayload.important_notes?.map((note, i) => (
            <div className="mp-warning-row" key={i}>
              <span>{note.startsWith("⚠️") ? "" : "🌿"}</span>
              <span>{note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Block 12: Outsource module */}
      <div className="mp-section" style={{ paddingTop: 0, paddingBottom: "2.5rem" }}>
        <div className="mp-outsource">
          <div className="mp-outsource-icon">{isHerbal ? "🏺" : "🛵"}</div>
          <div className="mp-outsource-title">{isHerbal ? "Short on time to brew?" : "Short on time to cook?"}</div>
          <p className="mp-outsource-copy">
            {isHerbal
              ? "We found verified wellness suppliers who can prepare and deliver this exact infusion to your doorstep today."
              : "We found local healthy partners who can prepare and deliver this exact meal profile to your doorstep today."}
          </p>
          <button className="mp-outsource-btn" onClick={() => setOutsourceOpen(true)}>
            {isHerbal ? "Find Wellness Suppliers" : "Find Local Chefs / Order Now"} →
          </button>
        </div>
      </div>

      <OutsourceSheet open={outsourceOpen} onClose={() => setOutsourceOpen(false)} isHerbal={isHerbal} notify={notify} />

      {toast && (
        <div className="mp-toast" role="status">
          {toast.type === "success" ? "✅" : toast.type === "warning" ? "⚠️" : "🌿"} {toast.msg}
        </div>
      )}
    </div>
  );
}

export { MEAL_PAYLOAD, HERBAL_PAYLOAD };
