// supabase/functions/ai-concierge/index.ts

import { createClient } from 'npm:@supabase/supabase-js@2';

// CORS básico para llamar desde navegador / app
const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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
  // opcionalmente puedes extender con más campos (reason, destination_slug, etc.)
}

interface RequestBody {
  conversationId?: string;
  message: string;
  // opcionalmente podrías mandar destinationSlug, locale, etc.
}

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

    // Client con contexto del usuario (RLS ON)
    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    // Client admin (service role) para operaciones privilegiadas
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Obtener usuario autenticado
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

    // Parsear body
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

    // 1) Obtener tier de membresía y perfil para contexto
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

    const defaultDestination = (profile?.default_destination as string | null) ?? null;
    const preferredLanguage = (profile?.preferred_language as 'es' | 'en' | null) ?? 'es';

    const priorityByTier: Record<MembershipTier, number> = {
      gold: 1,
      platinum: 2,
      black_elite: 3,
    };
    const priority = priorityByTier[userTier];

    // 2) Crear conversación si no existe
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
      // Validar que la conversación pertenezca a este usuario
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

    // 3) Insertar mensaje del usuario (RLS ON)
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

    // 4) Cargar historial de conversación (últimos N mensajes)
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

    // 5) Preparar mensajes para GPT-4o
    const chatMessages = [
      {
        role: 'system' as const,
        content: `
Eres el concierge de lujo de Duke Life.

Contexto:
- Membership tier del usuario: ${userTier}
- Idioma preferido: ${preferredLanguage}
- Destino por defecto: ${defaultDestination ?? 'no definido'}

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

No incluyas nada fuera del JSON. No uses comentarios. No uses Markdown.
        `.trim(),
      },
      // Historial de la conversación como user/assistant
      ...history.map((m) => ({
        role:
          m.sender_type === 'user'
            ? ('user' as const)
            : ('assistant' as const), // ai + human los tratamos como assistant
        content: m.content,
      })),
    ];

    // 6) Llamar a OpenAI GPT-4o
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: chatMessages,
        temperature: 0.3,
      }),
    });

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      console.error('OpenAI error', openaiRes.status, errorText);
      return new Response(
        JSON.stringify({ error: 'OpenAI request failed' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const openaiJson = await openaiRes.json();
    const content =
      openaiJson.choices?.[0]?.message?.content?.toString() ?? '';

    let parsed: AiConciergeResult;

    try {
      // limpiar si viniera con ```json ... ```
      const clean = content
        .trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```/, '')
        .replace(/```$/, '')
        .trim();

      parsed = JSON.parse(clean) as AiConciergeResult;
    } catch (e) {
      console.error('Error parsing AI JSON, using fallback', e, content);
      parsed = {
        assistant_reply:
          'En este momento no puedo procesar tu solicitud, pero un concierge humano te apoyará en breve.',
        intent: 'other',
        needs_human: true,
        confidence: 0,
        summary: 'Fallo al parsear respuesta de IA',
        structured_payload: null,
      };
    }

    // Normalizar algunos campos
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
      parsed.assistant_reply ||
      'Estoy aquí para ayudarte con tus experiencias. ¿Qué necesitas exactamente?';

    const summary =
      parsed.summary ||
      `Solicitud de tipo ${intent} por parte del usuario ${userId}`;

    const structuredPayload =
      parsed.structured_payload && typeof parsed.structured_payload === 'object'
        ? parsed.structured_payload
        : null;

    // 7) Insertar mensaje del AI (admin client, sin RLS)
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
      // seguimos, pero el front no verá el mensaje en realtime
    }

    // 8) Crear / actualizar concierge_request
    const { data: existingRequest } = await supabaseAdmin
      .from('concierge_requests')
      .select('id, status')
      .eq('conversation_id', conversationId)
      .in('status', ['open', 'pending_ai', 'pending_human'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // SLA según tier
    const baseSlaMinutes =
      userTier === 'black_elite' ? 10 : userTier === 'platinum' ? 20 : 30;
    const slaDeadline = needsHuman
      ? new Date(Date.now() + baseSlaMinutes * 60 * 1000).toISOString()
      : null;

    const conciergeStatus = needsHuman
      ? 'pending_human'
      : 'pending_ai'; // para reporting

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

    // 9) Si necesita humano → handoff + marcar conversación
    if (needsHuman && conciergeRequestId) {
      const { error: handoffError } = await supabaseAdmin
        .from('handoffs')
        .insert({
          concierge_request_id: conciergeRequestId,
          triggered_by: 'ai',
          reason: 'needs_human_or_low_confidence',
        });

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

      // Aquí es donde podrías llamar a otro Edge Function / n8n
      // para notificar al staff (Slack, email, WhatsApp, etc.)
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

    // 10) Respuesta para el cliente
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
    return new Response(
      JSON.stringify({ error: 'Unexpected error in ai-concierge' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
