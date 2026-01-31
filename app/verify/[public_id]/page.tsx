import { supabaseServer } from '@/lib/supabaseServer'
import { notFound } from 'next/navigation'

interface VerificationData {
  public_id: string
  domain: string
  capability_summary: string
  confidence_band: 'Low' | 'Medium' | 'High'
  created_at: string
  intent_prompt?: string
}

async function getVerification(publicId: string): Promise<VerificationData | null> {
  const { data, error } = await supabaseServer
    .from('verifications')
    .select('public_id, domain, capability_summary, confidence_band, created_at, intent_prompt')
    .eq('public_id', publicId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    public_id: data.public_id,
    domain: data.domain,
    capability_summary: data.capability_summary,
    confidence_band: data.confidence_band,
    created_at: data.created_at,
    intent_prompt: data.intent_prompt || undefined
  }
}

export default async function VerifyPage({
  params
}: {
  params: { public_id: string }
}) {
  const verification = await getVerification(params.public_id)

  if (!verification) {
    notFound()
  }

  const date = new Date(verification.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem 1rem',
      color: '#1a1a1a',
      lineHeight: '1.6'
    }}>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: '600',
        marginBottom: '2rem',
        letterSpacing: '-0.02em',
        color: '#000'
      }}>
        Capability Review Record
      </h1>

      <div style={{
        borderTop: '1px solid #e0e0e0',
        paddingTop: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            fontSize: '0.875rem',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.5rem'
          }}>
            Domain
          </div>
          <div style={{
            fontSize: '1.125rem',
            fontWeight: '500',
            color: '#000'
          }}>
            {verification.domain}
          </div>
        </div>

        {verification.intent_prompt && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              fontSize: '0.875rem',
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.5rem'
            }}>
              Learning Intent
            </div>
            <div style={{
              fontSize: '1rem',
              color: '#333'
            }}>
              {verification.intent_prompt}
            </div>
          </div>
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            fontSize: '0.875rem',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.5rem'
          }}>
            Capability Summary
          </div>
          <div style={{
            fontSize: '1rem',
            color: '#333'
          }}>
            {verification.capability_summary}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            fontSize: '0.875rem',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.5rem'
          }}>
            Confidence Band
          </div>
          <div style={{
            fontSize: '1rem',
            fontWeight: '500',
            color: '#000'
          }}>
            {verification.confidence_band}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            fontSize: '0.875rem',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.5rem'
          }}>
            Record ID
          </div>
          <div style={{
            fontSize: '0.875rem',
            fontFamily: 'monospace',
            color: '#666',
            wordBreak: 'break-all'
          }}>
            {verification.public_id}
          </div>
        </div>

        <div>
          <div style={{
            fontSize: '0.875rem',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.5rem'
          }}>
            Date
          </div>
          <div style={{
            fontSize: '1rem',
            color: '#333'
          }}>
            {date}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '3rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid #e0e0e0',
        fontSize: '0.875rem',
        color: '#666',
        lineHeight: '1.8'
      }}>
        <p style={{ margin: 0 }}>
          <strong>Disclaimer:</strong> This is a capability review record based on submitted evidence and assessment responses. 
          It is not a degree, license, certification, or hiring decision. This record reflects a review of demonstrated 
          capabilities at the time of assessment and does not constitute formal accreditation or qualification.
        </p>
      </div>
    </div>
  )
}
