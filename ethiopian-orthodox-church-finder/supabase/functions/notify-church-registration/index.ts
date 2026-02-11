// Example Supabase Edge Function for email notifications
// To use this, you'll need to:
// 1. Install Supabase CLI: npm install -g supabase
// 2. Run: supabase init
// 3. Run: supabase functions new notify-church-registration
// 4. Replace this file content
// 5. Set RESEND_API_KEY in Supabase secrets
// 6. Deploy: supabase functions deploy notify-church-registration

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'admin@example.com'

serve(async (req) => {
  try {
    // Get the church data from the request
    const { record } = await req.json()
    
    if (!record || record.status !== 'pending') {
      return new Response(
        JSON.stringify({ message: 'Not a pending church registration' }),
        { status: 200 }
      )
    }

    // Send email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Church Finder <noreply@yourdomain.com>',
        to: [ADMIN_EMAIL],
        subject: `New Church Registration: ${record.name}`,
        html: `
          <h2>New Church Registration</h2>
          <p>A new church has been registered and is pending approval:</p>
          <ul>
            <li><strong>Name:</strong> ${record.name}</li>
            <li><strong>Address:</strong> ${record.address}, ${record.city}, ${record.state} ${record.zip}</li>
            <li><strong>Phone:</strong> ${record.phone || 'N/A'}</li>
            <li><strong>Submitted:</strong> ${new Date(record.created_at).toLocaleString()}</li>
          </ul>
          <p>Please review and approve or reject this registration in the admin dashboard.</p>
          <p><a href="${Deno.env.get('APP_URL')}/admin">Go to Admin Dashboard</a></p>
        `
      })
    })

    if (!emailResponse.ok) {
      throw new Error('Failed to send email')
    }

    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})

