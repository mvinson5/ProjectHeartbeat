import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, LineChart, Line, ReferenceLine, LabelList
} from 'recharts';

// ─────────────────────────────────────────────────────────────────────────────
// MV PREFERRED AESTHETIC — LIGHT VARIANT
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  bg: '#F2F1ED', card: '#FFFFFF', navy: '#0F1A2E', navy2: '#1B2840',
  mint: '#3DDBB4', mintDeep: '#2BB89A', mintBright: '#4AEDC4', gold: '#B8943A',
  steel: '#4F7393', steelLt: '#6B8BA6', ochre: '#C9962E', ochreLt: '#D4A94F',
  terra: '#C0544E', terraDeep: '#A24842', green: '#2B8A6E',
  text: '#1C2536', muted: '#6E7585', faint: '#9AA0AD', border: '#E4E1D9', borderLt: '#EDEAE2',
};
const serif = "'Erode', Georgia, 'Times New Roman', serif";
const sans = "'Inter', system-ui, sans-serif";
const mono = "'IBM Plex Mono', monospace";

// ─────────────────────────────────────────────────────────────────────────────
// DATA (V5)
// ─────────────────────────────────────────────────────────────────────────────
const PRICE = 25;
const SHARES = 68.3;

const SCENARIOS = [
  { id: 'A+', name: 'Catheter durability at scale', prob: 10, lo: 7.0, hi: 15.0, mid: 11.0, ps: 161, color: C.gold,
    detail: 'Pivotal remapping shows ≥90% per-vein durable isolation across community hospitals — a result no µsPFA device has matched in real-world use. The 360° compliant catheter solves the operator-dependence that collapsed Farapulse durability. Combined with the no-paralytic workflow, an acquirer (most likely Abbott) pays a platform premium. A device-engineering outcome, not a biophysics one.' },
  { id: 'A', name: 'Differentiated competitor', prob: 18, lo: 2.5, hi: 4.0, mid: 3.25, ps: 48, color: C.mintDeep,
    detail: 'AF pivotal clearly meets its endpoint (88–92% 12-month freedom from AF) with durability comparable to the best µsPFA pre-market data. No-paralytic workflow validated, thyroid feasibility positive. Acquirer pays a premium for a strong differentiated product with better workflow — not a generational displacement.' },
  { id: 'B', name: 'AF success, thyroid TBD', prob: 25, lo: 1.8, hi: 2.5, mid: 2.15, ps: 31, color: C.steel,
    detail: 'AF pivotal meets endpoint. Thyroid still enrolling or inconclusive. Acquirer values primarily for the cardiac program. Most probable single outcome; anchored to Farapulse / Affera precedents adjusted for TAM growth.' },
  { id: 'C', name: 'AF success, thyroid fails', prob: 8, lo: 1.3, hi: 1.8, mid: 1.55, ps: 23, color: C.steelLt,
    detail: 'AF meets endpoint but thyroid data disappoints (nerve injury or inadequate response). Raises questions about soft-tissue applicability. Pure EP takeout without platform premium. Roughly flat to the current price.' },
  { id: 'D', name: 'AF mixed, thyroid succeeds', prob: 14, lo: 0.7, hi: 1.1, mid: 0.9, ps: 13, color: C.ochre,
    detail: 'Pivotal shows 82–87% success — feasibility-to-pivotal dilution similar to what µsPFA experienced. Approvable but within the range of existing products. The catheter design did not fully solve operator dependence. Thyroid offers an alternative path.' },
  { id: 'E', name: 'AF mixed, thyroid fails', prob: 9, lo: 0.4, hi: 0.7, mid: 0.55, ps: 8, color: C.ochreLt,
    detail: 'Both programs mediocre. Undifferentiated cardiac product plus a failed soft-tissue thesis. No premium acquisition.' },
  { id: 'F', name: 'AF fails, thyroid succeeds', prob: 9, lo: 0.3, hi: 0.5, mid: 0.4, ps: 6, color: C.terra,
    detail: 'Pivotal misses its primary endpoint. Unlikely given the feasibility data, but possible via a safety signal, manufacturing variance, or continuous monitoring revealing recurrence that Holter masked.' },
  { id: 'G', name: 'Full failure', prob: 7, lo: 0.1, hi: 0.3, mid: 0.2, ps: 3, color: C.terraDeep,
    detail: 'Both programs fail. IP fire-sale or wind-down. Residual value is cash plus patents.' },
];

const EV = SCENARIOS.reduce((s, x) => s + x.prob / 100 * x.ps, 0);
const upsideWtd = SCENARIOS.filter(s => s.ps > PRICE).reduce((s, x) => s + x.prob / 100 * (x.ps - PRICE), 0);
const downsideWtd = SCENARIOS.filter(s => s.ps <= PRICE).reduce((s, x) => s + x.prob / 100 * (PRICE - x.ps), 0);
const pUp = SCENARIOS.filter(s => s.ps > PRICE).reduce((s, x) => s + x.prob, 0);
const pDown = SCENARIOS.filter(s => s.ps <= PRICE).reduce((s, x) => s + x.prob, 0);
const ratio = upsideWtd / downsideWtd;
const evExA = (EV - 0.10 * 161);

const DURABILITY = [
  { name: 'nsPFA — PLSE clamp\n(pre-market)', vein: 94, fill: C.mintDeep },
  { name: 'µsPFA — Farapulse\n(pre-market)', vein: 96, fill: C.steel },
  { name: 'µsPFA — real-world\n(redo registry)', vein: 71, fill: C.terra },
];
const SENS = [{ p: '5%', ev: 30 }, { p: '8%', ev: 35 }, { p: '10%', ev: 38 }, { p: '15%', ev: 46 }, { p: '20%', ev: 54 }];

