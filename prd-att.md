# Prompt: Template completo de resultado + Step5 completo + imagem da faixa

## Contexto do projeto atual
- Next.js na Vercel
- Embed script em `src/app/embed/[id]/route.ts` — já existe mas `renderResult()` é básico
- Builder Step5 em `src/components/builder/Step5ResultPage.tsx` — existe mas falta muitos campos
- Step3 Bands em `src/components/builder/Step3Bands.tsx` — já tem `image_url` por faixa ✅
- `QuizSettings.result_page` é `Record<string, unknown>` — aceita qualquer campo

## Problemas a resolver

1. `renderResult()` no embed é básico — mostra só badge, imagem e descrição
2. `Step5ResultPage.tsx` falta muitos campos (solution_items, deliverables, pricing_features, steps, needs, benefit, social_proof, comp icons, etc)
3. Imagem da faixa não aparece no resultado — já está salva em `result.image_url` (Step3), só precisa renderizar
4. `export const runtime = 'edge'` em todos os routes — remover pois está na Vercel
5. `function html(strings) { return strings; }` no embed — código morto, remover
6. `savePartial()` não envia leadName, leadEmail, whatsapp

---

## TAREFA 1 — Substituir renderResult() no embed script

Arquivo: `src/app/embed/[id]/route.ts`

Substituir a função `renderResult` dentro da template string pelo código abaixo.
Também corrigir `savePartial()` e remover `function html(strings) { return strings; }`.
Remover `export const runtime = 'edge'` do topo.

### renderResult() completa:

