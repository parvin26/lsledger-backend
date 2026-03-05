import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseServer } from '@/lib/supabaseServer'

const subscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the Privacy Policy to subscribe.' }),
  }),
})

/**
 * POST /api/newsletter/subscribe
 * Public endpoint. Stores email in newsletter_subscribers.
 * Duplicate handling: if already subscribed, returns success; if previously unsubscribed, re-subscribes.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = subscribeSchema.parse(body)

    const email = validated.email.trim().toLowerCase()
    const now = new Date().toISOString()

    // Check for existing subscriber
    const { data: existing } = await supabaseServer
      .from('newsletter_subscribers')
      .select('id, unsubscribed_at')
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      if (existing.unsubscribed_at === null) {
        // Already subscribed – idempotent success
        return NextResponse.json({
          success: true,
          message: "You're already subscribed. We'll keep you updated.",
        })
      }
      // Previously unsubscribed – re-subscribe
      const { error: updateError } = await supabaseServer
        .from('newsletter_subscribers')
        .update({
          unsubscribed_at: null,
          consented_at: now,
          subscribed_at: now,
          updated_at: now,
        })
        .eq('id', existing.id)

      if (updateError) {
        return NextResponse.json(
          { success: false, message: 'Could not update subscription. Please try again.' },
          { status: 500 }
        )
      }
      return NextResponse.json({
        success: true,
        message: "You're back on the list. We'll keep you updated.",
      })
    }

    // New subscriber
    const { error: insertError } = await supabaseServer.from('newsletter_subscribers').insert({
      email,
      consented_at: now,
      subscribed_at: now,
      source: 'footer',
    })

    if (insertError) {
      if (insertError.code === '23505') {
        // Unique violation – race condition, treat as success
        return NextResponse.json({
          success: true,
          message: "Thanks for subscribing! We'll keep you updated.",
        })
      }
      return NextResponse.json(
        { success: false, message: 'Could not subscribe. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Thanks for subscribing! We'll keep you updated.",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