const PURSUING = [
  { m: 'AF — paroxysmal (catheter)', tam: '$5–6B', stage: 'IDE pivotal', note: 'Lead program. NANOPULSE-AF, ~215 pts, up to 30 sites. Enrollment complete early Q4 2026. EnSite X mapping. Feasibility: 96% at 12 mo, 90% KM freedom from arrhythmia.' },
  { m: 'Thyroid — papillary microcarcinoma', tam: '~$0.5B', stage: 'FIH feasibility', note: 'Vybrance percutaneous electrode. MD Anderson + Sarasota Memorial. T1N0M0 tumors <1.5cm. Nerve-sparing vs. thermal ablation / surgery.' },
  { m: 'Thyroid — benign nodules', tam: '50M prevalence', stage: 'Feasibility', note: '74% volume reduction, no regrowth at 15–22 months. Enrollment expanded 50 → 100 patients (PRECISE study). 510(k) cleared for soft tissue.' },
  { m: 'Surgical AF ablation (clamp)', tam: '~$0.5B', stage: 'IDE pivotal', note: 'NANOCLAMP-AF, enrollment to complete H1 2027. Feasibility remapping: 94% durable PVI, 100% posterior box isolation, 41-sec average ablation time.' },
];
const EXPANSION = [
  { m: 'Ventricular tachycardia', tam: '$1.2B', note: 'Same catheter platform; label extension. Tissue selectivity valuable near coronaries / phrenic nerve. Fastest-growing cardiac indication.' },
  { m: 'SVT / atrial flutter / AP', tam: '$1.6B', note: 'Standard ablation indications extending the cardiac platform. Precision near AV node where nerve-sparing matters.' },
  { m: 'Liver tumors (HCC, mets)', tam: '$3–4B', note: 'Vybrance extension. nsPFA eliminates NanoKnife limitations: multiple electrodes, cardiac sync, paralytic. Spares vessels / bile ducts.' },
  { m: 'Pancreatic cancer', tam: '$1.5B', note: 'Highest unmet need. Pancreas surrounded by critical vasculature. Preclinical nsPFA modulates Wnt/β-catenin & NF-κB. IO synergy potential.' },
  { m: 'Prostate (focal therapy)', tam: '$2B', note: 'Preserves neurovascular bundles (potency) and urethral sphincter (continence). IRE shown to augment checkpoint immunotherapy.' },
  { m: 'Renal denervation (HTN)', tam: '$2–5B', note: 'PFA is adjacent technology. nsPFA precision spares renal artery wall. Long-duration option, large TAM.' },
  { m: 'BPH / urology', tam: '$3–4B', note: 'Debulk tissue while preserving nerves — avoid ED / retrograde ejaculation that limit existing therapies. Speculative.' },
  { m: 'Immuno-oncology synergy', tam: '$50B+', note: 'Immunogenic cell death primes systemic anti-tumor response. Abscopal effects with checkpoint inhibitors. 5–10+ yrs from validation.' },
];
const COMPETITORS = [
  { co: 'Boston Scientific', prod: 'Farapulse', status: 'Approved 2024 · persistent AF 2025', note: 'Market leader. $1B+ first-year revenue; drove EP segment from ~$0.8B to ~$3.6B annualized. The benchmark — and the real-world durability bar PLSE must beat.' },
  { co: 'Medtronic', prod: 'PulseSelect + Affera Sphere-9', status: 'Both FDA approved 2024', note: 'Two platforms. Affera lattice-tip combines PFA + RF + mapping in one device. PulseSelect single-shot loop.' },
  { co: 'Johnson & Johnson', prod: 'VARIPULSE', status: 'Approved Nov 2024', note: 'Integrated with CARTO 3 — the dominant mapping ecosystem, lowering switching friction. Brief U.S. launch pause in early 2025 over neuro events.' },
  { co: 'Abbott', prod: 'Volt PFA', status: 'CE Mark 2025 · FDA pending', note: 'Laggard among the top four in PFA catheters — but owns EnSite X, the mapping platform PLSE integrates with. Competitor and most-likely acquirer simultaneously.', flag: true },
  { co: 'Kardium', prod: 'Globe', status: 'Emerging', note: 'Mapping-plus-ablation single-shot array. Large private raises. Fast-follower taking share.' },
  { co: 'Field Medical', prod: 'FieldForce', status: 'Early-stage', note: 'Focused on ventricular tachycardia PFA. Raised $40M in 2025.' },
];
const MA_COMPS = [
  { t: 'Farapulse', a: 'Boston Scientific', yr: '2021', val: 0.575, label: '~$575M', stage: 'Pre-approval (CE Mark, IDE underway)', note: 'BSX held 27% stake. Now $1B+ annual revenue.', fill: C.steel },
  { t: 'Affera', a: 'Medtronic', yr: '2022', val: 0.925, label: '~$925M', stage: 'Pre-approval (IDE launched)', note: 'Mapping + PFA + RF combined. FDA approved Oct 2024.', fill: C.steel },
  { t: 'Shockwave', a: 'Johnson & Johnson', yr: '2024', val: 13.1, label: '$13.1B', stage: '$730M revenue, +49% growth', note: '~18× trailing revenue. Proven next-gen modality (IVL). The structural parallel for a proven-platform exit.', fill: C.gold },
];
const ACQUIRERS = [
  { rank: 1, bucket: 'Top — natural buyer', co: 'Abbott', why: 'Only top-four EP player without an established PFA franchise — most to gain. PLSE catheter already integrates with Abbott EnSite X. No cannibalization of an entrenched µsPFA revenue stream; this upgrades a weak position to a leading one. ~$200B market cap makes $7–15B digestible. Highest likely premium because the asset is worth more to Abbott than to anyone else.' },
  { rank: 2, bucket: 'Defensive incumbent', co: 'Boston Scientific', why: 'Most PFA revenue to defend (Farapulse is the crown jewel and most exposed to a next-gen threat). Deepest EP commercial infrastructure to monetize quickly. Demonstrated appetite for transformational EP M&A. Reluctant premium payer — buying its own disruptor.' },
  { rank: 3, bucket: 'Defensive incumbent', co: 'Medtronic', why: 'Large EP franchise with two PFA platforms to protect. Acquisitive. Same cannibalization tension as BSX.' },
  { rank: 4, bucket: 'Defensive incumbent', co: 'Johnson & Johnson', why: 'Dominant CARTO mapping ecosystem and deepest balance sheet ($400B+). But recently spent on Shockwave + Abiomed, and VARIPULSE had a rocky launch — appetite for another large EP deal less certain.' },
  { rank: 5, bucket: 'Wildcard entrant', co: 'Stryker / Edwards / diversified', why: 'Platform entry into cardiac intervention. Lower probability — lack the mapping ecosystem and EP sales force that make PLSE immediately monetizable. Multi-application platform makes PLSE attractive as a franchise-builder.' },
];
const CATALYSTS = [
  { when: 'Late 2026 – Q2 2027', what: 'Catheter pivotal remapping data', impact: 'PRIMARY', note: 'Per-vein durable isolation % at community sites. The single datapoint that re-rates the entire distribution: ≥92% confirms A+; 85–91% confirms Scenario A; <75% collapses the differentiation thesis.' },
  { when: 'Early Q4 2026', what: 'NANOPULSE-AF enrollment completion', impact: 'Signal', note: 'Faster-than-guided enrollment indicates investigator demand. De-risks the path to the primary readout.' },
  { when: 'H2 2026', what: 'Non-cardiac strategy roadmap', impact: 'Platform', note: 'Management to clarify thyroid / soft-tissue / oncology plans. Substantiates (or leaves theoretical) the platform optionality in Scenarios A and B.' },
  { when: 'Late 2026', what: 'Thyroid feasibility results', impact: 'Platform', note: 'Malignant thyroid feasibility (MD Anderson + Sarasota Memorial). Validates the nerve-sparing soft-tissue thesis independently of cardiac.' },
  { when: 'Ongoing', what: 'Abbott relationship signals', impact: 'M&A', note: 'Mapping integration moving from investigational to commercial, strategic investment, or partnership — would indicate acquirer conviction.' },
];
const REMAP_TABLE = [
  { result: '≥ 92% durable', read: 'Catheter solves operator dependence — unmatched by any µsPFA device in real-world data', sc: 'A+ confirmed', shift: '→ 20–30%', tone: C.gold },
  { result: '85–91% durable', read: 'Clearly better than µsPFA real-world (71%), but some dilution from pre-market', sc: 'Scenario A', shift: '→ 10–15%', tone: C.mintDeep },
  { result: '75–84% durable', read: 'Comparable real-world dilution; catheter design did not fully solve the problem', sc: 'Scenario B / C', shift: '→ 3–5%', tone: C.ochre },
  { result: '< 75% durable', read: 'Same collapse as µsPFA; no catheter-design durability advantage', sc: 'Scenario D / E', shift: '→ 0–2%', tone: C.terra },
];

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
const Eyebrow = ({ children, color = C.mintDeep }) => (
  <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase', color, marginBottom: 10, fontWeight: 500 }}>{children}</div>
);
const Card = ({ children, style, stripe }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, borderTop: stripe ? `3px solid ${C.mint}` : `1px solid ${C.border}`, ...style }}>{children}</div>
);
const NavyCallout = ({ children, style }) => (
  <div style={{ background: C.navy, borderRadius: 10, padding: '20px 24px', borderTop: `3px solid ${C.mint}`, ...style }}>{children}</div>
);
const Stat = ({ label, value, note, dollar }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
    <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: 1.3, textTransform: 'uppercase', color: C.muted, marginBottom: 6 }}>{label}</div>
    <div style={{ fontFamily: serif, fontSize: 27, fontWeight: 600, lineHeight: 1.05, fontStyle: dollar ? 'normal' : 'italic', color: dollar ? C.gold : C.mintDeep }}>{value}</div>
    {note && <div style={{ fontSize: 11, color: C.muted, marginTop: 5 }}>{note}</div>}
  </div>
);
const SectionTitle = ({ children }) => (
  <h2 style={{ fontFamily: serif, fontSize: 26, fontWeight: 500, color: C.navy, margin: '0 0 16px' }}>{children}</h2>
);
const Tip = ({ active, payload, label, fmt }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: C.navy, border: `1px solid ${C.navy2}`, borderRadius: 8, padding: '10px 12px', fontFamily: mono, fontSize: 11 }}>
      <div style={{ color: '#fff', marginBottom: 4, whiteSpace: 'pre-line' }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: C.mintBright }}>{fmt ? fmt(p.value) : p.value}</div>)}
    </div>
  );
};
const gridStroke = C.border;
const axisTick = { fill: C.muted, fontFamily: mono, fontSize: 10 };

