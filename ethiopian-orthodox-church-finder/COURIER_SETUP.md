# Courier via Supabase Edge Function

When a church admin clicks **Notify members** on an event, notification emails are sent to the church's mailing list via [Courier](https://www.courier.com). When a church is first created, the admin is automatically added as the first subscriber. The call to Courier runs in a **Supabase Edge Function** (server-side), so you only run your client locally (`npm run dev`); no local server.

---

## 1. What’s already in the repo

- **Edge Function:** `supabase/functions/send-event-notification/index.ts`  
  It reads `COURIER_API_KEY` from Supabase secrets and sends a simple “Hello from Courier!” email via Courier’s API.

- **Client:** When a church admin clicks "Notify members", `courierService.sendEventNotificationEmail()` runs with the church's subscriber list.

---

## 2. Get your Courier API key 
1. Sign up or log in at [Courier](https://dashboard.courier.com).
2. Go to **Settings → API Keys** and copy your key (e.g. starts with `pk_`).
3. In Courier, set up the **Email** channel (e.g. add a provider or use test delivery).
4. Pick the email address where you want to receive the test (e.g. your Gmail). You’ll set this as `COURIER_API_KEY` only in Supabase.

---

## 3. Install Supabase CLI (if you haven’t)

```bash
npm install -g supabase
```

Or use the installer for your OS: [Supabase CLI](https://supabase.com/docs/guides/cli).

---

## 4. Log in and link your project

```bash
supabase login
```

Then link this repo to your Supabase project (use the project ref from your Supabase dashboard URL: `https://supabase.com/dashboard/project/<project-ref>`):

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

When prompted, enter your database password if asked.

---

## 5. Set secrets for the Edge Function

Set your Courier key as a Supabase secret (replace with your real value):

```bash
supabase secrets set COURIER_API_KEY=pk_your_actual_key_here
```

You can confirm they’re set (names only, not values) in the dashboard: **Project Settings → Edge Functions → Secrets**.

---

## 6. Deploy the Edge Function

From the project root:

```bash
supabase functions deploy send-event-notification
```

When it finishes, the function is live at:

`https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-event-notification`

Your app already calls it by name (`send-event-notification`); no code change needed.

---

## 7. Event data in your Courier template

The Edge Function sends these variables to your Courier template. **Yes, you can use dynamic text with a template** — the template defines the layout; the app fills in the data.

### Variables passed to the template

| Variable      | Meaning           | Example              |
|---------------|-------------------|----------------------|
| `eventName`   | Event title       | "Easter Service"     |
| `eventType`   | Event type        | "Holiday"            |
| `description` | Event description | "Join us for..."     |
| `address`     | Event location    | "123 Main St"        |
| `churchName`  | Church name       | "St. Mary Church"     |

### How to use them in the Courier template

1. In Courier, open **Content → Templates** and edit your notification template.
2. In the **email** block (subject or body), insert placeholders using double curly braces. The names must match exactly (case-sensitive):

   - **Subject line:** e.g. `New event: {{eventName}}`
   - **Body:** e.g.  
     `{{eventName}}` (type: {{eventType}})  
     `{{churchName}}`  
     `{{address}}`  
     `{{description}}`

3. Save and publish the template. When the app sends an event, Courier will replace each `{{variableName}}` with the value from the event.

If a variable is empty, Courier will render nothing for that placeholder (or you can add default text in the template).

---

## 8. Run and test locally

1. Start only the client:
   ```bash
   npm run dev
   ```
2. Open the app, log in as a church admin, open an approved church, create an event, then click **Notify members** on the event.
3. Check the inbox for `your admin email. You should receive the event notification “Hello from Courier!”.

If nothing arrives:

- **Browser console:** Look for `[courierService]` (e.g. “Edge function error”). That usually means the invoke failed or the function returned an error.
- **Supabase dashboard:** **Edge Functions → send-event-notification → Logs** to see errors from the function (e.g. missing secrets or Courier API errors).

---

## 9. Summary

| Step              | What you do |
|-------------------|-------------|
| Courier key       | Get from Courier dashboard; set in Supabase secrets. |
| Supabase CLI      | `supabase login`, `supabase link --project-ref ...` |
| Secrets           | `supabase secrets set COURIER_API_KEY=...` |
| Deploy function   | `supabase functions deploy send-event-notification` |
| Local dev         | Only `npm run dev`; the app calls the **deployed** function. No local server. |

The Edge Function code is in `supabase/functions/send-event-notification/index.ts`. Event data (event name, type, description, address, church name) is passed in the request body and forwarded to Courier as template variables — see section 7 for how to use them in your template. After changing the function, run `supabase functions deploy send-event-notification` again.
