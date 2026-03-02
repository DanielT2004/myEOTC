// Sends event notification emails via Courier to one or more recipients.
// Runs server-side so there is no CORS issue (browser cannot call api.courier.com directly).
// Set COURIER_API_KEY in Supabase secrets. Recipients: request body toEmails[] or toEmail.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const COURIER_SEND_URL = "https://api.courier.com/send";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("COURIER_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "COURIER_API_KEY must be set in Supabase secrets" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body for event data and recipient list
    let payload: {
      eventName?: string;
      eventType?: string;
      description?: string;
      address?: string;
      churchName?: string;
    } = {};
    let toEmails: string[] = [];

    try {
      const body = await req.json();
      if (body && typeof body === "object") {
        payload = {
          eventName: body.eventName ?? body.event_name ?? "",
          eventType: body.eventType ?? body.event_type ?? "",
          description: body.description ?? "",
          address: body.address ?? body.location ?? "",
          churchName: body.churchName ?? body.church_name ?? "",
        };
        // Recipients are pre-validated at subscribe time (subscribeService + SubscribeModal)
        if (Array.isArray(body.toEmails)) {
          toEmails = body.toEmails.map((e: unknown) => String(e));
        } else if (body.toEmail) {
          toEmails = [String(body.toEmail)];
        }
      }
    } catch {
      // No body or invalid JSON
    }

    if (toEmails.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No recipients. Provide toEmails (array) or toEmail in the request body.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Single request: Courier accepts an array of recipients in to
    const res = await fetch(COURIER_SEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          to: toEmails.map((email) => ({ email })),
          template: "D8S7BFE4PZ471JJET2Y4VY4DZZJR",
          brand_id: "NTGTZ9P4AH4GHSJ4PK1WN2NJYB52",
          data: {
            eventName: payload.eventName ?? "New Event",
            eventType: payload.eventType ?? "",
            description: payload.description ?? "",
            address: payload.address ?? "",
            churchName: payload.churchName ?? "",
          },
          routing: { method: "single", channels: ["email"] },
        },
      }),
    });

    if (res.status !== 200 && res.status !== 202) {
      const errText = await res.text();
      return new Response(
        JSON.stringify({ error: "Courier send failed", status: res.status, detail: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const courierData = await res.json().catch(() => ({}));
    return new Response(
      JSON.stringify({
        message: `Sent to ${toEmails.length} recipient(s)`,
        to: toEmails,
        requestId: courierData?.requestId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