```javascript
function renderResult(band, bandData) {
  var s = state.quiz.settings || {};
  var rp = s.result_page || {};
  var result = bandData || (s.results && s.results[band]) || {};
  var lang = s.language || 'es';
  var bandColor = result.color || '#426A35';
  var badgeTextColor = result.badge_text_color || '#ffffff';

  if (rp.type === 'manual') {
    render(rp.manual_html || '<p>Conteúdo não configurado.</p>');
    return;
  }

  var copyBands = {
    es: {
      leve: { headline: 'Tu cuerpo presenta señales iniciales de inflamación', description: 'Este es el momento ideal para actuar e prevenir el avance.' },
      moderada: { headline: 'Tu cuerpo presenta inflamación moderada', description: 'Los síntomas ya afectan tu qualidade de vida.' },
      moderada_avancada: { headline: 'Tu cuerpo presenta señales de inflamación moderada a avanzada', description: 'Es crucial actuar ahora para evitar daños irreversíveis.' },
      avancada: { headline: 'Tu cuerpo apresenta señales de inflamación avanzada', description: 'Atención urgente: tu cuerpo necesita un protocolo específico ahora.' }
    },
    pt: {
      leve: { headline: 'Seu corpo apresenta sinais iniciais de inflamação', description: 'Este é o momento ideal para agir e prevenir o avanço.' },
      moderada: { headline: 'Seu corpo apresenta inflamação moderada', description: 'Os sintomas já afetam sua qualidade de vida.' },
      moderada_avancada: { headline: 'Seu corpo apresenta sinais de inflamação moderada a avançada', description: 'É crucial agir agora para evitar danos irreversíveis.' },
      avancada: { headline: 'Seu corpo apresenta sinais de inflamação avançada', description: 'Atenção urgente: seu corpo precisa de um protocolo específico agora.' }
    }
  };
  var copy = (copyBands[lang] || copyBands.es)[band] || copyBands.es.leve;

  var symptomsMap = {
    es: {
      leve: ['❌ Tu cuerpo está acumulando inflamación silenciosa', '❌ Edemas esporádicos en piernas y brazos', '❌ Fatiga y pesadez frecuente'],
      moderada: ['❌ Tu cuerpo está acumulando inflamación', '❌ Esto aumenta el edema y la sensación de pesadez', '❌ La grasa no responde a la dieta común'],
      moderada_avancada: ['❌ Tu cuerpo está acumulando inflamación', '❌ La grasa no responde a la dieta común', '❌ Los síntomas tienden a empeorar con el tiempo'],
      avancada: ['❌ Inflamación sistémica avanzada', '❌ Dificultad para caminar y moverse', '❌ Dolores intensos al tacto', '❌ Los síntomas empeoran sin tratamiento específico']
    },
    pt: {
      leve: ['❌ Seu corpo está acumulando inflamação silenciosa', '❌ Edemas esporádicos nas pernas e braços', '❌ Fadiga e sensação de peso frequente'],
      moderada: ['❌ Seu corpo está acumulando inflamação', '❌ Isso aumenta o inchaço e a sensação de peso', '❌ A gordura não responde à dieta comum'],
      moderada_avancada: ['❌ Seu corpo está acumulando inflamação', '❌ A gordura não responde à dieta comum', '❌ Os sintomas tendem a piorar com o tempo'],
      avancada: ['❌ Inflamação sistêmica avançada', '❌ Dificuldade de locomoção', '❌ Dores intensas ao toque', '❌ Os sintomas pioram sem tratamento específico']
    }
  };
  var symptoms = (symptomsMap[lang] || symptomsMap.es)[band] || symptomsMap.es.moderada;

  var scorePercent = Math.min(95, Math.max(10, (state.score / 20) * 100));
  var compItems = [
    { today: rp.comp_item_1_today || (lang==='pt'?'Dores constantes':'Dolores constantes'), after: rp.comp_item_1_after || (lang==='pt'?'Alívio total da dor':'Alivio total del dolor'), todayVal: Math.min(scorePercent+10,90) },
    { today: rp.comp_item_2_today || (lang==='pt'?'Inchaço e peso':'Hinchazón y pesadez'), after: rp.comp_item_2_after || (lang==='pt'?'Pernas leves':'Piernas ligeras'), todayVal: Math.min(scorePercent+20,95) },
    { today: rp.comp_item_3_today || (lang==='pt'?'Celulite aparente':'Celulitis aparente'), after: rp.comp_item_3_after || (lang==='pt'?'Pele mais lisa':'Piel más lisa'), todayVal: Math.min(scorePercent+5,85) },
    { today: rp.comp_item_4_today || (lang==='pt'?'Falta de energia':'Falta de energía'), after: rp.comp_item_4_after || (lang==='pt'?'Mais disposição':'Más disposición'), todayVal: Math.min(scorePercent+15,80) }
  ];

  var ctaUrl = result.offer_url || s.cta_offer_url || '#';
  var html = '<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">';

  // 1. Imagem da faixa (vem do Step3 Bands — result.image_url)
  if (result.image_url) {
    html += '<img src="' + result.image_url + '" loading="lazy" style="width:100%;max-width:708px;height:320px;object-fit:cover;border-radius:32px;display:block;margin:0 auto 24px;box-shadow:0 10px 25px rgba(0,0,0,0.1)" />';
  }

  // 2. Badge de resultado
  html += '<div style="background:#fff8f0;border:1px solid #fde68a;border-left:4px solid #f97316;border-radius:12px;padding:16px 18px;margin-bottom:20px">';
  html += '<p style="font-size:12px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 6px">' + (rp.result_badge_label || '⚠️ TU RESULTADO basado en tus respuestas:') + '</p>';
  html += '<div style="display:inline-block;background:' + bandColor + ';color:' + badgeTextColor + ';padding:10px 28px;border-radius:30px;font-size:16px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:8px">' + (result.label || band) + '</div>';
  html += '</div>';

  // 3. Journey Chart SVG
  html += '<div style="margin-bottom:28px"><div style="text-align:center;margin-bottom:14px">';
  html += '<h3 style="font-size:19px;font-weight:800;color:#1e293b;margin:0 0 6px">' + (rp.journey_title || (lang==='pt'?'Sua Jornada nos Próximos 30 Dias':'Tu Jornada en los Próximos 30 Días')) + '</h3>';
  html += '<p style="font-size:13px;color:#64748b;margin:0">' + (rp.journey_subtitle || '') + '</p></div>';
  html += '<div style="position:relative"><span style="position:absolute;top:8px;right:4px;background:#22c55e;color:#fff;font-size:11px;font-weight:800;padding:4px 10px;border-radius:20px;z-index:1">' + (rp.journey_days_badge || '30 DÍAS') + '</span>';
  html += '<svg viewBox="0 0 400 200" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg">';
  html += '<defs><linearGradient id="hbqGrad' + QUIZ_ID + '" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:#ef4444"/><stop offset="40%" style="stop-color:#f97316"/><stop offset="70%" style="stop-color:#eab308"/><stop offset="100%" style="stop-color:#22c55e"/></linearGradient></defs>';
  html += '<line x1="45" y1="20" x2="390" y2="20" stroke="#f1f5f9" stroke-width="1"/><line x1="45" y1="57" x2="390" y2="57" stroke="#f1f5f9" stroke-width="1"/><line x1="45" y1="94" x2="390" y2="94" stroke="#f1f5f9" stroke-width="1"/><line x1="45" y1="131" x2="390" y2="131" stroke="#f1f5f9" stroke-width="1"/><line x1="45" y1="168" x2="390" y2="168" stroke="#e2e8f0" stroke-width="1"/>';
  html += '<text x="38" y="172" text-anchor="end" font-size="10" fill="#94a3b8">0</text><text x="38" y="135" text-anchor="end" font-size="10" fill="#94a3b8">25</text><text x="38" y="98" text-anchor="end" font-size="10" fill="#94a3b8">50</text><text x="38" y="61" text-anchor="end" font-size="10" fill="#94a3b8">75</text><text x="38" y="24" text-anchor="end" font-size="10" fill="#94a3b8">100</text>';
  html += '<polygon points="48,168 390,168 390,20" fill="url(#hbqGrad' + QUIZ_ID + ')" opacity="0.88"/>';
  html += '<circle cx="48" cy="168" r="7" fill="#ef4444" stroke="#fff" stroke-width="2.5"/><circle cx="390" cy="20" r="7" fill="#22c55e" stroke="#fff" stroke-width="2.5"/>';
  html += '<text x="62" y="185" font-size="10" font-weight="700" fill="#ef4444">' + (rp.journey_label_today || 'HOY') + '</text>';
  html += '<text x="388" y="14" font-size="10" font-weight="700" fill="#22c55e" text-anchor="end">' + (rp.journey_label_future || 'EN 30 DÍAS') + '</text>';
  html += '</svg></div></div>';

  // 4. Comparativo com barras de progresso
  html += '<div style="background:#fff;border:1px solid #e8e8e8;border-radius:16px;padding:20px;margin-bottom:24px"><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';
  html += '<div style="background:#fff;border-radius:12px;padding:14px;border:1px solid #e2e8f0"><div style="text-align:center;margin-bottom:12px"><span style="font-size:28px;display:block;margin-bottom:6px">' + (rp.comp_today_icon||'⏰') + '</span><span style="font-size:12px;font-weight:800;color:#475569;text-transform:uppercase">' + (rp.comp_today_title||(lang==='pt'?'Onde você está hoje':'Donde estás hoy')) + '</span></div>';
  compItems.forEach(function(item) { html += '<div style="margin-bottom:10px"><div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:3px;display:flex;justify-content:space-between"><span>' + item.today + '</span><span style="color:#94a3b8">' + Math.round(item.todayVal) + '%</span></div><div style="height:8px;background:#f1f5f9;border-radius:4px;overflow:hidden"><div style="height:100%;width:' + item.todayVal + '%;background:#ef4444;border-radius:4px"></div></div></div>'; });
  html += '</div>';
  html += '<div style="background:#fff;border-radius:12px;padding:14px;border:1px solid #e2e8f0"><div style="text-align:center;margin-bottom:12px"><span style="font-size:28px;display:block;margin-bottom:6px">' + (rp.comp_after_icon||'✨') + '</span><span style="font-size:12px;font-weight:800;color:#475569;text-transform:uppercase">' + (rp.comp_after_title||(lang==='pt'?'Em 30 dias':'En 30 Días')) + '</span></div>';
  compItems.forEach(function(item) { html += '<div style="margin-bottom:10px"><div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:3px;display:flex;justify-content:space-between"><span>' + item.after + '</span><span style="color:#94a3b8">100%</span></div><div style="height:8px;background:#f1f5f9;border-radius:4px;overflow:hidden"><div style="height:100%;width:100%;background:linear-gradient(90deg,#22c55e,#5a9e42);border-radius:4px"></div></div></div>'; });
  html += '</div></div></div>';

  // 5. Diagnóstico + sintomas
  html += '<div style="background:#f0fdf4;border:1px solid #dcfce7;border-radius:14px;padding:20px;margin-bottom:20px">';
  html += '<p style="font-size:16px;font-weight:700;color:#166534;margin:0 0 12px">' + (rp.diagnosis_heading || copy.headline) + '</p>';
  html += '<ul style="list-style:none;padding:0;margin:0">';
  symptoms.forEach(function(sym) { html += '<li style="padding:10px 14px;font-size:14px;color:#065f46;background:rgba(16,185,129,0.05);border-radius:8px;margin-bottom:6px;font-weight:500;border-left:3px solid #10b981">' + sym + '</li>'; });
  html += '</ul></div>';

  // 6. Boa notícia
  if (rp.goodnews_text) { html += '<div style="background:linear-gradient(135deg,#f0f7ed,#e8f5e3);border:1px solid #c5e1b5;border-radius:14px;padding:18px 20px;margin-bottom:20px"><p style="font-size:15px;color:#2d5a1e;line-height:1.5;margin:0">' + rp.goodnews_text + '</p></div>'; }

  // 7. O que seu corpo precisa
  if (rp.needs_title) {
    html += '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:20px;margin-bottom:20px">';
    html += '<h3 style="font-size:16px;font-weight:800;color:#14532d;margin:0 0 10px">' + rp.needs_title + '</h3>';
    if (rp.needs_desc) html += '<p style="font-size:15px;color:#166534;margin:0 0 6px;line-height:1.5">' + rp.needs_desc + '</p>';
    if (rp.needs_cta) html += '<p style="font-size:16px;font-weight:700;color:#15803d;margin:0">' + rp.needs_cta + '</p>';
    html += '</div>';
  }

  // 8. Solução
  if (rp.solution_title) {
    html += '<div style="background:linear-gradient(135deg,#f0f6ee,#e8f0e5);border:1px solid #c5ddb8;border-radius:16px;padding:28px 24px;margin-bottom:24px;position:relative;overflow:hidden">';
    if (rp.solution_badge) html += '<div style="display:inline-block;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;font-size:12px;font-weight:800;padding:6px 14px;border-radius:20px;margin-bottom:14px;text-transform:uppercase">' + rp.solution_badge + '</div>';
    html += '<h3 style="font-size:22px;font-weight:800;margin:0 0 12px;color:#333">' + rp.solution_title + '</h3>';
    if (rp.solution_desc) html += '<div style="font-size:15px;color:#555;line-height:1.6;margin-bottom:16px">' + rp.solution_desc + '</div>';
    var solItems = Array.isArray(rp.solution_items) ? rp.solution_items.filter(Boolean) : [];
    if (solItems.length) { html += '<ul style="list-style:none;padding:0;margin:16px 0">'; solItems.forEach(function(item) { html += '<li style="margin-bottom:10px;font-size:15px;padding:10px 14px;background:rgba(66,106,53,0.08);border-radius:8px;font-weight:500;color:#333">' + item + '</li>'; }); html += '</ul>'; }
    html += '</div>';
  }

  // 9. Como funciona
  if (rp.step_1_title || rp.step_2_title) {
    html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px 20px;margin-bottom:24px">';
    html += '<h3 style="font-size:15px;font-weight:800;color:#1e293b;margin:0 0 16px">🪜 ' + (lang==='pt'?'COMO FUNCIONA':'CÓMO FUNCIONA') + '</h3>';
    if (rp.step_1_title) { html += '<div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px"><span style="font-size:28px;flex-shrink:0">' + (rp.step_1_icon||'🥗') + '</span><div><strong style="display:block;font-size:15px;font-weight:700;color:#1e293b;margin-bottom:4px">' + rp.step_1_title + '</strong><p style="font-size:14px;color:#64748b;margin:0;line-height:1.4">' + (rp.step_1_text||'') + '</p></div></div>'; }
    if (rp.step_2_title) { html += '<div style="display:flex;gap:12px;align-items:flex-start"><span style="font-size:28px;flex-shrink:0">' + (rp.step_2_icon||'🔥') + '</span><div><strong style="display:block;font-size:15px;font-weight:700;color:#1e293b;margin-bottom:4px">' + rp.step_2_title + '</strong><p style="font-size:14px;color:#64748b;margin:0;line-height:1.4">' + (rp.step_2_text||'') + '</p></div></div>'; }
    html += '</div>';
  }

  // 10. Entregáveis
  var deliverables = Array.isArray(rp.deliverables) ? rp.deliverables.filter(Boolean) : [];
  if (deliverables.length) {
    html += '<div style="background:linear-gradient(135deg,#f0f6ee,#e8f0e5);border:1px solid #c5ddb8;border-radius:16px;padding:20px;margin-bottom:20px">';
    if (rp.deliverables_title) html += '<h3 style="font-size:16px;font-weight:800;color:#14532d;margin:0 0 14px">' + rp.deliverables_title + '</h3>';
    html += '<ul style="list-style:none;padding:0;margin:0">';
    deliverables.forEach(function(d) { html += '<li style="padding:10px 0;font-size:15px;color:#166534;font-weight:600;border-bottom:1px solid rgba(66,106,53,0.15)">✔ ' + d + '</li>'; });
    html += '</ul></div>';
  }

  // 11. Benefício imediato
  if (rp.benefit_text) {
    html += '<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:14px;padding:16px 18px;margin-bottom:20px;text-align:center">';
    if (rp.benefit_badge_label) html += '<span style="display:inline-block;background:#f59e0b;color:#fff;font-size:12px;font-weight:800;padding:4px 12px;border-radius:20px;margin-bottom:10px;text-transform:uppercase">' + rp.benefit_badge_label + '</span>';
    html += '<p style="font-size:15px;font-weight:600;color:#92400e;margin:0">' + rp.benefit_text + '</p></div>';
  }

  // 12. Pricing card
  html += '<div style="background:#fff;border:1px solid #e0e0e0;border-radius:16px;overflow:hidden;margin-bottom:24px">';
  var pricingFeatures = Array.isArray(rp.pricing_features) ? rp.pricing_features.filter(Boolean) : [];
  html += '<div style="display:flex">';
  if (pricingFeatures.length) { html += '<div style="flex:1;background:#f0f6ee;padding:20px"><ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px">'; pricingFeatures.forEach(function(f) { html += '<li style="font-size:13px;color:#166534;font-weight:600">✔ ' + f + '</li>'; }); html += '</ul></div>'; }
  html += '<div style="flex:1;padding:20px;text-align:center">';
  if (rp.offer_label) html += '<p style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px">' + rp.offer_label + '</p>';
  if (rp.price_from) html += '<p style="font-size:14px;color:#94a3b8;margin:0 0 4px">DE <span style="text-decoration:line-through">' + rp.price_from + '</span></p>';
  if (rp.offer_sublabel) html += '<p style="font-size:14px;color:#475569;font-weight:600;margin:0 0 4px">' + rp.offer_sublabel + '</p>';
  html += '<div style="display:flex;align-items:flex-end;justify-content:center;gap:4px;margin-bottom:16px;line-height:1"><span style="font-size:56px;font-weight:900;color:#1e293b;line-height:1">' + (rp.price_to||'9') + '</span><span style="font-size:18px;font-weight:700;color:#64748b;margin-bottom:8px">' + (rp.price_currency||'USD') + '</span></div>';
  html += '</div></div>';
  html += '<div style="padding:20px;text-align:center">';
  html += '<a href="' + ctaUrl + '" target="_blank" style="display:block;background:#426A35;color:#fff;padding:20px;border-radius:12px;font-weight:800;font-size:18px;text-decoration:none;box-shadow:0 6px 20px rgba(66,106,53,0.3);margin-bottom:12px">' + (rp.cta_text||(lang==='pt'?'QUERO COMEÇAR AGORA →':'QUIERO EMPEZAR AHORA →')) + '</a>';
  if (rp.guarantee_text) html += '<p style="font-size:13px;color:#64748b;margin:0 0 4px">' + rp.guarantee_text + '</p>';
  if (rp.offer_footer_1) html += '<p style="font-size:12px;color:#888;margin:0 0 2px">' + rp.offer_footer_1 + '</p>';
  if (rp.offer_footer_2) html += '<p style="font-size:12px;color:#888;margin:0">' + rp.offer_footer_2 + '</p>';
  html += '</div></div>';

  // 13. Prova social
  if (rp.show_social_proof && rp.gallery_ids) {
    var galleryUrls = String(rp.gallery_ids).split(',').map(function(u){return u.trim();}).filter(Boolean);
    if (galleryUrls.length) {
      html += '<div style="margin-bottom:24px;text-align:center">';
      if (rp.social_proof_title) html += '<p style="font-weight:700;margin-bottom:4px;font-size:17px">' + rp.social_proof_title + '</p>';
      if (rp.social_proof_subtitle) html += '<p style="font-weight:600;color:#4a6d41;font-size:14px;margin-bottom:12px">' + rp.social_proof_subtitle + '</p>';
      html += '<div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:8px">';
      galleryUrls.forEach(function(url){ html += '<img src="' + url + '" loading="lazy" style="min-width:280px;height:200px;object-fit:cover;border-radius:12px" />'; });
      html += '</div></div>';
    }
  }

  // 14. Urgência final
  if (rp.urgency_text) { html += '<div style="background:#fff3cd;border:1px solid #ffc107;border-radius:16px;padding:20px;margin-bottom:20px;text-align:center"><p style="font-size:15px;color:#856404;margin:0">' + rp.urgency_text + '</p></div>'; }

  html += '</div>';
  render(html);
}
```

