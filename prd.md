{
  "prd": {
    "claude_code_context": {
      "instrucao": "LEIA ESTA SECAO PRIMEIRO antes de qualquer implementacao. Ela descreve o estado atual do projeto e as regras que nunca podem ser violadas.",
      "estado_atual": {
        "feito": [
          "Projeto criado com template Cloudflare + Remix",
          "Clerk instalado e configurado",
          "Neon DB criado — DATABASE_URL no env"
        ],
        "pendente": [
          "Schema Drizzle criado em app/lib/db/schema.ts",
          "npx drizzle-kit push para criar tabelas no Neon",
          "Todas as paginas e componentes listados neste PRD"
        ],
        "instrucao_antes_de_comecar": "Leia os arquivos existentes no projeto para entender o que ja foi feito. Nao duplicar nem sobrescrever o que ja existe."
      },
      "regras_criticas": [
        "NUNCA usar process.env — sempre context.cloudflare.env.VAR via loader/action do Remix",
        "NUNCA usar pg ou postgres.js — Workers nao suportam TCP. Usar APENAS @neondatabase/serverless",
        "Todas as rotas /api/public/* e /embed/* devem ter header Access-Control-Allow-Origin: *",
        "O embed script deve ser JavaScript vanilla puro — zero dependencias externas",
        "getDb(env) recebe o env do Cloudflare — nunca instanciar o db fora de um loader/action"
      ],
      "padrao_obrigatorio_banco": {
        "arquivo": "app/lib/db/index.ts",
        "codigo": "import { neon } from @neondatabase/serverless\nimport { drizzle } from drizzle-orm/neon-http\nimport * as schema from ./schema\n\nexport function getDb(env: { DATABASE_URL: string }) {\n  const sql = neon(env.DATABASE_URL)\n  return drizzle(sql, { schema })\n}",
        "uso_em_loader": "export async function loader({ context }: LoaderFunctionArgs) {\n  const env = context.cloudflare.env\n  const db = getDb(env)\n  // ...\n}"
      },
      "padrao_obrigatorio_auth": {
        "codigo": "import { getAuth } from @clerk/remix/ssr.server\n\nexport async function loader(args: LoaderFunctionArgs) {\n  const { userId } = await getAuth(args)\n  if (!userId) return redirect(/login)\n  // ...\n}"
      },
      "schema_drizzle": {
        "arquivo": "app/lib/db/schema.ts",
        "codigo": "import { pgTable, uuid, text, integer, jsonb, timestamp, index } from drizzle-orm/pg-core\n\nexport const quizzes = pgTable(quizzes, {\n  id: uuid(id).primaryKey().defaultRandom(),\n  userId: text(user_id).notNull(),\n  title: text(title).notNull(),\n  questions: jsonb(questions).notNull().default([]),\n  settings: jsonb(settings).notNull().default({}),\n  status: text(status).notNull().default(active),\n  createdAt: timestamp(created_at).defaultNow(),\n  updatedAt: timestamp(updated_at).defaultNow(),\n}, (t) => ({\n  userIdIdx: index(idx_quizzes_user_id).on(t.userId),\n}))\n\nexport const responses = pgTable(responses, {\n  id: uuid(id).primaryKey().defaultRandom(),\n  quizId: uuid(quiz_id).notNull().references(() => quizzes.id, { onDelete: cascade }),\n  leadName: text(lead_name).default(),\n  leadEmail: text(lead_email).default(),\n  whatsapp: text(whatsapp).default(),\n  score: integer(score).default(0),\n  resultBand: text(result_band).default(),\n  answers: jsonb(answers).default([]),\n  ipAddress: text(ip_address).default(),\n  userAgent: text(user_agent).default(),\n  source: text(source).default(),\n  createdAt: timestamp(created_at).defaultNow(),\n}, (t) => ({\n  quizIdIdx: index(idx_responses_quiz_id).on(t.quizId),\n  resultBandIdx: index(idx_responses_result_band).on(t.resultBand),\n  createdAtIdx: index(idx_responses_created_at).on(t.createdAt),\n}))"
      },
      "mapa_de_rotas": {
        "_auth.login.tsx": "/login",
        "_auth.signup.tsx": "/signup",
        "_dashboard.tsx": "layout protegido sidebar + header",
        "_dashboard._index.tsx": "/ dashboard KPIs",
        "_dashboard.quizzes._index.tsx": "/quizzes lista",
        "_dashboard.quizzes.new.tsx": "/quizzes/new",
        "_dashboard.quizzes.$id.edit.tsx": "/quizzes/:id/edit",
        "_dashboard.responses.tsx": "/responses",
        "api.responses.export.tsx": "/api/responses/export CSV",
        "api.quizzes.$id.export.tsx": "/api/quizzes/:id/export JSON",
        "api.quizzes.import.tsx": "/api/quizzes/import",
        "api.webhooks.clerk.tsx": "/api/webhooks/clerk",
        "api.public.quiz.$id.tsx": "/api/public/quiz/:id CORS aberto",
        "api.public.responses.submit.tsx": "/api/public/responses/submit CORS aberto",
        "api.public.responses.partial.tsx": "/api/public/responses/partial CORS aberto",
        "embed.$id[.js].tsx": "/embed/:id.js JavaScript vanilla CORS aberto"
      }
    },
    "project": {
      "name": "hub-stack-quizz-builder",
      "display_name": "Hub Stack Quizz Builder",
      "version": "1.0.0",
      "type": "fullstack-webapp",
      "description": "WebApp completo para criação e gerenciamento de quizzes interativos de diagnóstico. Migração fiel do plugin WordPress para uma aplicação independente. Hospedado no Cloudflare Pages com Remix. Banco de dados Neon.tech (PostgreSQL). O WordPress ou qualquer site embute o quiz via widget HTML do Elementor colando uma única tag script.",
      "repositorio": "https://github.com/omathgirardi/hub-stack-quizz-builder",
      "deploy": "Cloudflare Pages — deploy automático a cada push no branch main via Wrangler"
    },
    "por_que_remix_no_cloudflare": [
      "Remix tem template oficial para Cloudflare Pages mantido pela própria Cloudflare",
      "Roda nativamente no Cloudflare Workers runtime — sem adaptadores ou gambiarras",
      "Loaders e Actions do Remix mapeiam 1:1 com o modelo request/response do Workers",
      "Next.js no Cloudflare exige o pacote @cloudflare/next-on-pages que tem limitações conhecidas em produção",
      "Deploy com um comando: wrangler pages deploy"
    ],
    "como_funciona_o_embed": {
      "descricao": "Cada quiz tem um ID único UUID. O WebApp serve um script de embed que qualquer site pode usar.",
      "codigo_que_o_usuario_copia": "<script src='https://seuapp.pages.dev/embed/QUIZ_ID.js'></script>",
      "no_elementor": "Widget HTML do Elementor — colar o script acima",
      "como_o_script_funciona": [
        "1. Script servido pela rota /embed/$id.js do Cloudflare Pages",
        "2. Script cria um div id='hbq-QUIZ_ID' no lugar onde foi inserido",
        "3. Faz fetch de /api/public/quiz/QUIZ_ID",
        "4. Renderiza o quiz completo via JavaScript vanilla",
        "5. Respostas enviadas via POST /api/public/responses/submit",
        "6. Zero dependência de jQuery, WordPress ou qualquer biblioteca externa"
      ]
    },
    "stack": {
      "framework": "Remix v2 com Vite",
      "runtime": "Cloudflare Pages Functions — Workers runtime",
      "linguagem": "TypeScript",
      "banco": "Neon.tech — PostgreSQL serverless gratuito",
      "orm": "Drizzle ORM — única ORM com suporte nativo ao Neon HTTP driver sem connection pooling issues no Workers runtime",
      "neon_driver": "@neondatabase/serverless — driver HTTP do Neon, obrigatório pois Workers não suportam TCP nativo",
      "auth": "Clerk com @clerk/remix",
      "estilo": "Tailwind CSS",
      "editor_rich_text": "Tiptap",
      "upload_imagens": "Uploadthing",
      "drag_and_drop": "@dnd-kit/core e @dnd-kit/sortable",
      "deploy": "Cloudflare Pages via Wrangler CLI"
    },
    "nota_critica_neon_no_workers": {
      "problema": "Cloudflare Workers não suportam conexões TCP nativas — drivers padrão como pg e postgres.js não funcionam",
      "solucao": "Usar o driver HTTP do Neon: @neondatabase/serverless",
      "configuracao_drizzle": "import { neon } from '@neondatabase/serverless'; import { drizzle } from 'drizzle-orm/neon-http'; export function getDb(env) { const sql = neon(env.DATABASE_URL); return drizzle(sql); }",
      "acesso_env": "NUNCA usar process.env — sempre env vem do context.cloudflare.env passado pelo loader/action do Remix"
    },
    "setup_inicial": {
      "comando_criar_projeto": "npm create cloudflare@latest hub-stack-quizz-builder -- --template=cloudflare/templates/remix",
      "dependencias": [
        "@remix-run/cloudflare",
        "@remix-run/react",
        "@remix-run/cloudflare-pages",
        "@clerk/remix",
        "@neondatabase/serverless",
        "drizzle-orm",
        "drizzle-kit",
        "tailwindcss",
        "@tiptap/react",
        "@tiptap/starter-kit",
        "@tiptap/extension-link",
        "@dnd-kit/core",
        "@dnd-kit/sortable",
        "uploadthing",
        "@uploadthing/react",
        "uuid"
      ],
      "wrangler_toml": "name = 'hub-stack-quizz-builder'\ncompatibility_date = '2024-01-01'\ncompatibility_flags = ['nodejs_compat']"
    },
    "variaveis_de_ambiente": {
      "onde_configurar": "Cloudflare Pages Dashboard → Settings → Environment Variables → Production",
      "variaveis": [
        "DATABASE_URL — Neon.tech connection string",
        "APP_URL — URL pública ex: https://hub-stack-quizz-builder.pages.dev",
        "CLERK_SECRET_KEY",
        "CLERK_PUBLISHABLE_KEY",
        "CLERK_WEBHOOK_SECRET",
        "UPLOADTHING_SECRET",
        "UPLOADTHING_APP_ID"
      ],
      "acesso_no_codigo": "context.cloudflare.env.NOME_DA_VAR nos loaders e actions"
    },
    "banco_de_dados": {
      "provider": "Neon.tech",
      "setup": "Criar projeto em neon.tech → copiar DATABASE_URL → adicionar no Cloudflare Pages env vars → rodar npx drizzle-kit push",
      "schema_file": "app/lib/db/schema.ts",
      "tabelas": [
        {
          "nome": "quizzes",
          "sql": "CREATE TABLE quizzes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id TEXT NOT NULL, title TEXT NOT NULL, questions JSONB NOT NULL DEFAULT '[]', settings JSONB NOT NULL DEFAULT '{}', status TEXT NOT NULL DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())",
          "indexes": [
            "CREATE INDEX idx_quizzes_user_id ON quizzes(user_id)"
          ]
        },
        {
          "nome": "responses",
          "sql": "CREATE TABLE responses (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE, lead_name TEXT DEFAULT '', lead_email TEXT DEFAULT '', whatsapp TEXT DEFAULT '', score INTEGER DEFAULT 0, result_band TEXT DEFAULT '', answers JSONB DEFAULT '[]', ip_address TEXT DEFAULT '', user_agent TEXT DEFAULT '', source TEXT DEFAULT '', created_at TIMESTAMPTZ DEFAULT NOW())",
          "indexes": [
            "CREATE INDEX idx_responses_quiz_id ON responses(quiz_id)",
            "CREATE INDEX idx_responses_result_band ON responses(result_band)",
            "CREATE INDEX idx_responses_created_at ON responses(created_at)"
          ]
        }
      ],
      "estrutura_questions_item": {
        "descricao": "Cada item do array questions — espelho exato do sanitize_questions() do plugin WP",
        "campos": [
          "id: string UUID",
          "field_id: string",
          "question: string",
          "icon: string emoji",
          "image_url: string URL Uploadthing",
          "use_carousel: boolean",
          "carousel_images: string[]",
          "is_informational: boolean",
          "media_position: top | bottom",
          "options: Array<{ label: string, points: number, letter: string }> max 4"
        ]
      },
      "estrutura_settings": {
        "campos_gerais": [
          "headline",
          "subheadline",
          "cta_button",
          "badge_text",
          "landing_image",
          "checklist_item_1",
          "checklist_item_2",
          "checklist_item_3",
          "urgency_text",
          "cta_offer_url",
          "webhook_url",
          "language: pt|es"
        ],
        "campos_lead": [
          "whatsapp_capture",
          "name_capture",
          "email_capture",
          "lead_headline",
          "whatsapp_label",
          "whatsapp_msg",
          "name_placeholder",
          "email_placeholder"
        ],
        "campos_results_por_faixa": [
          "label",
          "range_min",
          "range_max",
          "color",
          "badge_text_color",
          "level",
          "description",
          "image_url",
          "offer_url",
          "last_question_message"
        ],
        "faixas_fixas": [
          "leve",
          "moderada",
          "moderada_avancada",
          "avancada"
        ],
        "campos_result_page": [
          "type",
          "manual_html",
          "result_badge_label",
          "journey_title",
          "journey_subtitle",
          "journey_label_today",
          "journey_label_future",
          "journey_days_badge",
          "comp_today_icon",
          "comp_today_title",
          "comp_after_icon",
          "comp_after_title",
          "comp_item_1_today",
          "comp_item_1_after",
          "comp_item_2_today",
          "comp_item_2_after",
          "comp_item_3_today",
          "comp_item_3_after",
          "comp_item_4_today",
          "comp_item_4_after",
          "needs_title",
          "needs_desc",
          "needs_cta",
          "diagnosis_heading",
          "goodnews_text",
          "solution_badge",
          "solution_title",
          "solution_desc",
          "solution_items[]",
          "deliverables_title",
          "deliverables[]",
          "benefits[]",
          "benefit_badge_label",
          "benefit_text",
          "show_social_proof",
          "gallery_ids",
          "social_proof_title",
          "social_proof_subtitle",
          "offer_label",
          "offer_sublabel",
          "pricing_features[]",
          "price_from",
          "price_to",
          "price_currency",
          "cta_text",
          "guarantee_text",
          "offer_footer_1",
          "offer_footer_2",
          "urgency_text",
          "step_1_icon",
          "step_1_title",
          "step_1_text",
          "step_2_icon",
          "step_2_title",
          "step_2_text"
        ]
      }
    },
    "rotas": {
      "autenticadas": [
        {
          "arquivo": "app/routes/_dashboard.tsx",
          "descricao": "Layout protegido. Loader usa getAuth() do @clerk/remix — redireciona /login se não autenticado. Renderiza sidebar + header com logout."
        },
        {
          "arquivo": "app/routes/_dashboard._index.tsx",
          "rota": "/",
          "descricao": "Dashboard KPIs. Loader: getDashboardStats(db, userId, dateStart, dateEnd). UI: 4 cards KPI com gauge SVG semicírculo + barras de faixa."
        },
        {
          "arquivo": "app/routes/_dashboard.quizzes._index.tsx",
          "rota": "/quizzes",
          "descricao": "Lista quizzes. Loader: getQuizzesByUser com count de responses. Action DELETE. UI: grid de cards com modal de embed mostrando o script para copiar."
        },
        {
          "arquivo": "app/routes/_dashboard.quizzes.new.tsx",
          "rota": "/quizzes/new",
          "descricao": "Criar quiz. Renderiza BuilderLayout vazio. Action POST cria quiz e redireciona para edição."
        },
        {
          "arquivo": "app/routes/_dashboard.quizzes.$id.edit.tsx",
          "rota": "/quizzes/:id/edit",
          "descricao": "Editar quiz. Loader busca quiz verificando userId. Action PUT atualiza."
        },
        {
          "arquivo": "app/routes/_dashboard.responses.tsx",
          "rota": "/responses",
          "descricao": "Respostas com filtros. Loader: getResponses com quiz_id, result_band, date_from, date_to, page. Action DELETE bulk. UI: tabela paginada com colunas dinâmicas por pergunta."
        },
        {
          "arquivo": "app/routes/api.responses.export.tsx",
          "rota": "/api/responses/export",
          "descricao": "Loader retorna Response com CSV. Headers: Content-Type text/csv, Content-Disposition attachment."
        },
        {
          "arquivo": "app/routes/api.quizzes.$id.export.tsx",
          "rota": "/api/quizzes/:id/export",
          "descricao": "Exporta quiz como JSON — { v, title, questions, settings }."
        },
        {
          "arquivo": "app/routes/api.quizzes.import.tsx",
          "rota": "/api/quizzes/import",
          "descricao": "Action POST importa JSON e cria quiz com título + (Importado)."
        }
      ],
      "publicas": [
        {
          "arquivo": "app/routes/api.public.quiz.$id.tsx",
          "rota": "/api/public/quiz/:id",
          "descricao": "Retorna dados do quiz sem autenticação. Headers CORS: Access-Control-Allow-Origin: *"
        },
        {
          "arquivo": "app/routes/api.public.responses.submit.tsx",
          "rota": "/api/public/responses/submit",
          "descricao": "Action POST recebe resposta final. Rate limit 100/hora por IP. CORS aberto. Retorna { response_id, result: band_data }."
        },
        {
          "arquivo": "app/routes/api.public.responses.partial.tsx",
          "rota": "/api/public/responses/partial",
          "descricao": "Action POST salva resposta parcial em tempo real. CORS aberto. Retorna { response_id }."
        },
        {
          "arquivo": "app/routes/embed.$id[.js].tsx",
          "rota": "/embed/:id.js",
          "descricao": "Loader serve JavaScript vanilla como application/javascript. Cache-Control: public max-age=300. O script gerado contém o quiz_id hardcoded e faz fetch das APIs públicas para renderizar o quiz completo no site do cliente.",
          "o_script_gerado_faz": [
            "Detecta posição via document.currentScript",
            "Cria div container hbq-QUIZ_ID",
            "Injeta CSS do quiz no head via style tag",
            "Fetch /api/public/quiz/QUIZ_ID para buscar questions e settings",
            "Renderiza HTML das telas: landing, lead capture, perguntas, loading, resultado",
            "Gerencia navegação entre telas e barra de progresso",
            "POST /api/public/responses/partial a cada pergunta respondida",
            "Calcula score e result_band ao final",
            "POST /api/public/responses/submit",
            "Renderiza tela de resultado com dados retornados"
          ]
        },
        {
          "arquivo": "app/routes/api.webhooks.clerk.tsx",
          "rota": "/api/webhooks/clerk",
          "descricao": "Action POST sincroniza usuários do Clerk."
        }
      ],
      "auth": [
        {
          "arquivo": "app/routes/_auth.login.tsx",
          "rota": "/login",
          "descricao": "Clerk SignIn component"
        },
        {
          "arquivo": "app/routes/_auth.signup.tsx",
          "rota": "/signup",
          "descricao": "Clerk SignUp component"
        }
      ]
    },
    "componentes": {
      "builder": {
        "BuilderLayout.tsx": "Container principal. Props: quiz? Gerencia estado questions[] e settings{}. Botão Salvar usa useFetcher do Remix.",
        "BuilderSidebar.tsx": "5 botões de step numerados com destaque no ativo",
        "Step1General.tsx": "Configurações gerais — headline Tiptap, subheadline Tiptap, CTA, badge, ImageUploader landing, 3 checklists, urgency, URL oferta global, webhook URL, select idioma PT/ES",
        "Step2Lead.tsx": "3 toggles whatsapp/nome/email + campos de texto para labels e placeholders + textarea mensagem WhatsApp",
        "Step3Bands.tsx": "4 cards fixos leve/moderada/moderada_avancada/avancada — label, range min/max, color picker fundo, color picker texto, description, ImageUploader, URL oferta, mensagem última pergunta",
        "Step4Questions.tsx": "Lista @dnd-kit sortable. Cada card: texto pergunta, ícone emoji, toggle informacional, toggle carrossel, ImageUploader, select posição mídia, 4 linhas opção com texto + pontos",
        "Step5ResultPage.tsx": "Todos os campos de result_page — type select, badge, journey, comparativo 4 itens, needs, diagnóstico, solução com lista dinâmica, entregáveis lista dinâmica, passos, benefícios lista dinâmica, prova social, pricing, urgência final",
        "ImageUploader.tsx": "Uploadthing com preview, botão remover. Props: value string, onChange, multiple boolean",
        "TiptapEditor.tsx": "Editor com toolbar: B I U link lista. Props: value HTML string, onChange"
      },
      "ui": [
        "Button.tsx",
        "Card.tsx",
        "Modal.tsx",
        "Toggle.tsx",
        "ColorPicker.tsx",
        "Toast.tsx",
        "Pagination.tsx",
        "Badge.tsx"
      ]
    },
    "lib": {
      "db/index.ts": "export function getDb(env) — cria Drizzle com @neondatabase/serverless e env.DATABASE_URL",
      "db/schema.ts": "Schema Drizzle para quizzes e responses",
      "db/queries/quizzes.ts": "getQuizzesByUser, getQuizById, createQuiz, updateQuiz, deleteQuiz, countResponsesByQuiz, getAllQuizzes",
      "db/queries/responses.ts": "getResponses, getAllResponses, insertResponse, updateResponse, deleteResponses, getDashboardStats, getResultBandData",
      "auth.ts": "getAuth() helper do @clerk/remix",
      "cors.ts": "corsHeaders() — retorna objeto com Access-Control-Allow-Origin: *",
      "rate-limit.ts": "rateLimitByIp(ip) — Map em memória, 100 req/hora",
      "sanitize.ts": "sanitizeQuestions() e sanitizeSettings() — validação espelhando o plugin WP original"
    },
    "public": {
      "quiz-embed.css": "CSS extraído do quiz.css do plugin WP, adaptado para funcionar como embed standalone sem classes do WordPress"
    },
    "deploy": {
      "comando_manual": "npx wrangler pages deploy ./build/client",
      "automatico": "Conectar repo GitHub no Cloudflare Pages Dashboard — build command: npm run build — output: ./build/client",
      "env_vars": "Cloudflare Pages Dashboard → Settings → Environment Variables → Production"
    },
    "ordem_de_implementacao": [
      "1. npm create cloudflare@latest hub-stack-quizz-builder -- --template=cloudflare/templates/remix",
      "2. Instalar dependências",
      "3. Configurar wrangler.toml",
      "4. Configurar Tailwind",
      "5. Criar schema Drizzle — npx drizzle-kit push contra Neon",
      "6. Configurar Clerk com @clerk/remix no root.tsx",
      "7. Criar layout _dashboard.tsx com proteção",
      "8. Implementar lib/db/queries",
      "9. Implementar rotas API públicas — public/quiz e public/responses",
      "10. Implementar embed script — embed.$id[.js].tsx",
      "11. Testar embed colando em HTML puro",
      "12. Implementar páginas: Quizzes, Responses, Dashboard",
      "13. Implementar Builder steps 1 a 5",
      "14. Implementar export/import CSV e JSON",
      "15. Deploy: wrangler pages deploy",
      "16. Conectar GitHub para deploy automático"
    ],
    "notas_criticas": [
      "NUNCA usar process.env — sempre context.cloudflare.env.VAR via loader/action",
      "OBRIGATORIO usar @neondatabase/serverless com driver HTTP — pg e postgres.js não funcionam no Workers runtime",
      "Todas as rotas /api/public/* e /embed/* precisam de headers CORS Access-Control-Allow-Origin: *",
      "O embed script deve ser JavaScript vanilla puro — zero dependências externas",
      "A estrutura de questions e settings é idêntica ao plugin WP — compatível com importação de quizzes existentes",
      "quiz-embed.css deve ser o quiz.css do plugin WP original adaptado para standalone"
    ]
  }
}