// ─────────────────────────────────────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────────────────────────────────────
function ThesisTab() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 26 }}>
        <Stat label="Price" value={`$${PRICE}`} dollar note="NASDAQ: PLSE" />
        <Stat label="Shares Out" value={`${SHARES}M`} note="Duggan owns 71.6%" />
        <Stat label="Market Cap" value="~$1.7B" dollar note="Pre-revenue, clinical stage" />
        <Stat label="Prob-Wtd Value" value={`~$${EV.toFixed(0)}`} dollar note={`~${((EV / PRICE - 1) * 100).toFixed(0)}% above price`} />
        <Stat label="Upside : Downside" value={`${ratio.toFixed(1)} : 1`} note="Probability-weighted" />
      </div>
      <NavyCallout style={{ marginBottom: 20 }}>
        <Eyebrow color={C.mintBright}>The Thesis in One Paragraph</Eyebrow>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.75, color: '#E8EAEE' }}>
          Pulse Biosciences is a clinical-stage developer of <strong style={{ color: '#fff' }}>nanosecond pulsed field ablation (nsPFA)</strong> — mechanistically distinct from the microsecond PFA (µsPFA) systems that Boston Scientific, Medtronic, and J&J already sell. The entire near-term value sits in one atrial-fibrillation pivotal (NANOPULSE-AF). Controlled pre-market data shows nsPFA produces <strong style={{ color: C.mintBright }}>lesion durability equivalent to</strong> — not better than — the best µsPFA. So the bull case is not a biophysics story; it is a <strong style={{ color: '#fff' }}>catheter-engineering story</strong>: whether PLSE's 360° compliant catheter holds durability across community hospitals when Farapulse's durability collapsed from 96% to 71% in real-world use. One measurable datapoint — pivotal remapping at community sites, due late 2026 to Q2 2027 — re-rates the whole distribution.
        </p>
      </NavyCallout>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <Card stripe>
          <Eyebrow>What's Working</Eyebrow>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.7, color: C.text }}>
            <li>Feasibility data near the top of the field: 96% at 12 months, 90% Kaplan-Meier freedom from arrhythmia, reproducible across 7 operators</li>
            <li>Surgical clamp remapping (gold-standard): 94% durable PVI, 100% posterior box, 41-second ablation</li>
            <li>No-paralytic workflow + ~1.25-sec energy delivery — real procedural advantages</li>
            <li>Thyroid: 74% nodule volume reduction, no regrowth at 15–22 months</li>
            <li>Controlling shareholder adding capital at $19.69</li>
          </ul>
        </Card>
        <Card style={{ borderTop: `3px solid ${C.terra}` }}>
          <Eyebrow color={C.terra}>What's Unresolved</Eyebrow>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.7, color: C.text }}>
            <li>Pre-market durability is <em>equivalent</em> to µsPFA, not superior — A+ depends on catheter design, unproven at scale</li>
            <li>Pivotal is non-randomized, single-arm, paroxysmal-only</li>
            <li>12-month efficacy denominator is just 53 patients; monitoring was Holter (underdetects recurrence)</li>
            <li>Three entrenched incumbents already scaling µsPFA</li>
            <li>$68M cash, ~$15M/qtr burn — dilution is near-certain</li>
          </ul>
        </Card>
      </div>
      <Card stripe>
        <Eyebrow>Probability-Weighted Value Bridge</Eyebrow>
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer>
            <BarChart data={SCENARIOS.map(s => ({ name: s.id, contrib: +(s.prob / 100 * s.ps).toFixed(1), color: s.color }))} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="name" tick={{ ...axisTick, fontSize: 11 }} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<Tip fmt={(v) => `$${v}/sh contribution`} />} cursor={{ fill: 'rgba(15,26,46,0.04)' }} />
              <Bar dataKey="contrib" radius={[3, 3, 0, 0]}>
                {SCENARIOS.map((s, i) => <Cell key={i} fill={s.color} />)}
                <LabelList dataKey="contrib" position="top" style={{ fill: C.muted, fontFamily: mono, fontSize: 10 }} formatter={(v) => `$${v}`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>
          Each bar is a scenario's contribution to the ~${EV.toFixed(0)}/share expected value (probability × per-share outcome). A+ contributes ~${(0.10 * 161).toFixed(0)} at only 10% probability — the distribution is right-skewed, with the tail doing disproportionate work.
        </div>
      </Card>
    </div>
  );
}

