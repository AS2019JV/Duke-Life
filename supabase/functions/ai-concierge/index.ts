// supabase/functions/ai-concierge/index.ts
import { createClient } from 'npm:@supabase/supabase-js@2';
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';


const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};


// -----------------------------------------
// HELPERS NOTIFICACIONES STAFF
// -----------------------------------------

async function sendWhatsAppText(to: string, body: string): Promise<void> {
  const version = Deno.env.get('WHATSAPP_API_VERSION') ?? 'v21.0';
  const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') ?? '';
  const token = Deno.env.get('WHATSAPP_ACCESS_TOKEN') ?? '';

  if (!phoneNumberId || !token) {
    console.warn('WhatsApp env vars missing, skipping WhatsApp notification');
    return;
  }

  try {
    const url = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body },
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error('WhatsApp API error', res.status, txt);
    }
  } catch (e) {
    console.error('WhatsApp notification failed', e);
  }
}

async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const apiKey = Deno.env.get('RESEND_API_KEY') ?? '';
  const from = Deno.env.get('RESEND_FROM_EMAIL') ?? '';

  if (!apiKey || !from) {
    console.warn('Resend env vars missing, skipping email notification');
    return;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error('Resend API error', res.status, txt);
    }
  } catch (e) {
    console.error('Email notification failed', e);
  }
}

async function getStaffNotificationTargets(
  supabaseAdmin: SupabaseClient,
): Promise<{
  emails: string[];
  whatsappNumbers: string[];
}> {
  const { data, error } = await supabaseAdmin
    .from('staff_notification_channels')
    .select('channel_type, address')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching staff_notification_channels', error);
    return { emails: [], whatsappNumbers: [] };
  }

  const emails = data
    .filter((c) => c.channel_type === 'email')
    .map((c) => c.address as string);

  const whatsappNumbers = data
    .filter((c) => c.channel_type === 'whatsapp')
    .map((c) => c.address as string);

  return { emails, whatsappNumbers };
}

async function notifyStaffOnHandoff(params: {
  supabaseAdmin: SupabaseClient;
  conciergeRequestId: string;
  conversationId: string;
  userId: string;
  userTier: MembershipTier;
  defaultDestination: string;
  preferredLanguage: string;
}) {
  const {
    supabaseAdmin,
    conciergeRequestId,
    conversationId,
    userId,
    userTier,
    defaultDestination,
    preferredLanguage,
  } = params;

  const dashboardUrl = Deno.env.get('APP_DASHBOARD_URL') //??
    //'https://dukelife.bolt.host/admin';

  // Obtener info básica del usuario (email) y request
  const [userRes, crRes] = await Promise.all([
    supabaseAdmin.auth.admin.getUserById(userId),
    supabaseAdmin
      .from('concierge_requests')
      .select('id, category, summary, structured_payload, status, created_at')
      .eq('id', conciergeRequestId)
      .maybeSingle(),
  ]);

  const userEmail = userRes.data?.user?.email ?? '';
  const cr = crRes.data;

  const { emails, whatsappNumbers } = await getStaffNotificationTargets(
    supabaseAdmin,
  );

  if (emails.length === 0 && whatsappNumbers.length === 0) {
    console.warn('No staff notification channels configured');
    return;
  }

  const title = `[DUKE] Nuevo handoff concierge – ${userTier.toUpperCase()} – ${defaultDestination}`;
  const summary = cr?.summary ?? 'Nueva solicitud del concierge';
  const createdAt = cr?.created_at ?? new Date().toISOString();

  const link = `${dashboardUrl}/concierge/${conversationId}`;

  const textBody =
    `Nuevo handoff de concierge:\n\n` +
    `Tier: ${userTier}\n` +
    `Destino: ${defaultDestination}\n` +
    `Idioma: ${preferredLanguage}\n` +
    (userEmail ? `Email usuario: ${userEmail}\n` : '') +
    `Resumen: ${summary}\n` +
    `Creado: ${createdAt}\n` +
    `Ver en panel: ${link}`;

  const htmlBody =
    `<p><strong>Nuevo handoff de concierge</strong></p>` +
    `<ul>` +
    `<li><strong>Tier:</strong> ${userTier}</li>` +
    `<li><strong>Destino:</strong> ${defaultDestination}</li>` +
    `<li><strong>Idioma:</strong> ${preferredLanguage}</li>` +
    (userEmail ? `<li><strong>Email usuario:</strong> ${userEmail}</li>` : '') +
    `<li><strong>Resumen:</strong> ${summary}</li>` +
    `<li><strong>Creado:</strong> ${createdAt}</li>` +
    `</ul>` +
    `<p><a href="${link}" target="_blank" rel="noopener noreferrer">Abrir conversación en el panel</a></p>`;

  // Disparar en paralelo, pero sin bloquear el flow principal
  await Promise.allSettled([
    ...emails.map((to) => sendEmail(to, title, htmlBody)),
    ...whatsappNumbers.map((to) => sendWhatsAppText(to, textBody)),
  ]);
}