### savePartial() corrigida:

```javascript
function savePartial() {
  fetch(API_BASE + '/api/public/responses/partial', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quizId: QUIZ_ID,
      responseId: state.responseId,
      leadName: state.leadName,
      leadEmail: state.leadEmail,
      whatsapp: state.whatsapp,
      score: state.score,
      resultBand: '',
      answers: state.answers,
      source: window.location.href,
    }),
  }).then(function(r) { return r.json(); }).then(function(d) {
    if (d.response_id) state.responseId = d.response_id;
  }).catch(function() {});
}
```

---

## TAREFA 2 — Substituir Step5ResultPage.tsx completo

Arquivo: `src/components/builder/Step5ResultPage.tsx`

Substituir completamente pelo componente abaixo com todos os campos:

```tsx
'use client'
import { Toggle } from '@/components/ui/Toggle'
import type { QuizSettings } from '@/lib/sanitize'

interface Props {
  settings: QuizSettings
  onChange: (s: QuizSettings) => void
}

const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-xl border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-700">{title}</h3>
      {children}
    </section>
  )
}

export function Step5ResultPage({ settings, onChange }: Props) {
  const rp = (settings.result_page ?? {}) as Record<string, unknown>

  function setRp(key: string) {
    return (val: unknown) => onChange({ ...settings, result_page: { ...rp, [key]: val } })
  }

  function text(label: string, key: string, placeholder?: string) {
    return (
      <Field label={label}>
        <input className={inp} value={(rp[key] as string) ?? ''} onChange={(e) => setRp(key)(e.target.value)} placeholder={placeholder} />
      </Field>
    )
  }

  function textarea(label: string, key: string, rows = 3) {
    return (
      <Field label={label}>
        <textarea className={inp} rows={rows} value={(rp[key] as string) ?? ''} onChange={(e) => setRp(key)(e.target.value)} />
      </Field>
    )
  }

  function listField(label: string, key: string, count: number, placeholder?: string) {
    const arr = Array.isArray(rp[key]) ? (rp[key] as string[]) : Array(count).fill('')
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {arr.map((val: string, i: number) => (
          <input key={i} className={inp} value={val ?? ''} placeholder={placeholder ? `${placeholder} ${i + 1}` : ''} onChange={(e) => {
            const next = [...arr]
            next[i] = e.target.value
            setRp(key)(next)
          }} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold text-gray-800">5. Página de Resultado</h2>

      <Field label="Tipo da página">
        <select className={inp} value={(rp.type as string) ?? 'standard'} onChange={(e) => setRp('type')(e.target.value)}>
          <option value="standard">Padrão (template)</option>
          <option value="manual">HTML Manual</option>
        </select>
      </Field>

      {rp.type === 'manual' ? (
        textarea('HTML Manual', 'manual_html', 10)
      ) : (
        <div className="space-y-6">

          <Section title="🏷️ Badge de resultado">
            {text('Label do badge', 'result_badge_label', '⚠️ TU RESULTADO basado en tus respuestas:')}
          </Section>

          <Section title="📈 Jornada (Journey Chart)">
            {text('Título', 'journey_title', 'Tu Jornada en los Próximos 30 Días')}
            {text('Subtítulo', 'journey_subtitle')}
            {text('Label Hoje', 'journey_label_today', 'HOY')}
            {text('Label Futuro', 'journey_label_future', 'EN 30 DÍAS')}
            {text('Badge de dias', 'journey_days_badge', '30 DÍAS')}
          </Section>

          <Section title="📊 Comparativo (hoje vs depois)">
            <div className="grid grid-cols-2 gap-3">
              {text('Ícone coluna Hoje', 'comp_today_icon')}
              {text('Ícone coluna Depois', 'comp_after_icon')}
              {text('Título coluna Hoje', 'comp_today_title')}
              {text('Título coluna Depois', 'comp_after_title')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="space-y-2 rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-semibold text-gray-500">Item {i}</p>
                  <input className={inp} placeholder="Hoje" value={(rp[`comp_item_${i}_today`] as string) ?? ''} onChange={(e) => setRp(`comp_item_${i}_today`)(e.target.value)} />
                  <input className={inp} placeholder="Depois" value={(rp[`comp_item_${i}_after`] as string) ?? ''} onChange={(e) => setRp(`comp_item_${i}_after`)(e.target.value)} />
                </div>
              ))}
            </div>
          </Section>

          <Section title="🩺 Diagnóstico">
            {text('Heading do diagnóstico', 'diagnosis_heading', '⚠️ Lo que esto significa en la práctica:')}
            {textarea('Texto boa notícia', 'goodnews_text')}
          </Section>

          <Section title="🎯 O que seu corpo precisa">
            {text('Título', 'needs_title')}
            {text('Descrição', 'needs_desc')}
            {text('CTA', 'needs_cta')}
          </Section>

          <Section title="💊 Solução">
            {text('Badge da solução', 'solution_badge')}
            {text('Título', 'solution_title')}
            {textarea('Descrição', 'solution_desc')}
            {listField('Itens da solução (até 4)', 'solution_items', 4, 'Item')}
          </Section>

          <Section title="🪜 Como funciona">
            <div className="grid grid-cols-2 gap-3">
              {text('Ícone passo 1', 'step_1_icon')}
              {text('Ícone passo 2', 'step_2_icon')}
            </div>
            {text('Título passo 1', 'step_1_title')}
            {text('Texto passo 1', 'step_1_text')}
            {text('Título passo 2', 'step_2_title')}
            {text('Texto passo 2', 'step_2_text')}
          </Section>

          <Section title="🎁 Entregáveis">
            {text('Título', 'deliverables_title')}
            {listField('Entregáveis (até 6)', 'deliverables', 6, 'Entregável')}
          </Section>

          <Section title="⚡ Benefício imediato">
            {text('Badge', 'benefit_badge_label')}
            {text('Texto', 'benefit_text')}
          </Section>

          <Section title="💰 Oferta / Pricing">
            {text('Label oferta', 'offer_label')}
            {text('Sub-label', 'offer_sublabel')}
            {listField('Features do pricing (até 3)', 'pricing_features', 3, 'Feature')}
            <div className="grid grid-cols-3 gap-3">
              {text('Preço DE', 'price_from')}
              {text('Preço POR', 'price_to')}
              {text('Moeda', 'price_currency')}
            </div>
            {text('Texto do CTA', 'cta_text')}
            {text('Garantia', 'guarantee_text')}
            {text('Rodapé 1', 'offer_footer_1')}
            {text('Rodapé 2', 'offer_footer_2')}
          </Section>

          <Section title="📸 Prova Social">
            <Field label="Exibir prova social">
              <Toggle
                checked={Boolean(rp.show_social_proof)}
                onChange={(v) => setRp('show_social_proof')(v)}
              />
            </Field>
            {Boolean(rp.show_social_proof) && (
              <>
                {text('Título', 'social_proof_title')}
                {text('Subtítulo', 'social_proof_subtitle')}
                <Field label="URLs das imagens (separadas por vírgula)">
                  <textarea
                    className={inp}
                    rows={3}
                    placeholder="https://exemplo.com/foto1.jpg, https://exemplo.com/foto2.jpg"
                    value={(rp.gallery_ids as string) ?? ''}
                    onChange={(e) => setRp('gallery_ids')(e.target.value)}
                  />
                </Field>
              </>
            )}
          </Section>

          <Section title="⚠️ Urgência final">
            {textarea('Texto de urgência', 'urgency_text')}
          </Section>

        </div>
      )}
    </div>
  )
}
```

---

## TAREFA 3 — Remover export const runtime = 'edge'

Executar e remover de todos os arquivos encontrados:
```bash
grep -rl "export const runtime" src/ --include="*.ts" --include="*.tsx"
```

---

## TAREFA 4 — next.config.ts — AVIF + remotePatterns

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '*.uploadthing.com' },
      { protocol: 'https', hostname: '*.ufs.sh' },
      { protocol: 'https', hostname: '*.utfs.io' },
    ],
  },
}

export default nextConfig
```

---

## Resumo

| Arquivo | Mudança |
|---|---|
| `src/app/embed/[id]/route.ts` | renderResult() completa 14 seções + savePartial() com lead data + remover código morto + remover runtime edge |
| `src/components/builder/Step5ResultPage.tsx` | Substituir completamente com todos os campos |
| `src/app/api/**/route.ts` | Remover `export const runtime = 'edge'` |
| `next.config.ts` | AVIF + remotePatterns Uploadthing |