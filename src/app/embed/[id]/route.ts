import { NextRequest } from 'next/server'
import { getQuizById } from '@/lib/db/queries/quizzes'
import { corsHeaders } from '@/lib/cors'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const quiz = await getQuizById(id)

  if (!quiz || quiz.status !== 'active') {
    return new Response(`console.warn('[HBQ] Quiz ${id} not found or inactive');`, {
      headers: { 'Content-Type': 'application/javascript', ...corsHeaders },
    })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? ''

  const script = `
(function() {
  var QUIZ_DATA = ${JSON.stringify(quiz).replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${').replace(/</g, '\\u003c')};
  var QUIZ_ID = "${quiz.id}";
  var API_BASE = '${appUrl}';

  var currentScript = document.currentScript;
  var container = document.createElement('div');
  container.id = 'hbq-' + QUIZ_ID;
  container.style.fontFamily = 'system-ui, sans-serif';
  container.style.maxWidth = '708px';
  container.style.margin = '0 auto';
  container.style.backgroundColor = 'transparent';
  container.style.boxShadow = 'none';
  container.style.border = 'none';
  if (currentScript && currentScript.parentNode) {
    currentScript.parentNode.insertBefore(container, currentScript);
  } else {
    document.body.appendChild(container);
  }

  var state = {
    quiz: null,
    currentQuestion: -1,
    answers: [],
    score: 0,
    responseId: null,
    leadName: '',
    leadEmail: '',
    whatsapp: '',
    totalQuestions: 0,
  };

  function render(content) {
    container.innerHTML = content;
    container.style.display = 'block';
    container.style.visibility = 'visible';
    container.style.opacity = '1';
    // Garante que o container respeite a largura máxima de 708px
    container.style.maxWidth = '708px';
    container.style.width = '100%';
    container.style.boxSizing = 'border-box';
  }

  function renderLoading() {
    render('<div style="text-align:center;padding:40px;color:#666">Carregando quiz...</div>');
  }

  function renderLanding() {
    var s = state.quiz.settings || {};
    var checklistHtml = '';
    ['checklist_item_1', 'checklist_item_2', 'checklist_item_3'].forEach(function(key) {
      if (s[key]) {
        var text = s[key].replace(/^[✔✅\s]+/, ''); // Remove checkmarks from start of string
        checklistHtml += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;color:#4a5568;font-size:0.95em">' +
          '<span style="color:#426a35;font-size:1.2em">✅</span>' +
          '<span style="text-align:left">' + text + '</span>' +
          '</div>';
      }
    });

    render(
      '<div style="text-align:center;padding:32px;background:#fff;border-radius:12px;box-shadow:none;border:none">' +
      (s.landing_image ? '<img src="' + s.landing_image + '" loading="lazy" style="width:100%;max-width:708px;height:auto;max-height:320px;object-fit:cover;border-radius:12px;margin:0 auto 24px;display:block" />' : '') +
      (s.badge_text ? '<div style="display:inline-block;background:#f1f7ee;color:#426a35;padding:6px 16px;border-radius:20px;font-size:0.85em;font-weight:700;margin-bottom:16px;text-transform:uppercase;letter-spacing:0.5px">' + s.badge_text + '</div>' : '') +
      (s.headline ? '<h2 style="font-size:1.6em;font-weight:700;margin-bottom:12px;color:#1a202c;line-height:1.3">' + s.headline + '</h2>' : '<h2 style="font-size:1.6em;font-weight:700;margin-bottom:12px;color:#1a202c">' + state.quiz.title + '</h2>') +
      (s.subheadline ? '<div style="color:#4a5568;margin-bottom:24px;line-height:1.6;font-size:1.05em">' + s.subheadline + '</div>' : '') +
      (checklistHtml ? '<div style="display:inline-block;text-align:left;max-width:420px;margin:0 auto 24px;padding:0">' + checklistHtml + '</div>' : '') +
      (s.urgency_text ? '<p style="color:#dc2626;font-size:0.95em;font-weight:600;margin-bottom:24px;background:#fef2f2;padding:12px;border-radius:8px;max-width:500px;margin-left:auto;margin-right:auto">' + s.urgency_text + '</p>' : '') +
      '<button id="hbq-start" style="background:#426a35;color:#fff;border:none;padding:18px 48px;border-radius:12px;font-size:1.15em;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(66,106,53,0.3);transition:transform 0.2s;width:100%;max-width:400px;display:block;margin:0 auto">' + (s.cta_button || 'Iniciar Quiz') + '</button>' +
      '</div>'
    );
    var startBtn = document.getElementById('hbq-start');
    if (startBtn) {
      startBtn.onmouseover = function() { this.style.transform = 'scale(1.02)'; };
      startBtn.onmouseout = function() { this.style.transform = 'scale(1)'; };
      startBtn.onclick = function() {
        if (state.quiz.settings.name_capture || state.quiz.settings.email_capture || state.quiz.settings.whatsapp_capture) {
          renderLead();
        } else {
          state.currentQuestion = 0;
          renderQuestion();
        }
      };
    }
  }

  function renderLead() {
    var s = state.quiz.settings || {};
    var fields = '';
    var inputStyle = 'width:100%;padding:14px;margin-bottom:12px;border:1px solid #e2e8f0;border-radius:10px;box-sizing:border-box;font-size:1em;outline:none;transition:border-color 0.2s';
    
    var fieldsOrder = s.lead_fields_order || ['whatsapp', 'name', 'email'];

    fieldsOrder.forEach(function(fieldId) {
      if (fieldId === 'name' && s.name_capture) {
        fields += '<div style="margin-bottom:4px;text-align:left;font-size:0.9em;font-weight:600;color:#4a5568">' + (s.name_label || 'Nome') + ' *</div>' +
          '<input id="hbq-name" name="name" autocomplete="name" class="hbq-input" type="text" required placeholder="' + (s.name_placeholder || 'Seu nome') + '" style="' + inputStyle + '" />';
      }
      if (fieldId === 'email' && s.email_capture) {
        fields += '<div style="margin-bottom:4px;text-align:left;font-size:0.9em;font-weight:600;color:#4a5568">' + (s.email_label || 'E-mail') + ' *</div>' +
          '<input id="hbq-email" name="email" autocomplete="email" class="hbq-input" type="email" required placeholder="' + (s.email_placeholder || 'seu@email.com') + '" style="' + inputStyle + '" />';
      }
      if (fieldId === 'whatsapp' && s.whatsapp_capture) {
        fields += '<div style="margin-bottom:4px;text-align:left;font-size:0.9em;font-weight:600;color:#4a5568">' + (s.whatsapp_label || 'WhatsApp') + ' *</div>' +
          '<div style="display:flex;gap:8px;margin-bottom:12px">' +
          '<select id="hbq-ddi" style="width:100px;padding:14px;border:1px solid #e2e8f0;border-radius:10px;font-size:1em;background:#fff;cursor:pointer;appearance:none;background-image:url(&quot;data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E&quot;);background-repeat:no-repeat;background-position:right%2012px%20top%2050%25;background-size:10px%20auto">' +
          '<option value="+55">🇧🇷 +55</option>' +
          '<option value="+54">🇦🇷 +54</option>' +
          '<option value="+34">🇪🇸 +34</option>' +
          '<option value="+1">🇺🇸 +1</option>' +
          '<option value="+351">🇵🇹 +351</option>' +
          '<option value="+52">🇲🇽 +52</option>' +
          '<option value="+57">🇨🇴 +57</option>' +
          '<option value="+56">🇨🇱 +56</option>' +
          '<option value="+51">🇵🇪 +51</option>' +
          '</select>' +
          '<input id="hbq-whatsapp" class="hbq-input hbq-tel" type="tel" required placeholder="' + (s.whatsapp_placeholder || '99 99999-9999') + '" style="flex:1;' + inputStyle.replace('margin-bottom:12px;', '') + '" />' +
          '</div>';
      }
    });

    render(
      '<div style="padding:32px;text-align:center;background:#fff;border-radius:12px;box-shadow:none;border:none">' +
      '<h3 style="margin-bottom:24px;font-size:1.4em;font-weight:700;color:#1a202c">' + (s.lead_headline || 'Antes de começar...') + '</h3>' +
      fields +
      '<div id="hbq-lead-error" style="color:#ef4444;font-size:0.85em;margin-bottom:12px;display:none"></div>' +
      '<button id="hbq-lead-next" style="background:#426a35;color:#fff;border:none;padding:16px;border-radius:12px;font-size:1.1em;font-weight:700;cursor:pointer;width:100%;margin-top:8px;box-shadow:0 4px 12px rgba(66,106,53,0.3)">Continuar</button>' +
      '</div>'
    );

    var waInput = document.getElementById('hbq-whatsapp');
    var ddiSelect = document.getElementById('hbq-ddi');
    
    function applyMask() {
      if (!waInput) return;
      var ddi = ddiSelect ? ddiSelect.value : '+55';
      var val = waInput.value.replace(/\D/g, '');
      var masked = val;
      
      if (ddi === '+55') {
        if (val.length > 2) masked = '(' + val.slice(0, 2) + ') ' + val.slice(2);
        if (val.length > 7) masked = '(' + val.slice(0, 2) + ') ' + val.slice(2, 7) + '-' + val.slice(7, 11);
      } else if (ddi === '+351') {
        if (val.length > 3) masked = val.slice(0, 3) + ' ' + val.slice(3);
        if (val.length > 6) masked = val.slice(0, 3) + ' ' + val.slice(3, 6) + ' ' + val.slice(6, 9);
      }
      waInput.value = masked;
    }

    if (waInput) {
      waInput.oninput = applyMask;
    }
    if (ddiSelect) {
      ddiSelect.onchange = applyMask;
    }

    container.querySelectorAll('.hbq-input, #hbq-ddi').forEach(function(inp) {
      inp.onfocus = function() { this.style.borderColor = '#426a35'; };
      inp.onblur = function() { this.style.borderColor = '#e2e8f0'; };
    });

    var nextBtn = document.getElementById('hbq-lead-next');
    if (nextBtn) {
      nextBtn.onclick = function() {
        var nameEl = document.getElementById('hbq-name');
        var emailEl = document.getElementById('hbq-email');
        var waEl = document.getElementById('hbq-whatsapp');
        var ddiEl = document.getElementById('hbq-ddi');
        var errorEl = document.getElementById('hbq-lead-error');
        
        var name = nameEl ? nameEl.value : '';
        var email = emailEl ? emailEl.value : '';
        var wa = waEl ? (ddiEl ? ddiEl.value : '') + waEl.value : '';

        if ((nameEl && !name) || (emailEl && !email) || (waEl && !waEl.value)) {
          errorEl.textContent = 'Por favor, preencha todos os campos obrigatórios.';
          errorEl.style.display = 'block';
          return;
        }

        if (emailEl && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errorEl.textContent = 'Por favor, insira um e-mail válido.';
          errorEl.style.display = 'block';
          return;
        }

        state.leadName = name;
        state.leadEmail = email;
        state.whatsapp = wa;
        savePartial(); // <--- Adicionado aqui para criar o registro imediatamente após o lead
        state.currentQuestion = 0;
        renderQuestion();
      };
    }
  }

  function renderQuestion() {
    if (!state.quiz || !state.quiz.questions) {
      render('<div style="text-align:center;padding:40px;color:#ef4444">Erro: Quiz sem perguntas configuradas.</div>');
      return;
    }
    var q = state.quiz.questions[state.currentQuestion];
    if (!q) { finishQuiz(); return; }
    var progress = Math.round((state.currentQuestion / state.totalQuestions) * 100);

    var mediaHtml = '';
    if (q.image_url && q.media_position === 'top') {
      mediaHtml = '<img src="' + q.image_url + '" style="width:100%;max-width:708px;height:320px;object-fit:cover;border-radius:12px;margin-bottom:20px;display:block" />';
    }

    var optionsHtml = (q.options || []).filter(function(opt) { return opt && opt.label; }).map(function(opt, i) {
      var letter = opt.letter || String.fromCharCode(65 + i);
      return '<button class="hbq-opt" data-idx="' + i + '" data-points="' + (opt.points || 0) + '" style="display:flex;align-items:center;width:100%;text-align:left;padding:16px 20px;margin-bottom:12px;border:2px solid #e2e8f0;border-radius:12px;background:#fff;cursor:pointer;font-size:1em;transition:all 0.2s;color:#2d3748;word-break:break-word;line-height:1.4">' +
        '<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;background:#f7fafc;border-radius:6px;margin-right:12px;font-weight:700;font-size:0.9em;color:#718096;border:1px solid #edf2f7;flex-shrink:0">' + letter + '</span>' +
        '<span style="flex:1">' + opt.label + '</span>' +
        '</button>';
    }).join('');

    if (!optionsHtml && !q.is_informational) {
      optionsHtml = '<p style="color:#ef4444;text-align:center">Nenhuma opção configurada para esta pergunta.</p>';
    }

    if (q.image_url && q.media_position === 'bottom') {
      mediaHtml = '<img src="' + q.image_url + '" style="width:100%;max-width:708px;height:320px;object-fit:cover;border-radius:12px;margin-top:20px;display:block" />';
    }

    // Progress bar no topo, fora do container de conteúdo principal
    var progressBarHtml = '<div style="width:100%;background:#f1f5f9;height:8px;position:fixed;top:0;left:0;z-index:9999;overflow:hidden;border-radius:0">' +
      '<div style="height:100%;background:#426a35;width:' + progress + '%;transition:width 0.4s cubic-bezier(0.4, 0, 0.2, 1)"></div>' +
      '</div>';

    render(
      progressBarHtml +
      '<div style="padding:32px;background:#fff;border-radius:12px;margin-top:24px;box-shadow:none;border:none">' +
      '<p style="font-size:0.85em;font-weight:700;color:#a0aec0;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">' + (state.currentQuestion + 1) + ' de ' + state.totalQuestions + '</p>' +
      (q.icon ? '<span style="font-size:2.5em;display:block;margin-bottom:12px">' + q.icon + '</span>' : '') +
      (q.media_position === 'top' ? mediaHtml : '') +
      '<h3 style="font-size:1.3em;font-weight:700;margin-bottom:24px;color:#1a202c;line-height:1.4">' + q.question + '</h3>' +
      (q.media_position !== 'top' ? mediaHtml : '') +
      optionsHtml +
      '</div>'
    );

    container.querySelectorAll('.hbq-opt').forEach(function(btn) {
      btn.onmouseover = function() { 
        this.style.borderColor = '#426a35'; 
        this.style.background = '#f1f7ee';
        var badge = this.querySelector('span');
        if (badge) {
          badge.style.background = '#426a35';
          badge.style.color = '#fff';
        }
      };
      btn.onmouseout = function() { 
        this.style.borderColor = '#e2e8f0'; 
        this.style.background = '#fff';
        var badge = this.querySelector('span');
        if (badge) {
          badge.style.background = '#f7fafc';
          badge.style.color = '#718096';
        }
      };
      btn.onclick = function() {
        var points = parseInt(this.getAttribute('data-points') || '0', 10);
        state.score += points;
        state.answers.push({ question_id: q.id, field_id: q.field_id, points: points });
        savePartial();
        state.currentQuestion++;
        renderQuestion();
      };
    });
  }

  function getResultBand() {
    var s = state.quiz.settings || {};
    var results = s.results || {};
    var band = 'leve';
    Object.keys(results).forEach(function(key) {
      var r = results[key];
      if (state.score >= r.range_min && state.score <= r.range_max) band = key;
    });
    return band;
  }

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
        resultBand: getResultBand(),
        answers: state.answers,
        source: window.location.href,
      }),
    }).then(function(r) { return r.json(); }).then(function(d) {
      if (d.response_id) state.responseId = d.response_id;
    }).catch(function() {});
  }

  function finishQuiz() {
    render('<div style="text-align:center;padding:40px;color:#555">Calculando resultado...</div>');
    var resultBand = getResultBand();
    fetch(API_BASE + '/api/public/responses/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quizId: QUIZ_ID,
        responseId: state.responseId,
        leadName: state.leadName,
        leadEmail: state.leadEmail,
        whatsapp: state.whatsapp,
        score: state.score,
        resultBand: resultBand,
        answers: state.answers,
        source: window.location.href,
      }),
    }).then(function(r) { return r.json(); }).then(function(data) {
      renderResult(resultBand, data.result);
    }).catch(function() {
      renderResult(resultBand, null);
    });
  }

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
    var html = '<div style="font-family:system-ui,sans-serif;max-width:708px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;box-shadow:none;border:none">';

    // 1. Imagem da faixa (fixa no topo por enquanto, ou podemos mover depois)
    if (result.image_url) {
      html += '<img src="' + result.image_url + '" loading="lazy" style="width:100%;max-width:708px;height:320px;object-fit:cover;border-radius:12px;display:block;margin:0 auto 24px;box-shadow:0 10px 25px rgba(0,0,0,0.1)" />';
    }

    var sectionsOrder = rp.sections_order || ['badge', 'journey', 'comparison', 'diagnosis', 'needs', 'solution', 'how_it_works', 'deliverables', 'benefit', 'pricing', 'social_proof', 'urgency'];

    sectionsOrder.forEach(function(sectionId) {
      switch(sectionId) {
        case 'badge':
          if (result.label || rp.result_badge_label || band) {
            var headlineText = (copy.headline || 'Seu corpo apresenta sinais de inflamação');
            var emoji = band === 'avancada' ? '🔴' : (band === 'moderada_avancada' ? '🔴' : (band === 'moderada' ? '🟠' : '🟡'));
            
            html += '<div style="text-align:center;margin-bottom:24px">';
            if (result.label || band) {
              html += '<div style="display:inline-block;background:' + bandColor + ';color:' + badgeTextColor + ';padding:10px 28px;border-radius:30px;font-size:16px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:16px;box-shadow:0 4px 10px rgba(0,0,0,0.1)">' + (result.label || band) + '</div>';
            }
            html += '<div style="background:#fff8f0;border:1px solid #fde68a;border-left:4px solid #f97316;border-radius:12px;padding:16px 18px;text-align:left">';
            html += '<p style="font-size:12px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px">⚠️ ' + (lang === 'pt' ? 'SEU RESULTADO baseado nas suas respostas:' : 'TU RESULTADO basado en tus respuestas:') + '</p>';
            html += '<p style="font-size:18px;font-weight:700;color:#1e293b;margin:0;line-height:1.4">' + headlineText + ' ' + emoji + '</p>';
            html += '</div></div>';
          }
          break;
        case 'journey':
          if (rp.journey_title || rp.journey_days_badge) {
            html += '<div style="margin-bottom:28px"><div style="text-align:center;margin-bottom:14px">';
            if (rp.journey_title) html += '<h3 style="font-size:19px;font-weight:800;color:#1e293b;margin:0 0 6px">' + rp.journey_title + '</h3>';
            if (rp.journey_subtitle) html += '<p style="font-size:13px;color:#64748b;margin:0">' + rp.journey_subtitle + '</p>';
            html += '</div><div style="position:relative">';
            if (rp.journey_days_badge) html += '<span style="position:absolute;top:8px;right:4px;background:#22c55e;color:#fff;font-size:11px;font-weight:800;padding:4px 10px;border-radius:20px;z-index:1">' + rp.journey_days_badge + '</span>';
            html += '<svg viewBox="0 0 400 200" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg">';
            html += '<defs><linearGradient id="hbqGrad' + QUIZ_ID + '" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:#ef4444"/><stop offset="40%" style="stop-color:#f97316"/><stop offset="70%" style="stop-color:#eab308"/><stop offset="100%" style="stop-color:#22c55e"/></linearGradient></defs>';
            html += '<line x1="45" y1="20" x2="390" y2="20" stroke="#f1f5f9" stroke-width="1"/><line x1="45" y1="57" x2="390" y2="57" stroke="#f1f5f9" stroke-width="1"/><line x1="45" y1="94" x2="390" y2="94" stroke="#f1f5f9" stroke-width="1"/><line x1="45" y1="131" x2="390" y2="131" stroke="#f1f5f9" stroke-width="1"/><line x1="45" y1="168" x2="390" y2="168" stroke="#e2e8f0" stroke-width="1"/>';
            html += '<text x="38" y="172" text-anchor="end" font-size="10" fill="#94a3b8">0</text><text x="38" y="135" text-anchor="end" font-size="10" fill="#94a3b8">25</text><text x="38" y="98" text-anchor="end" font-size="10" fill="#94a3b8">50</text><text x="38" y="61" text-anchor="end" font-size="10" fill="#94a3b8">75</text><text x="38" y="24" text-anchor="end" font-size="10" fill="#94a3b8">100</text>';
            html += '<polygon points="48,168 390,168 390,20" fill="url(#hbqGrad' + QUIZ_ID + ')" opacity="0.88"/>';
            html += '<circle cx="48" cy="168" r="7" fill="#ef4444" stroke="#fff" stroke-width="2.5"/><circle cx="390" cy="20" r="7" fill="#22c55e" stroke="#fff" stroke-width="2.5"/>';
            if (rp.journey_label_today) html += '<text x="62" y="185" font-size="10" font-weight="700" fill="#ef4444">' + rp.journey_label_today + '</text>';
            if (rp.journey_label_future) html += '<text x="388" y="14" font-size="10" font-weight="700" fill="#22c55e" text-anchor="end">' + rp.journey_label_future + '</text>';
            html += '</svg></div></div>';
          }
          break;
        case 'comparison':
          if (compItems.length > 0 && (rp.comp_today_title || rp.comp_after_title)) {
            html += '<div style="background:#fff;border:1px solid #e8e8e8;border-radius:16px;padding:20px;margin-bottom:24px"><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';
            html += '<div style="background:#fff;border-radius:12px;padding:14px;border:1px solid #e2e8f0"><div style="text-align:center;margin-bottom:12px"><span style="font-size:28px;display:block;margin-bottom:6px">' + (rp.comp_today_icon||'⏰') + '</span><span style="font-size:12px;font-weight:800;color:#475569;text-transform:uppercase">' + (rp.comp_today_title||'') + '</span></div>';
            compItems.forEach(function(item) { if(item.today) html += '<div style="margin-bottom:10px"><div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:3px;display:flex;justify-content:space-between"><span>' + item.today + '</span><span style="color:#94a3b8">' + Math.round(item.todayVal) + '%</span></div><div style="height:8px;background:#f1f5f9;border-radius:4px;overflow:hidden"><div style="height:100%;width:' + item.todayVal + '%;background:#ef4444;border-radius:4px"></div></div></div>'; });
            html += '</div>';
            html += '<div style="background:#fff;border-radius:12px;padding:14px;border:1px solid #e2e8f0"><div style="text-align:center;margin-bottom:12px"><span style="font-size:28px;display:block;margin-bottom:6px">' + (rp.comp_after_icon||'✨') + '</span><span style="font-size:12px;font-weight:800;color:#475569;text-transform:uppercase">' + (rp.comp_after_title||'') + '</span></div>';
            compItems.forEach(function(item) { if(item.after) html += '<div style="margin-bottom:10px"><div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:3px;display:flex;justify-content:space-between"><span>' + item.after + '</span><span style="color:#94a3b8">100%</span></div><div style="height:8px;background:#f1f5f9;border-radius:4px;overflow:hidden"><div style="height:100%;width:100%;background:linear-gradient(90deg,#22c55e,#5a9e42);border-radius:4px"></div></div></div>'; });
            html += '</div></div></div>';
          }
          break;
        case 'diagnosis':
          if (rp.diagnosis_heading || symptoms.length > 0) {
            html += '<div style="background:#f0fdf4;border:1px solid #dcfce7;border-radius:14px;padding:20px;margin-bottom:20px">';
            if (rp.diagnosis_heading) html += '<p style="font-size:16px;font-weight:700;color:#166534;margin:0 0 12px">' + rp.diagnosis_heading + '</p>';
            if (symptoms.length > 0) {
              html += '<ul style="list-style:none;padding:0;margin:0">';
              symptoms.forEach(function(sym) { html += '<li style="padding:10px 14px;font-size:14px;color:#065f46;background:rgba(16,185,129,0.05);border-radius:8px;margin-bottom:6px;font-weight:500;border-left:3px solid #10b981">' + sym + '</li>'; });
              html += '</ul>';
            }
            html += '</div>';
          }
          if (rp.goodnews_text) { html += '<div style="background:linear-gradient(135deg,#f0f7ed,#e8f5e3);border:1px solid #c5e1b5;border-radius:14px;padding:18px 20px;margin-bottom:20px"><p style="font-size:15px;color:#2d5a1e;line-height:1.5;margin:0">' + rp.goodnews_text + '</p></div>'; }
          break;
        case 'needs':
          if (rp.needs_title || rp.needs_desc || rp.needs_cta) {
            html += '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:20px;margin-bottom:20px">';
            if (rp.needs_title) html += '<h3 style="font-size:16px;font-weight:800;color:#14532d;margin:0 0 10px">' + rp.needs_title + '</h3>';
            if (rp.needs_desc) html += '<p style="font-size:15px;color:#166534;margin:0 0 6px;line-height:1.5">' + rp.needs_desc + '</p>';
            if (rp.needs_cta) html += '<p style="font-size:16px;font-weight:700;color:#15803d;margin:0">' + rp.needs_cta + '</p>';
            html += '</div>';
          }
          break;
        case 'solution':
          if (rp.solution_title || rp.solution_desc) {
            html += '<div style="background:linear-gradient(135deg,#f0f6ee,#e8f0e5);border:1px solid #c5ddb8;border-radius:16px;padding:28px 24px;margin-bottom:24px;position:relative;overflow:hidden">';
            if (rp.solution_badge) html += '<div style="display:inline-block;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;font-size:12px;font-weight:800;padding:6px 14px;border-radius:20px;margin-bottom:14px;text-transform:uppercase">' + rp.solution_badge + '</div>';
            if (rp.solution_title) html += '<h3 style="font-size:22px;font-weight:800;margin:0 0 12px;color:#333">' + rp.solution_title + '</h3>';
            if (rp.solution_desc) html += '<div style="font-size:15px;color:#555;line-height:1.6;margin-bottom:16px">' + rp.solution_desc + '</div>';
            var solItems = Array.isArray(rp.solution_items) ? rp.solution_items.filter(Boolean) : [];
            if (solItems.length) { html += '<ul style="list-style:none;padding:0;margin:16px 0">'; solItems.forEach(function(item) { html += '<li style="margin-bottom:10px;font-size:15px;padding:10px 14px;background:rgba(66,106,53,0.08);border-radius:8px;font-weight:500;color:#333">' + item + '</li>'; }); html += '</ul>'; }
            html += '</div>';
          }
          break;
        case 'how_it_works':
          if (rp.step_1_title || rp.step_2_title) {
            html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px 20px;margin-bottom:24px">';
            html += '<h3 style="font-size:15px;font-weight:800;color:#1e293b;margin:0 0 16px">🪜 ' + (lang==='pt'?'COMO FUNCIONA':'CÓMO FUNCIONA') + '</h3>';
            if (rp.step_1_title) { html += '<div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px"><span style="font-size:28px;flex-shrink:0">' + (rp.step_1_icon||'🥗') + '</span><div><strong style="display:block;font-size:15px;font-weight:700;color:#1e293b;margin-bottom:4px">' + rp.step_1_title + '</strong><p style="font-size:14px;color:#64748b;margin:0;line-height:1.4">' + (rp.step_1_text||'') + '</p></div></div>'; }
            if (rp.step_2_title) { html += '<div style="display:flex;gap:12px;align-items:flex-start"><span style="font-size:28px;flex-shrink:0">' + (rp.step_2_icon||'🔥') + '</span><div><strong style="display:block;font-size:15px;font-weight:700;color:#1e293b;margin-bottom:4px">' + rp.step_2_title + '</strong><p style="font-size:14px;color:#64748b;margin:0;line-height:1.4">' + (rp.step_2_text||'') + '</p></div></div>'; }
            html += '</div>';
          }
          break;
        case 'deliverables':
          var deliverables = Array.isArray(rp.deliverables) ? rp.deliverables.filter(Boolean) : [];
          if (deliverables.length || rp.deliverables_title) {
            html += '<div style="background:linear-gradient(135deg,#f0f6ee,#e8f0e5);border:1px solid #c5ddb8;border-radius:16px;padding:20px;margin-bottom:20px">';
            if (rp.deliverables_title) html += '<h3 style="font-size:16px;font-weight:800;color:#14532d;margin:0 0 14px">' + rp.deliverables_title + '</h3>';
            if (deliverables.length) {
              html += '<ul style="list-style:none;padding:0;margin:0">';
              deliverables.forEach(function(d) { html += '<li style="padding:10px 0;font-size:15px;color:#166534;font-weight:600;border-bottom:1px solid rgba(66,106,53,0.15)">✔ ' + d + '</li>'; });
              html += '</ul>';
            }
            html += '</div>';
          }
          break;
        case 'benefit':
          if (rp.benefit_text) {
            html += '<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:14px;padding:16px 18px;margin-bottom:20px;text-align:center">';
            if (rp.benefit_badge_label) html += '<span style="display:inline-block;background:#f59e0b;color:#fff;font-size:12px;font-weight:800;padding:4px 12px;border-radius:20px;margin-bottom:10px;text-transform:uppercase">' + rp.benefit_badge_label + '</span>';
            html += '<p style="font-size:15px;font-weight:600;color:#92400e;margin:0">' + rp.benefit_text + '</p></div>';
          }
          break;
        case 'pricing':
          if (rp.price_to || rp.cta_text) {
            html += '<div style="background:#fff;border:1px solid #e0e0e0;border-radius:16px;overflow:hidden;margin-bottom:24px">';
            var pricingFeatures = Array.isArray(rp.pricing_features) ? rp.pricing_features.filter(Boolean) : [];
            html += '<div style="display:flex">';
            if (pricingFeatures.length) { html += '<div style="flex:1;background:#f0f6ee;padding:20px"><ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px">'; pricingFeatures.forEach(function(f) { html += '<li style="font-size:13px;color:#166534;font-weight:600">✔ ' + f + '</li>'; }); html += '</ul></div>'; }
            html += '<div style="flex:1;padding:20px;text-align:center">';
            if (rp.offer_label) html += '<p style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px">' + rp.offer_label + '</p>';
            if (rp.price_from) html += '<p style="font-size:14px;color:#94a3b8;margin:0 0 4px">DE <span style="text-decoration:line-through">' + rp.price_from + '</span></p>';
            if (rp.offer_sublabel) html += '<p style="font-size:14px;color:#475569;font-weight:600;margin:0 0 4px">' + rp.offer_sublabel + '</p>';
            if (rp.price_to) html += '<div style="display:flex;align-items:flex-end;justify-content:center;gap:4px;margin-bottom:16px;line-height:1"><span style="font-size:56px;font-weight:900;color:#1e293b;line-height:1">' + rp.price_to + '</span><span style="font-size:18px;font-weight:700;color:#64748b;margin-bottom:8px">' + (rp.price_currency||'') + '</span></div>';
            html += '</div></div>';
            html += '<div style="padding:20px;text-align:center">';
            if (rp.cta_text) html += '<a href="' + ctaUrl + '" target="_blank" style="display:block;background:#426A35;color:#fff;padding:20px;border-radius:12px;font-weight:800;font-size:18px;text-decoration:none;box-shadow:0 6px 20px rgba(66,106,53,0.3);margin-bottom:12px">' + rp.cta_text + '</a>';
            if (rp.guarantee_text) html += '<p style="font-size:13px;color:#64748b;margin:0 0 4px">' + rp.guarantee_text + '</p>';
            if (rp.offer_footer_1) html += '<p style="font-size:12px;color:#888;margin:0 0 2px">' + rp.offer_footer_1 + '</p>';
            if (rp.offer_footer_2) html += '<p style="font-size:12px;color:#888;margin:0">' + rp.offer_footer_2 + '</p>';
            html += '</div></div>';
          }
          break;
        case 'social_proof':
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
          break;
        case 'urgency':
          if (rp.urgency_text) { html += '<div style="background:#fff3cd;border:1px solid #ffc107;border-radius:16px;padding:20px;margin-bottom:20px;text-align:center"><p style="font-size:15px;color:#856404;margin:0">' + rp.urgency_text + '</p></div>'; }
          break;
      }
    });

    html += '</div>';
    render(html);
  }

  function init() {
    renderLoading();
    state.quiz = QUIZ_DATA;
    var s = state.quiz.settings || {};
    state.totalQuestions = (state.quiz.questions || []).length;
    
    // Pequeno atraso para garantir que o container esteja pronto
    setTimeout(function() {
      var showLanding = s.show_landing === true;
      var hasLeadCapture = !!(s.name_capture || s.email_capture || s.whatsapp_capture);
      
      if (showLanding) {
        renderLanding();
      } else if (hasLeadCapture) {
        renderLead();
      } else {
        state.currentQuestion = 0;
        renderQuestion();
      }
    }, 100);
  }

  init();
})();
`.trim()

  return new Response(script, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      ...corsHeaders,
    },
  })
}
