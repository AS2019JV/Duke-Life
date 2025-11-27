// supabase/functions/reservation-notify/index.ts

import { createClient } from 'npm:@supabase/supabase-js@2';
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-webhook-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ReservationNotifyBody {
  reservationId: string;
  event: 'reservation_confirmed' | 'reservation_created' | 'reservation_cancelled';
}

interface Destination {
  name: string;
}

interface Experience {
  title: string;
  destination_id: string;
  destinations?: Destination;
}

interface ReservationRow {
  id: string;
  user_id: string;
  experience_id: string;
  scheduled_at: string | null;
  status: string;
}

interface ReservationWithRelations extends ReservationRow {
  experiences?: Experience;
}

async function sendExpoPush(
  expoPushToken: string,
  title: string,
  body: string,
  data: Record<string, unknown>,
): Promise<void> {
  const endpoint =
    Deno.env.get('EXPO_PUSH_ENDPOINT') ??
    'https://exp.host/--/api/v2/push/send';

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        to: expoPushToken,
        title,
        body,
        sound: 'default',
        data,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error('Expo push error', res.status, txt);
    }
  } catch (e) {
    console.error('Expo push failed', e);
  }
}

async function getSupabaseAdmin(): Promise<SupabaseClient> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase env vars');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
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
    // 1) Verificar secreto
    const secretHeader = req.headers.get('x-webhook-secret') ?? '';
    const expectedSecret = Deno.env.get('RESERVATION_NOTIFY_SECRET') ?? '';

    if (!expectedSecret || secretHeader !== expectedSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as ReservationNotifyBody;

    if (!body.reservationId || !body.event) {
      return new Response(
        JSON.stringify({ error: 'Missing reservationId or event' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const supabaseAdmin = await getSupabaseAdmin();

    // 2) Leer reserva
    const { data: reservationData, error: resError } = await supabaseAdmin
      .from('reservations')
      .select(
        'id, user_id, experience_id, scheduled_at, status, experiences(title, destination_id, destinations(name))',
      )
      .eq('id', body.reservationId)
      .single();

    const reservation = reservationData as ReservationWithRelations | null;

    if (resError || !reservation) {
      console.error('Reservation not found', resError);
      return new Response(
        JSON.stringify({ error: 'Reservation not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const userId = reservation.user_id as string;

    // 3) Obtener expo_push_token del usuario
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('expo_push_token, preferred_language')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile', profileError);
    }

    const expoPushToken = profile?.expo_push_token as string | null;

    if (!expoPushToken) {
      console.warn(
        `User ${userId} has no expo_push_token, skipping push notification`,
      );
      return new Response(
        JSON.stringify({ ok: true, skipped: 'no_expo_push_token' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const lang = (profile?.preferred_language as 'es' | 'en' | null) ?? 'es';

    const experienceTitle =
      reservation.experiences?.title ?? 'tu experiencia';
    const destinationName =
      reservation.experiences?.destinations?.name ?? 'tu destino';

    const scheduledAt = reservation.scheduled_at
      ? new Date(reservation.scheduled_at)
      : null;

    const formattedDate =
      scheduledAt?.toLocaleString(lang === 'es' ? 'es-MX' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }) ?? null;

    // 4) Construir mensaje según evento
    let title: string;
    let bodyText: string;

    if (body.event === 'reservation_confirmed') {
      title = lang === 'es'
        ? 'Reserva confirmada'
        : 'Reservation confirmed';

      bodyText = lang === 'es'
        ? `Tu experiencia "${experienceTitle}" en ${destinationName} está confirmada${formattedDate ? ` para ${formattedDate}` : ''}.`
        : `Your experience "${experienceTitle}" in ${destinationName} is confirmed${formattedDate ? ` for ${formattedDate}` : ''}.`;
    } else if (body.event === 'reservation_created') {
      title = lang === 'es'
        ? 'Solicitud de reserva recibida'
        : 'Reservation request received';

      bodyText = lang === 'es'
        ? `Hemos recibido tu solicitud para "${experienceTitle}" en ${destinationName}. Te confirmaremos en breve.`
        : `We received your request for "${experienceTitle}" in ${destinationName}. We will confirm it shortly.`;
    } else if (body.event === 'reservation_cancelled') {
      title = lang === 'es'
        ? 'Reserva cancelada'
        : 'Reservation cancelled';

      bodyText = lang === 'es'
        ? `Tu reserva de "${experienceTitle}" ha sido cancelada.`
        : `Your reservation for "${experienceTitle}" has been cancelled.`;
    } else {
      title = 'Duke Life';
      bodyText = 'Actualización de tu reserva.';
    }

    // 5) Enviar push
    await sendExpoPush(expoPushToken, title, bodyText, {
      event: body.event,
      reservationId: reservation.id,
      experienceId: reservation.experience_id,
    });

    return new Response(
      JSON.stringify({ ok: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (e) {
    console.error('reservation-notify unhandled error', e);
    return new Response(
      JSON.stringify({ error: 'Unexpected error in reservation-notify' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
