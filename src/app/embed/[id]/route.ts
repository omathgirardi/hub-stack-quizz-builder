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

  const appUrl = process.env.APP_URL ?? ''

  const script = `
(function() {
  var QUIZ_ID = '${quiz.id}';
  var API_BASE = '${appUrl}';

  var currentScript = document.currentScript;
  var container = document.createElement('div');
  container.id = 'hbq-' + QUIZ_ID;
  container.style.fontFamily = 'system-ui, sans-serif';
  container.style.maxWidth = '600px';
  container.style.margin = '0 auto';
  if (currentScript && currentScript.parentNode) {
    currentScript.parentNode.insertBefore(container, currentScript.nextSibling);
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

  function html(strings) { return strings; }

  function render(content) {
    container.innerHTML = content;
  }

  function renderLoading() {
    render('<div style="text-align:center;padding:40px;color:#666">Carregando quiz...</div>');
  }

  function renderLanding() {
    var s = state.quiz.settings || {};
    render(
      '<div style="text-align:center;padding:24px">' +
      (s.landing_image ? '<img src="' + s.landing_image + '" style="max-width:100%;border-radius:12px;margin-bottom:16px" />' : '') +
      '<h2 style="font-size:1.4em;font-weight:700;margin-bottom:8px">' + (s.headline || state.quiz.title) + '</h2>' +
      '<p style="color:#555;margin-bottom:16px">' + (s.subheadline || '') + '</p>' +
      (s.urgency_text ? '<p style="color:#e53e3e;font-size:0.9em;margin-bottom:12px">' + s.urgency_text + '</p>' : '') +
      '<button id="hbq-start" style="background:#2563eb;color:#fff;border:none;padding:14px 32px;border-radius:8px;font-size:1em;font-weight:600;cursor:pointer">' + (s.cta_button || 'Iniciar Quiz') + '</button>' +
      '</div>'
    );
    document.getElementById('hbq-start').onclick = function() {
      if (state.quiz.settings.name_capture || state.quiz.settings.email_capture || state.quiz.settings.whatsapp_capture) {
        renderLead();
      } else {
        state.currentQuestion = 0;
        renderQuestion();
      }
    };
  }

  function renderLead() {
    var s = state.quiz.settings || {};
    var fields = '';
    if (s.name_capture) fields += '<input id="hbq-name" type="text" placeholder="' + (s.name_placeholder || 'Seu nome') + '" style="width:100%;padding:10px;margin-bottom:10px;border:1px solid #ddd;border-radius:8px;box-sizing:border-box;font-size:1em" />';
    if (s.email_capture) fields += '<input id="hbq-email" type="email" placeholder="' + (s.email_placeholder || 'Seu e-mail') + '" style="width:100%;padding:10px;margin-bottom:10px;border:1px solid #ddd;border-radius:8px;box-sizing:border-box;font-size:1em" />';
    if (s.whatsapp_capture) fields += '<input id="hbq-whatsapp" type="tel" placeholder="' + (s.whatsapp_label || 'Seu WhatsApp') + '" style="width:100%;padding:10px;margin-bottom:10px;border:1px solid #ddd;border-radius:8px;box-sizing:border-box;font-size:1em" />';

    render(
      '<div style="padding:24px">' +
      '<h3 style="margin-bottom:16px;font-size:1.2em">' + (s.lead_headline || 'Antes de começar...') + '</h3>' +
      fields +
      '<button id="hbq-lead-next" style="background:#2563eb;color:#fff;border:none;padding:12px 28px;border-radius:8px;font-size:1em;font-weight:600;cursor:pointer;width:100%">Continuar</button>' +
      '</div>'
    );
    document.getElementById('hbq-lead-next').onclick = function() {
      var nameEl = document.getElementById('hbq-name');
      var emailEl = document.getElementById('hbq-email');
      var waEl = document.getElementById('hbq-whatsapp');
      state.leadName = nameEl ? nameEl.value : '';
      state.leadEmail = emailEl ? emailEl.value : '';
      state.whatsapp = waEl ? waEl.value : '';
      state.currentQuestion = 0;
      renderQuestion();
    };
  }

  function renderQuestion() {
    var q = state.quiz.questions[state.currentQuestion];
    if (!q) { finishQuiz(); return; }
    var progress = Math.round((state.currentQuestion / state.totalQuestions) * 100);

    var mediaHtml = '';
    if (q.image_url && q.media_position === 'top') {
      mediaHtml = '<img src="' + q.image_url + '" style="width:100%;border-radius:8px;margin-bottom:12px" />';
    }

    var optionsHtml = (q.options || []).map(function(opt, i) {
      return '<button class="hbq-opt" data-idx="' + i + '" data-points="' + opt.points + '" style="display:block;width:100%;text-align:left;padding:12px 16px;margin-bottom:8px;border:2px solid #e2e8f0;border-radius:8px;background:#fff;cursor:pointer;font-size:0.95em;transition:border-color 0.15s">' +
        '<strong>' + opt.letter + '.</strong> ' + opt.label +
        '</button>';
    }).join('');

    if (q.image_url && q.media_position === 'bottom') {
      mediaHtml = '<img src="' + q.image_url + '" style="width:100%;border-radius:8px;margin-top:12px" />';
    }

    render(
      '<div style="padding:24px">' +
      '<div style="background:#e2e8f0;border-radius:99px;height:6px;margin-bottom:20px"><div style="background:#2563eb;height:6px;border-radius:99px;width:' + progress + '%"></div></div>' +
      '<p style="font-size:0.85em;color:#888;margin-bottom:8px">' + (state.currentQuestion + 1) + ' / ' + state.totalQuestions + '</p>' +
      (q.icon ? '<span style="font-size:2em;display:block;margin-bottom:8px">' + q.icon + '</span>' : '') +
      (q.media_position === 'top' ? mediaHtml : '') +
      '<h3 style="font-size:1.1em;font-weight:600;margin-bottom:16px">' + q.question + '</h3>' +
      (q.media_position !== 'top' ? mediaHtml : '') +
      optionsHtml +
      '</div>'
    );

    container.querySelectorAll('.hbq-opt').forEach(function(btn) {
      btn.onmouseover = function() { this.style.borderColor = '#2563eb'; };
      btn.onmouseout = function() { this.style.borderColor = '#e2e8f0'; };
      btn.onclick = function() {
        var points = parseInt(this.getAttribute('data-points') || '0', 10);
        state.score += points;
        state.answers.push({ question_id: q.id, field_id: q.field_id, points: points });
        savePartial();
        if (q.is_informational) {
          state.currentQuestion++;
          renderQuestion();
        } else {
          state.currentQuestion++;
          renderQuestion();
        }
      };
    });
  }

  function savePartial() {
    fetch(API_BASE + '/api/public/responses/partial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId: QUIZ_ID, responseId: state.responseId, answers: state.answers }),
    }).then(function(r) { return r.json(); }).then(function(d) {
      if (d.response_id) state.responseId = d.response_id;
    }).catch(function() {});
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
    var result = bandData || (s.results && s.results[band]) || {};
    var bgColor = result.color || '#2563eb';
    var textColor = result.badge_text_color || '#fff';

    render(
      '<div style="text-align:center;padding:24px">' +
      '<div style="display:inline-block;background:' + bgColor + ';color:' + textColor + ';padding:8px 20px;border-radius:99px;font-weight:600;margin-bottom:16px">' + (result.label || band) + '</div>' +
      (result.image_url ? '<img src="' + result.image_url + '" style="max-width:100%;border-radius:12px;margin-bottom:16px" />' : '') +
      '<h2 style="font-size:1.3em;font-weight:700;margin-bottom:8px">' + (result.level || '') + '</h2>' +
      '<p style="color:#555;margin-bottom:20px">' + (result.description || '') + '</p>' +
      (result.offer_url ? '<a href="' + result.offer_url + '" target="_blank" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 32px;border-radius:8px;font-weight:600;text-decoration:none">' + (s.cta_button || 'Ver Oferta') + '</a>' : '') +
      '</div>'
    );
  }

  renderLoading();
  fetch(API_BASE + '/api/public/quiz/' + QUIZ_ID)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      state.quiz = data;
      state.totalQuestions = (data.questions || []).filter(function(q) { return !q.is_informational; }).length || (data.questions || []).length;
      renderLanding();
    })
    .catch(function() {
      render('<div style="text-align:center;padding:40px;color:#e53e3e">Erro ao carregar quiz.</div>');
    });
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