//Continua el Code


type MembershipTier = 'gold' | 'platinum' | 'black_elite';

type AiIntent =
  | 'reservation'
  | 'upgrade'
  | 'transport'
  | 'recommendation'
  | 'issue'
  | 'other';

interface AiConciergeResult {
  assistant_reply: string;
  intent: AiIntent;
  needs_human: boolean;
  confidence: number;
  summary: string;
  structured_payload: Record<string, unknown> | null;
}

interface RequestBody {
  conversationId?: string;
  message: string;
}

type ResponseFormat = 'json' | 'text';

interface AiConciergeConfig {
  id: string;
  name: string;
  is_active: boolean;
  model: string;
  temperature: number;
  top_p: number | null;
  max_tokens: number | null;
  response_format: ResponseFormat;
  system_prompt_template: string;
}

function sanitizeNumber(
  value: unknown,
  min: number,
  max: number,
  fallback: number,
): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

function sanitizeMaxTokens(value: unknown, fallback?: number): number | undefined {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.floor(n);
}

// Simple templating: reemplaza {{key}} por string
function renderTemplate(
  template: string,
  variables: Record<string, string>,
): string {
  return Object.entries(variables).reduce((acc, [key, value]) => {
    const re = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    return acc.replace(re, value);
  }, template);
}