function TechTab() {
  return (
    <div>
      <SectionTitle>Nanosecond vs. Microsecond PFA</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <Card stripe>
          <Eyebrow>nsPFA — PLSE nPulse</Eyebrow>
          <p style={{ fontSize: 13.5, lineHeight: 1.7, margin: '0 0 10px', color: C.text }}>
            Pulses measured in <strong style={{ color: C.navy }}>nanoseconds</strong> (one-billionth of a second) at high amplitude. Shorter than plasma-membrane charge time, so they bypass the outer membrane and electroporate <strong style={{ color: C.navy }}>intracellular organelles</strong> — mitochondria, ER, nuclear membrane.
          </p>
          <p style={{ fontSize: 13.5, lineHeight: 1.7, margin: 0, color: C.muted }}>
            Result: <strong style={{ color: C.mintDeep }}>regulated cell death (apoptosis)</strong> — less inflammation, reduced scarring, preservation of nerves and vessels. No skeletal-muscle stimulation, so paralytics may not be required.
          </p>
        </Card>
        <Card style={{ borderTop: `3px solid ${C.steel}` }}>
          <Eyebrow color={C.steel}>µsPFA — Farapulse, PulseSelect, VARIPULSE, Volt</Eyebrow>
          <p style={{ fontSize: 13.5, lineHeight: 1.7, margin: '0 0 10px', color: C.text }}>
            Pulses measured in <strong style={{ color: C.navy }}>microseconds</strong> — ~1,000× longer. Primarily electroporate the <strong style={{ color: C.navy }}>plasma membrane</strong>, causing necrotic cell death.
          </p>
          <p style={{ fontSize: 13.5, lineHeight: 1.7, margin: 0, color: C.muted }}>
            Commercially proven and FDA-approved across three large-cap players. Requires deep sedation / neuromuscular blockade. The established standard PLSE is measured against.
          </p>
        </Card>
      </div>
      <NavyCallout style={{ marginBottom: 20 }}>
        <Eyebrow color={C.mintBright}>The Key Analytical Point</Eyebrow>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: '#E8EAEE' }}>
          The mechanisms are different, but in controlled pre-market conditions they produce <strong style={{ color: '#fff' }}>equivalent lesion durability</strong> (see Clinical Data). The hypothesis that apoptotic cell death makes inherently more durable lesions is not supported by the data. nsPFA's differentiation therefore rests on <strong style={{ color: C.mintBright }}>procedural workflow</strong> (no paralytic, faster delivery) and <strong style={{ color: C.mintBright }}>catheter design</strong> (consistency across operators) — not on the energy modality producing better lesions.
        </p>
      </NavyCallout>
      <Card stripe>
        <Eyebrow>Procedural Profile (Catheter Feasibility)</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
          {[
            ['Energy delivery', '~1.25 sec', 'per application, thickness-independent'],
            ['LA dwell time', '21 min', 'median'],
            ['Total procedure', '~65 min', 'median'],
            ['ECG sync', 'Not required', 'no gating needed'],
            ['Paralytic', 'Not required', 'no muscle stimulation'],
          ].map(([l, v, n], i) => (
            <div key={i} style={{ background: C.bg, borderRadius: 8, padding: '12px 14px', border: `1px solid ${C.borderLt}` }}>
              <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: C.muted, marginBottom: 4 }}>{l}</div>
              <div style={{ fontFamily: serif, fontSize: 19, fontWeight: 600, color: C.navy }}>{v}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{n}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ClinicalTab() {
  return (
    <div>
      <SectionTitle>The Durability Question — Gold-Standard Remapping</SectionTitle>
      <Card stripe style={{ marginBottom: 20 }}>
        <Eyebrow>Per-Vein Durable Isolation at 3-Month Remapping</Eyebrow>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={DURABILITY} margin={{ top: 20, right: 16, left: 0, bottom: 28 }}>
              <CartesianGrid strokeDasharray="2 4" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="name" tick={axisTick} axisLine={{ stroke: C.border }} tickLine={false} interval={0} height={42} />
              <YAxis domain={[0, 100]} tick={axisTick} axisLine={false} tickLine={false} unit="%" />
              <Tooltip content={<Tip fmt={(v) => `${v}% durable`} />} cursor={{ fill: 'rgba(15,26,46,0.04)' }} />
              <ReferenceLine y={90} stroke={C.gold} strokeDasharray="4 4" label={{ value: 'A+ threshold ≈ 90%', fill: C.gold, fontSize: 10, fontFamily: mono, position: 'insideTopRight' }} />
              <Bar dataKey="vein" radius={[3, 3, 0, 0]}>
                {DURABILITY.map((d, i) => <Cell key={i} fill={d.fill} />)}
                <LabelList dataKey="vein" position="top" style={{ fill: C.navy, fontFamily: mono, fontSize: 12, fontWeight: 600 }} formatter={(v) => `${v}%`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginTop: 8, marginBottom: 0 }}>
          In controlled pre-market conditions, nsPFA (94%) and µsPFA (96%) are statistically indistinguishable. The story is in the third bar: µsPFA durability <strong style={{ color: C.terra }}>collapsed to 71%</strong> in real-world redo mapping, driven by operator-dependent catheter positioning. The A+ thesis is that PLSE's catheter design prevents this collapse — testable only with catheter-specific pivotal remapping data. Note the 94% figure is from the surgical clamp (epicardial), not the catheter (endocardial), so it is directionally supportive rather than directly transferable.
        </p>
      </Card>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <Card>
          <Eyebrow>Catheter Feasibility (NANOPULSE-AF precursor)</Eyebrow>
          {[
            ['Acute procedural success', '100%', '177 / 177 patients'],
            ['6-month success (Holter)', '100%', '95 / 95 evaluable'],
            ['12-month success (Holter)', '96%', '51 / 53 evaluable'],
            ['KM freedom from arrhythmia', '90%', 'at 12 months, no AADs'],
          ].map(([l, v, n], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 0', borderBottom: i < 3 ? `1px solid ${C.borderLt}` : 'none' }}>
              <div><div style={{ fontSize: 13, color: C.navy, fontWeight: 600 }}>{l}</div><div style={{ fontSize: 11, color: C.muted }}>{n}</div></div>
              <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 600, fontStyle: 'italic', color: C.mintDeep }}>{v}</div>
            </div>
          ))}
        </Card>
        <Card>
          <Eyebrow color={C.steel}>Surgical Clamp Remapping (NANOCLAMP-AF)</Eyebrow>
          {[
            ['Durable PVI', '94%', 'electroanatomical, 34 pts at 3 mo'],
            ['Posterior box isolation', '100%', 'complete'],
            ['Avg total ablation time', '41 sec', 'entire procedure'],
            ['Enrollment completion', 'H1 2027', 'IDE pivotal'],
          ].map(([l, v, n], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 0', borderBottom: i < 3 ? `1px solid ${C.borderLt}` : 'none' }}>
              <div><div style={{ fontSize: 13, color: C.navy, fontWeight: 600 }}>{l}</div><div style={{ fontSize: 11, color: C.muted }}>{n}</div></div>
              <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 600, fontStyle: 'italic', color: C.steel }}>{v}</div>
            </div>
          ))}
        </Card>
      </div>
      <Card style={{ borderTop: `3px solid ${C.terra}` }}>
        <Eyebrow color={C.terra}>Data-Quality Caveats</Eyebrow>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7, color: C.text }}>
          The 12-month efficacy denominator is <strong style={{ color: C.navy }}>53 patients</strong>, not 177 — the rest are at earlier follow-up. Monitoring was <strong style={{ color: C.navy }}>Holter (24–48 hr)</strong>, which underdetects recurrence vs. continuous monitoring. Feasibility ran at expert European sites with favorable patient selection. The pivotal — 215 patients across up to 30 sites including community hospitals, with the first patients treated in Jonesboro, Arkansas — will test whether these results hold at scale. A 5–10 point feasibility-to-pivotal dilution is the historical norm in EP.
        </p>
      </Card>
    </div>
  );
}