// Mensaje genérico de fallback (por si OpenAI está caído o algo sale mal)
const FALLBACK_ASSISTANT_MESSAGE =
  'En este momento no puedo procesar tu solicitud. ' +
  'Un concierge de Duke Life te ayudará en breve.';

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') ?? '';

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey || !openaiApiKey) {
      console.error('Missing env vars');
      return new Response(
        JSON.stringify({ error: 'Server not configured correctly' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing auth token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const jwt = authHeader.replace('Bearer ', '');

    // Clients
    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Usuario autenticado
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(jwt);

    if (userError || !user) {
      console.error('Error fetching user', userError);
      return new Response(JSON.stringify({ error: 'Invalid user' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as RequestBody;
    if (!body.message || typeof body.message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid "message"' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const userId = user.id;
    let conversationId = body.conversationId ?? null;

    // 1) Cargar configuración de AI concierge (última activa)
    let config: AiConciergeConfig | null = null;
    {
      const { data: cfg, error: cfgError } = await supabaseAdmin
        .from('ai_concierge_configs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cfgError) {
        console.error('Error fetching ai_concierge_config', cfgError);
      } else if (cfg) {
        config = cfg as AiConciergeConfig;
      }
    }

    const model = config?.model || 'gpt-4o';
    const temperature = sanitizeNumber(config?.temperature, 0, 1, 0.3);
    const topP =
      config?.top_p != null ? sanitizeNumber(config.top_p, 0, 1, 1) : undefined;
    const maxTokens = sanitizeMaxTokens(config?.max_tokens, undefined);
    const responseFormat: ResponseFormat = config?.response_format || 'json';

    const defaultSystemPromptTemplate = `
Eres el concierge de lujo de Duke Life.

Contexto:
- Membership tier del usuario: {{membership_tier}}
- Idioma preferido: {{preferred_language}}
- Destino por defecto: {{default_destination}}
- ID del usuario: {{user_id}}

Objetivo:
1. Contestar amablemente, en lenguaje claro, como concierge de alto nivel.
2. Identificar la intención principal del mensaje (intents predefinidos).
3. Decidir si la IA puede resolver sola o necesita humano.
4. Devolver SIEMPRE un JSON con esta estructura, sin texto adicional:

{
  "assistant_reply": "texto que verá el usuario",
  "intent": "reservation | upgrade | transport | recommendation | issue | other",
  "needs_human": true/false,
  "confidence": 0.0-1.0,
  "summary": "resumen corto de lo que pide",
  "structured_payload": {
    "date": "YYYY-MM-DD o null",
    "time": "HH:mm o null",
    "people": número o null,
    "budget": número o null,
    "destination": "slug destino o null",
    "notes": "texto libre"
  }
}

No incluyas nada fuera del JSON. No uses Markdown. No uses comentarios.
`.trim();

    const templateToUse =
      config?.system_prompt_template?.trim() || defaultSystemPromptTemplate;

    // 2) Tier y perfil para rellenar variables del prompt
    const { data: membership } = await supabaseUserClient
      .from('memberships')
      .select('tier, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    const userTier = (membership?.tier as MembershipTier | null) ?? 'gold';

    const { data: profile } = await supabaseUserClient
      .from('profiles')
      .select('full_name, default_destination, preferred_language')
      .eq('id', userId)
      .maybeSingle();

    const defaultDestination =
      (profile?.default_destination as string | null) ?? 'no_definido';
    const preferredLanguage =
      (profile?.preferred_language as 'es' | 'en' | null) ?? 'es';

    const priorityByTier: Record<MembershipTier, number> = {
      gold: 1,
      platinum: 2,
      black_elite: 3,
    };
    const priority = priorityByTier[userTier];

    const systemPrompt = renderTemplate(templateToUse, {
      membership_tier: userTier,
      preferred_language: preferredLanguage,
      default_destination: defaultDestination,
      user_id: userId,
    });

    // 3) Crear conversación si no existe
    if (!conversationId) {
      const { data: newConv, error: convError } = await supabaseAdmin
        .from('conversations')
        .insert({
          user_id: userId,
          status: 'active',
          priority,
        })
        .select('id')
        .single();

      if (convError || !newConv) {
        console.error('Error creating conversation', convError);
        return new Response(
          JSON.stringify({ error: 'Could not create conversation' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      }

      conversationId = newConv.id as string;
    } else {
      const { data: conv, error: convFetchError } = await supabaseAdmin
        .from('conversations')
        .select('id, user_id')
        .eq('id', conversationId)
        .single();

      if (convFetchError || !conv || conv.user_id !== userId) {
        console.error('Conversation not found or does not belong to user');
        return new Response(JSON.stringify({ error: 'Conversation not allowed' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 4) Insertar mensaje del usuario
    const { error: insertUserMsgError } = await supabaseUserClient
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_type: 'user',
        content: body.message,
      });

    if (insertUserMsgError) {
      console.error('Error inserting user message', insertUserMsgError);
      return new Response(
        JSON.stringify({ error: 'Could not insert user message' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // 5) Historial de conversación (últimos N mensajes)
    const { data: history, error: historyError } = await supabaseUserClient
      .from('messages')
      .select('sender_type, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(30);

    if (historyError) {
      console.error('Error fetching history', historyError);
      return new Response(
        JSON.stringify({ error: 'Could not fetch history' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // 6) Preparar mensajes para OpenAI
    const chatMessages = [
      {
        role: 'system' as const,
        content: systemPrompt,
      },
      ...history.map((m) => ({
        role:
          m.sender_type === 'user'
            ? ('user' as const)
            : ('assistant' as const),
        content: m.content,
      })),
    ];

    // 7) Llamar a OpenAI con configuración dinámica
    let parsed: AiConciergeResult | null = null;

    try {
      const bodyReq: Record<string, unknown> = {
        model,
        messages: chatMessages,
        temperature,
      };

      if (topP !== undefined) bodyReq.top_p = topP;
      if (maxTokens !== undefined) bodyReq.max_tokens = maxTokens;
      if (responseFormat === 'json') {
        bodyReq.response_format = { type: 'json_object' };
      }

      const openaiRes = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify(bodyReq),
        },
      );

      if (!openaiRes.ok) {
        const errorText = await openaiRes.text();
        console.error('OpenAI error', openaiRes.status, errorText);
        // caeremos al fallback
      } else {
        const openaiJson = await openaiRes.json();
        const content =
          openaiJson.choices?.[0]?.message?.content?.toString() ?? '';

        const clean = content
          .trim()
          .replace(/^```json\s*/i, '')
          .replace(/^```/, '')
          .replace(/```$/, '')
          .trim();

        parsed = JSON.parse(clean) as AiConciergeResult;
      }
    } catch (e) {
      console.error('Error calling/parsing OpenAI', e);
      // parsed seguirá null → usaremos fallback
    }

    if (!parsed) {
      parsed = {
        assistant_reply: FALLBACK_ASSISTANT_MESSAGE,
        intent: 'other',
        needs_human: true,
        confidence: 0,
        summary: 'Fallo de IA, escalado automático a concierge humano',
        structured_payload: null,
      };
    }

    const intent: AiIntent =
      ['reservation', 'upgrade', 'transport', 'recommendation', 'issue'].includes(
        parsed.intent,
      )
        ? parsed.intent
        : 'other';

    const needsHuman = Boolean(parsed.needs_human);
    const confidence =
      typeof parsed.confidence === 'number'
        ? Math.min(Math.max(parsed.confidence, 0), 1)
        : 0.5;

    const assistantReply =
      parsed.assistant_reply || FALLBACK_ASSISTANT_MESSAGE;

    const summary =
      parsed.summary ||
      `Solicitud de tipo ${intent} por parte del usuario ${userId}`;

    const structuredPayload =
      parsed.structured_payload && typeof parsed.structured_payload === 'object'
        ? parsed.structured_payload
        : null;

    // 8) Insertar mensaje de la IA
    const { error: insertAiMsgError } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_type: 'ai',
        content: assistantReply,
        is_internal_note: false,
      });

    if (insertAiMsgError) {
      console.error('Error inserting AI message', insertAiMsgError);
      // seguimos igual, el front se puede enterar por la respuesta directa
    }

    // 9) Crear / actualizar concierge_request
    const { data: existingRequest } = await supabaseAdmin
      .from('concierge_requests')
      .select('id, status')
      .eq('conversation_id', conversationId)
      .in('status', ['open', 'pending_ai', 'pending_human'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const baseSlaMinutes =
      userTier === 'black_elite' ? 10 : userTier === 'platinum' ? 20 : 30;
    const slaDeadline = needsHuman
      ? new Date(Date.now() + baseSlaMinutes * 60 * 1000).toISOString()
      : null;

    const conciergeStatus = needsHuman ? 'pending_human' : 'pending_ai';

    let conciergeRequestId: string | null = null;

    if (existingRequest?.id) {
      const { data: updated, error: updateCrError } = await supabaseAdmin
        .from('concierge_requests')
        .update({
          category: intent,
          status: conciergeStatus,
          ai_confidence: confidence,
          summary,
          structured_payload: structuredPayload,
          sla_deadline: slaDeadline,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingRequest.id)
        .select('id')
        .single();

      if (updateCrError) {
        console.error('Error updating concierge_request', updateCrError);
      } else {
        conciergeRequestId = updated.id as string;
      }
    } else {
      const { data: inserted, error: insertCrError } = await supabaseAdmin
        .from('concierge_requests')
        .insert({
          conversation_id: conversationId,
          user_id: userId,
          category: intent,
          status: conciergeStatus,
          ai_confidence: confidence,
          summary,
          structured_payload: structuredPayload,
          sla_deadline: slaDeadline,
        })
        .select('id')
        .single();

      if (insertCrError) {
        console.error('Error inserting concierge_request', insertCrError);
      } else {
        conciergeRequestId = inserted.id as string;
      }
    }

    // 10) Handoff a humano si hace falta
    if (needsHuman && conciergeRequestId) {
      const { data: handoffData, error: handoffError } = await supabaseAdmin
        .from('handoffs')
        .insert({
          concierge_request_id: conciergeRequestId,
          triggered_by: 'ai',
          reason: 'needs_human_or_low_confidence',
        })
        .select('id')
        .single();

      if (handoffError) {
        console.error('Error inserting handoff', handoffError);
      }

      const { error: updateConvError } = await supabaseAdmin
        .from('conversations')
        .update({
          status: 'waiting_for_human',
          priority,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

      if (updateConvError) {
        console.error('Error updating conversation status', updateConvError);
      }

      // 🔔 NOTIFICAR AL STAFF (no bloqueamos si falla)
      if (conciergeRequestId) {
        notifyStaffOnHandoff({
          supabaseAdmin,
          conciergeRequestId,
          conversationId,
          userId,
          userTier,
          defaultDestination,
          preferredLanguage,
        }).catch((e) =>
          console.error('notifyStaffOnHandoff failed (non-blocking)', e)
        );
      }
    } else {
      // Mantener conversación activa
      await supabaseAdmin
        .from('conversations')
        .update({
          status: 'active',
          priority,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId);
    }

    // 11) Respuesta al cliente
    const responseBody = {
      conversationId,
      assistant_reply: assistantReply,
      intent,
      needs_human: needsHuman,
      confidence,
      concierge_request_id: conciergeRequestId,
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Unhandled error in ai-concierge', e);
    // Fallback duro: mandamos a humano
    return new Response(
      JSON.stringify({
        error: 'Unexpected error in ai-concierge',
        assistant_reply: FALLBACK_ASSISTANT_MESSAGE,
        needs_human: true,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