function MarketsTab() {
  const tamData = [
    { name: 'AF / cardiac (pursuing)', v: 6, fill: C.mintDeep },
    { name: 'Thyroid (pursuing)', v: 0.5, fill: C.mintDeep },
    { name: 'VT + SVT/AFL', v: 2.8, fill: C.steel },
    { name: 'Liver', v: 3.5, fill: C.steel },
    { name: 'Prostate', v: 2, fill: C.steel },
    { name: 'Renal denervation', v: 3.5, fill: C.steelLt },
    { name: 'BPH', v: 3.5, fill: C.steelLt },
    { name: 'Pancreas', v: 1.5, fill: C.steelLt },
  ];
  return (
    <div>
      <SectionTitle>Addressable Markets</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 22 }}>
        <Stat label="Pursuing TAM" value="~$6–7B" dollar note="AF + thyroid + surgical" />
        <Stat label="Expansion TAM" value="~$15–19B" dollar note="8 adjacent indications" />
        <Stat label="Total Platform TAM" value="~$21–26B" dollar note="Same console + waveform IP" />
      </div>
      <Card stripe style={{ marginBottom: 22 }}>
        <Eyebrow>Addressable Market by Indication ($B)</Eyebrow>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={tamData} layout="vertical" margin={{ top: 8, right: 28, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke={gridStroke} horizontal={false} />
              <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}B`} />
              <YAxis type="category" dataKey="name" width={140} tick={{ fill: C.text, fontFamily: sans, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip fmt={(v) => `$${v}B TAM`} />} cursor={{ fill: 'rgba(15,26,46,0.04)' }} />
              <Bar dataKey="v" radius={[0, 3, 3, 0]}>
                {tamData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                <LabelList dataKey="v" position="right" style={{ fill: C.muted, fontFamily: mono, fontSize: 10 }} formatter={(v) => `$${v}B`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ fontSize: 11.5, color: C.muted, marginTop: 6 }}>
          <span style={{ color: C.mintDeep, fontWeight: 600 }}>Mint</span> = actively pursuing · <span style={{ color: C.steel, fontWeight: 600 }}>Steel</span> = potential expansion.
        </div>
      </Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 12px' }}>
        <span style={{ width: 10, height: 10, borderRadius: 3, background: C.mintDeep }} />
        <span style={{ fontFamily: mono, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: C.mintDeep, fontWeight: 600 }}>Actively Pursuing</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {PURSUING.map((m, i) => (
          <Card key={i} style={{ padding: 16, borderTop: `3px solid ${C.mint}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{m.m}</div>
              <div style={{ fontFamily: mono, fontSize: 11, color: C.gold, fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 8 }}>{m.tam}</div>
            </div>
            <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: 0.5, textTransform: 'uppercase', color: C.mintDeep, marginBottom: 8 }}>{m.stage}</div>
            <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>{m.note}</div>
          </Card>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 12px' }}>
        <span style={{ width: 10, height: 10, borderRadius: 3, background: C.steel }} />
        <span style={{ fontFamily: mono, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: C.steel, fontWeight: 600 }}>Potential Expansion (Not Yet Pursued)</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {EXPANSION.map((m, i) => (
          <Card key={i} style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{m.m}</div>
              <div style={{ fontFamily: mono, fontSize: 11, color: C.gold, fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 8 }}>{m.tam}</div>
            </div>
            <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>{m.note}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CompetitiveTab() {
  return (
    <div>
      <SectionTitle>Competitive Landscape — µsPFA Incumbents</SectionTitle>
      <NavyCallout style={{ marginBottom: 20 }}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: '#E8EAEE' }}>
          Every commercial competitor operates at the <strong style={{ color: '#fff' }}>microsecond scale</strong>. PLSE is the only nanosecond-scale entrant. The three large-caps are FDA-approved and scaling; <strong style={{ color: C.mintBright }}>Abbott</strong> is the laggard in PFA catheters but owns the mapping platform PLSE depends on — competitor and most-likely acquirer at once.
        </p>
      </NavyCallout>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {COMPETITORS.map((c, i) => (
          <Card key={i} style={{ borderTop: `3px solid ${c.flag ? C.mint : C.steel}` }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 2 }}>{c.co}</div>
            <div style={{ fontFamily: mono, fontSize: 11, color: c.flag ? C.mintDeep : C.steel, marginBottom: 4 }}>{c.prod}</div>
            <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: 0.5, textTransform: 'uppercase', color: C.muted, marginBottom: 10 }}>{c.status}</div>
            <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>{c.note}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ScenariosTab() {
  const chartData = SCENARIOS.map(s => ({ name: s.id, ps: s.ps, color: s.color }));
  return (
    <div>
      <SectionTitle>Scenario Outcomes — Per Share at SOTP Takeout</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 22 }}>
        <Stat label="Prob-Wtd Value" value={`~$${EV.toFixed(0)}`} dollar note={`~${((EV / PRICE - 1) * 100).toFixed(0)}% vs $${PRICE}`} />
        <Stat label="P(above price)" value={`${pUp}%`} note="Scenarios A+, A, B" />
        <Stat label="P(below price)" value={`${pDown}%`} note="Scenarios C–G" />
        <Stat label="Upside : Downside" value={`${ratio.toFixed(1)} : 1`} note="Probability-weighted" />
      </div>
      <Card stripe style={{ marginBottom: 22 }}>
        <Eyebrow>Per-Share Outcome by Scenario (log scale)</Eyebrow>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 20, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="name" tick={{ ...axisTick, fontSize: 12 }} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis scale="log" domain={[2, 250]} ticks={[3, 10, 25, 50, 100, 200]} tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<Tip fmt={(v) => `$${v}/sh`} />} cursor={{ fill: 'rgba(15,26,46,0.04)' }} />
              <ReferenceLine y={PRICE} stroke={C.navy} strokeDasharray="4 4" label={{ value: `Price $${PRICE}`, fill: C.navy, fontSize: 11, fontFamily: mono, position: 'insideTopLeft' }} />
              <Bar dataKey="ps" radius={[3, 3, 0, 0]}>
                {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                <LabelList dataKey="ps" position="top" style={{ fill: C.navy, fontFamily: mono, fontSize: 11, fontWeight: 600 }} formatter={(v) => `$${v}`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['', 'Scenario', 'Prob', 'Takeout', '$/sh', 'vs $25', 'What it means'].map((h, i) => (
                <th key={i} style={{ fontFamily: mono, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: C.muted, textAlign: i > 1 && i < 6 ? 'right' : 'left', padding: '10px 12px', borderBottom: `2px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SCENARIOS.map((s, i) => {
              const chg = ((s.ps / PRICE - 1) * 100);
              return (
                <tr key={i}>
                  <td style={{ padding: '12px', borderBottom: `1px solid ${C.borderLt}` }}>
                    <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: s.color }}>{s.id}</span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: `1px solid ${C.borderLt}`, color: C.navy, fontWeight: 600 }}>{s.name}</td>
                  <td style={{ padding: '12px', borderBottom: `1px solid ${C.borderLt}`, textAlign: 'right', fontFamily: mono, color: C.text }}>{s.prob}%</td>
                  <td style={{ padding: '12px', borderBottom: `1px solid ${C.borderLt}`, textAlign: 'right', fontFamily: mono, color: C.gold, fontWeight: 600 }}>${s.lo}–{s.hi}B</td>
                  <td style={{ padding: '12px', borderBottom: `1px solid ${C.borderLt}`, textAlign: 'right', fontFamily: mono, color: C.gold, fontWeight: 700 }}>${s.ps}</td>
                  <td style={{ padding: '12px', borderBottom: `1px solid ${C.borderLt}`, textAlign: 'right', fontFamily: mono, fontWeight: 600, color: chg >= 0 ? C.green : C.terra }}>{chg >= 0 ? '+' : ''}{chg.toFixed(0)}%</td>
                  <td style={{ padding: '12px', borderBottom: `1px solid ${C.borderLt}`, color: C.muted, fontSize: 12, lineHeight: 1.5, maxWidth: 300 }}>{s.detail}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RiskRewardTab() {
  return (
    <div>
      <SectionTitle>Risk / Reward & Sensitivity</SectionTitle>
      <NavyCallout style={{ marginBottom: 20 }}>
        <Eyebrow color={C.mintBright}>The Shape at $25</Eyebrow>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: '#E8EAEE' }}>
          Probability-weighted upside is <strong style={{ color: C.mintBright }}>${upsideWtd.toFixed(1)}/share</strong> above price; probability-weighted downside is <strong style={{ color: '#F0A6A0' }}>${downsideWtd.toFixed(1)}/share</strong> below — a <strong style={{ color: '#fff' }}>{ratio.toFixed(1)} : 1</strong> ratio. Strip A+ out entirely and the other scenarios contribute only ~${evExA.toFixed(0)}/share — below the current price. At $25, the base-case scenarios price roughly fair-to-rich, and the 10% A+ tail is doing the work to justify upside. The thesis leans more on A+ here than it did at $22.
        </p>
      </NavyCallout>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 16, marginBottom: 22 }}>
        <Card stripe>
          <Eyebrow>Expected Value vs. A+ Probability</Eyebrow>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={SENS} margin={{ top: 16, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="p" tick={{ ...axisTick, fontSize: 11 }} axisLine={{ stroke: C.border }} tickLine={false} />
                <YAxis domain={[20, 60]} tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<Tip fmt={(v) => `$${v}/sh EV`} />} cursor={{ stroke: C.border }} />
                <ReferenceLine y={PRICE} stroke={C.navy} strokeDasharray="4 4" label={{ value: `Price $${PRICE}`, fill: C.navy, fontSize: 10, fontFamily: mono, position: 'insideBottomLeft' }} />
                <Line type="monotone" dataKey="ev" stroke={C.mintDeep} strokeWidth={2.5} dot={{ fill: C.mintDeep, r: 4 }} activeDot={{ r: 6 }}>
                  <LabelList dataKey="ev" position="top" style={{ fill: C.muted, fontFamily: mono, fontSize: 10 }} formatter={(v) => `$${v}`} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize: 12, color: C.muted, marginTop: 6, marginBottom: 0 }}>
            Even at 5% A+ probability, EV (~$30) sits above the current price. Scenarios A and B carry the thesis independently of the A+ tail.
          </p>
        </Card>
        <Card>
          <Eyebrow color={C.terra}>Outcome Split</Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 6 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: C.green, fontWeight: 600 }}>Above price (A+, A, B)</span>
                <span style={{ fontFamily: mono, color: C.green }}>{pUp}%</span>
              </div>
              <div style={{ height: 10, background: C.bg, borderRadius: 5, overflow: 'hidden', border: `1px solid ${C.borderLt}` }}>
                <div style={{ width: `${pUp}%`, height: '100%', background: C.mintDeep, borderRadius: 5 }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: C.terra, fontWeight: 600 }}>Below price (C–G)</span>
                <span style={{ fontFamily: mono, color: C.terra }}>{pDown}%</span>
              </div>
              <div style={{ height: 10, background: C.bg, borderRadius: 5, overflow: 'hidden', border: `1px solid ${C.borderLt}` }}>
                <div style={{ width: `${pDown}%`, height: '100%', background: C.terra, borderRadius: 5 }} />
              </div>
            </div>
            <div style={{ borderTop: `1px solid ${C.borderLt}`, paddingTop: 12, marginTop: 2 }}>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
                A+ contributes <strong style={{ color: C.gold }}>${(0.10 * 161).toFixed(0)}/sh</strong> of the ~${EV.toFixed(0)} EV at just 10% probability — 42% of expected value in one low-probability tail. The distribution is convex and right-skewed.
              </div>
            </div>
          </div>
        </Card>
      </div>
      <Card>
        <Eyebrow color={C.gold}>How the Pivotal Remapping Datapoint Re-Rates the Thesis</Eyebrow>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 4 }}>
            <thead>
              <tr>
                {['Per-vein durable isolation', 'Read-through', 'Implied scenario', 'A+ probability'].map((h, i) => (
                  <th key={i} style={{ fontFamily: mono, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: C.muted, textAlign: 'left', padding: '10px 12px', borderBottom: `2px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {REMAP_TABLE.map((r, i) => (
                <tr key={i}>
                  <td style={{ padding: '12px', borderBottom: `1px solid ${C.borderLt}`, fontFamily: mono, fontWeight: 700, color: r.tone, whiteSpace: 'nowrap' }}>{r.result}</td>
                  <td style={{ padding: '12px', borderBottom: `1px solid ${C.borderLt}`, color: C.muted, fontSize: 12, lineHeight: 1.5 }}>{r.read}</td>
                  <td style={{ padding: '12px', borderBottom: `1px solid ${C.borderLt}`, color: C.navy, fontWeight: 600, whiteSpace: 'nowrap' }}>{r.sc}</td>
                  <td style={{ padding: '12px', borderBottom: `1px solid ${C.borderLt}`, fontFamily: mono, fontWeight: 700, color: r.tone, whiteSpace: 'nowrap' }}>{r.shift}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function MATab() {
  return (
    <div>
      <SectionTitle>M&A — Precedents & Acquirer Ranking</SectionTitle>
      <Card stripe style={{ marginBottom: 22 }}>
        <Eyebrow>Precedent Transactions (total value, log scale)</Eyebrow>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <BarChart data={MA_COMPS.map(m => ({ name: `${m.t}\n→ ${m.a.split(' ')[0]}`, v: m.val, label: m.label, fill: m.fill }))} margin={{ top: 20, right: 16, left: 0, bottom: 24 }}>
              <CartesianGrid strokeDasharray="2 4" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="name" tick={axisTick} axisLine={{ stroke: C.border }} tickLine={false} interval={0} height={40} />
              <YAxis scale="log" domain={[0.4, 20]} ticks={[0.5, 1, 5, 13]} tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}B`} />
              <Tooltip content={<Tip fmt={(v) => `$${v}B`} />} cursor={{ fill: 'rgba(15,26,46,0.04)' }} />
              <Bar dataKey="v" radius={[3, 3, 0, 0]}>
                {MA_COMPS.map((m, i) => <Cell key={i} fill={m.fill} />)}
                <LabelList dataKey="label" position="top" style={{ fill: C.navy, fontFamily: mono, fontSize: 11, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 8 }}>
          {MA_COMPS.map((m, i) => (
            <div key={i} style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.55 }}>
              <span style={{ color: C.navy, fontWeight: 600 }}>{m.t} ({m.yr}):</span> {m.stage}. {m.note}
            </div>
          ))}
        </div>
      </Card>
      <Eyebrow color={C.gold}>Acquirer Ranking — If A+ Materializes</Eyebrow>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ACQUIRERS.map((a, i) => (
          <Card key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', borderTop: `3px solid ${a.rank === 1 ? C.gold : a.rank <= 4 ? C.steel : C.steelLt}` }}>
            <div style={{ fontFamily: serif, fontSize: 32, fontWeight: 700, fontStyle: 'italic', color: a.rank === 1 ? C.gold : C.steel, lineHeight: 1, minWidth: 32 }}>{a.rank}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 6 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{a.co}</div>
                <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: a.rank === 1 ? C.gold : C.muted }}>{a.bucket}</div>
              </div>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{a.why}</p>
            </div>
          </Card>
        ))}
      </div>
      <Card stripe style={{ marginTop: 18 }}>
        <Eyebrow>The M&A Dynamic That Sets the Ceiling</Eyebrow>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7, color: C.text }}>
          A single motivated buyer (Abbott) sets a floor; a defensive bidding war sets the ceiling. If BSX or MDT moves to block Abbott from securing a next-gen advantage, a contested auction emerges — the dynamic that drove the Farapulse and Shockwave premiums. One offense buyer plus three defense buyers is the structure that supports the upper end of the $7–15B A+ range.
        </p>
      </Card>
    </div>
  );
}

function CatalystsTab() {
  return (
    <div>
      <SectionTitle>Catalysts & Financial Position</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 22 }}>
        <Stat label="Cash (Q1 2026)" value="$68.3M" dollar note="from $80.7M at Q4 2025" />
        <Stat label="Quarterly Burn" value="$14.6M" dollar note="operating cash, accelerating" />
        <Stat label="Runway" value="~4.5 qtrs" note="≈ Q3 2027" />
        <Stat label="Raise Capacity" value="$260M" dollar note="$60M ATM + $200M shelf" />
      </div>
      <Card stripe style={{ marginBottom: 22 }}>
        <Eyebrow>Insider Signal</Eyebrow>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7, color: C.text }}>
          Co-Chairman Robert Duggan bought ~$13M of stock at $19.69 (May 2026); CEO Paul LaViolette added ~$295K. Duggan already owns <strong style={{ color: C.navy }}>71.6%</strong>, so this is a controlling holder adding to an outsized position rather than an independent insider — genuine conviction signaling, and a willingness to backstop capital needs rather than dilute at unfavorable terms, but it does not alter clinical risk.
        </p>
      </Card>
      <Eyebrow color={C.gold}>Catalyst Timeline</Eyebrow>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {CATALYSTS.map((c, i) => {
          const tone = c.impact === 'PRIMARY' ? C.gold : c.impact === 'Signal' ? C.mintDeep : c.impact === 'M&A' ? C.steel : C.ochre;
          return (
            <div key={i} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: i < CATALYSTS.length - 1 ? `1px solid ${C.borderLt}` : 'none' }}>
              <div style={{ minWidth: 130 }}>
                <div style={{ fontFamily: mono, fontSize: 11, color: tone, fontWeight: 600 }}>{c.when}</div>
                <div style={{ display: 'inline-block', marginTop: 6, fontFamily: mono, fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: tone, border: `1px solid ${tone}`, borderRadius: 4, padding: '2px 6px' }}>{c.impact}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: C.navy, marginBottom: 4 }}>{c.what}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{c.note}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHELL
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  ['thesis', 'Thesis', ThesisTab],
  ['tech', 'Technology', TechTab],
  ['clinical', 'Clinical Data', ClinicalTab],
  ['markets', 'Markets', MarketsTab],
  ['comp', 'Competitive', CompetitiveTab],
  ['scenarios', 'Scenarios', ScenariosTab],
  ['risk', 'Risk / Reward', RiskRewardTab],
  ['ma', 'M&A & Acquirers', MATab],
  ['catalysts', 'Catalysts', CatalystsTab],
];

export default function App() {
  const [tab, setTab] = useState('thesis');
  const Active = TABS.find(t => t[0] === tab)[2];

  useEffect(() => {
    const links = [
      'https://api.fontshare.com/v2/css?f[]=erode@400,500,600,700&display=swap',
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap',
    ];
    const els = links.map(href => {
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.appendChild(l); return l;
    });
    return () => els.forEach(el => el.remove());
  }, []);

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: sans, color: C.text }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 24px 80px' }}>
        <div style={{ background: C.navy, borderRadius: 12, borderTop: `3px solid ${C.mint}`, padding: '24px 28px', marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: C.mintBright, marginBottom: 10 }}>Equity Research · Bioelectric Medicine</div>
              <h1 style={{ fontFamily: serif, fontSize: 38, fontWeight: 400, color: '#fff', margin: 0, lineHeight: 1.08 }}>
                Pulse Biosciences <span style={{ color: C.mintBright, fontWeight: 500 }}>(PLSE)</span>
              </h1>
              <div style={{ fontSize: 14, color: '#A9B2C2', marginTop: 8 }}>Nanosecond Pulsed Field Ablation — Technology, Markets, Scenarios & Valuation</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: serif, fontSize: 36, fontWeight: 600, color: C.gold, lineHeight: 1 }}>${PRICE}</div>
              <div style={{ fontFamily: mono, fontSize: 11, color: C.mintBright, marginTop: 6 }}>EV ~${EV.toFixed(0)} · {ratio.toFixed(1)}:1 R/R</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', margin: '18px 0 28px', borderBottom: `1px solid ${C.border}` }}>
          {TABS.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: sans, fontSize: 13, fontWeight: tab === id ? 700 : 500, color: tab === id ? C.navy : C.muted, padding: '9px 15px', borderBottom: tab === id ? `2px solid ${C.mint}` : '2px solid transparent', marginBottom: -1, transition: 'color 0.15s' }}>
              {label}
            </button>
          ))}
        </div>
        <Active />
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 18, marginTop: 40, fontSize: 11, color: C.faint, lineHeight: 1.7 }}>
          For informational and discussion purposes only; not investment advice. Probability estimates and valuation ranges are subjective and illustrative. The probability-weighted value (~${EV.toFixed(0)}/share) is a weighted estimate, not a price target — realized outcomes will be one discrete scenario, not the average. Clinical-stage medical device companies carry substantial risk including total loss of capital. Figures from public filings, press releases, and third-party market research; market data subject to change. Primary-source discipline applied; media items labeled where used.
        </div>
      </div>
    </div>
  );
}
