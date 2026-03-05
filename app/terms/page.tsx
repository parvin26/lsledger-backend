'use client'

import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      <div className="max-w-[720px] mx-auto py-16 px-4 md:px-8">
        <Link href="/" className="inline-block text-sm font-medium mb-8 transition-colors ll-hover-text-navy" style={{ color: 'var(--color-muted-text)' }}>
          ← Home
        </Link>

        <h1 className="text-3xl font-semibold mb-2" style={{ color: 'var(--color-lighthouse-navy)' }}>
          Terms of Service
        </h1>
        <p className="text-sm mb-12" style={{ color: 'var(--color-muted-text)' }}>
          Effective date: 28 February 2026
        </p>

        <div className="prose prose-slate max-w-none space-y-8" style={{ color: 'var(--color-deep-slate)', lineHeight: 1.7 }}>
          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>Acceptance of these Terms</h2>
            <p>
              By accessing or using Lighthouse Ledger, you agree to these Terms. If you do not agree, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>What Lighthouse Ledger is</h2>
            <p>
              Lighthouse Ledger is an evidence-first capability record and review system. It helps users submit evidence of work or learning and receive structured review outputs under stated rubrics and governance rules.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>What Lighthouse Ledger is not</h2>
            <p className="mb-4">Lighthouse Ledger is not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>A school or course platform</li>
              <li>An accreditation body, formal qualification issuer or licensing authority</li>
              <li>A hiring decision-maker, admissions authority or automated gatekeeper</li>
              <li>A guarantee of employability, funding, admission, promotion or business outcomes</li>
              <li>Proof of universal or future performance</li>
            </ul>
            <p className="mt-4">
              Any employer, institution, funder or partner remains responsible for its own decisions and due diligence.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>Eligibility</h2>
            <p>
              You must be at least 18 years old or the age of majority where you live. If you are under 18, use is only permitted where allowed by law and with appropriate parent or guardian consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>Accounts</h2>
            <p>
              You are responsible for keeping your login credentials confidential and for all activity under your account. You agree to provide accurate information and to update it as needed.
            </p>
            <p className="mt-4">
              We may suspend or terminate accounts for security, integrity or policy reasons.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>Your content and evidence submissions</h2>

            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-deep-slate)' }}>A. Ownership</h3>
            <p>You retain ownership of the content you submit.</p>

            <h3 className="text-lg font-medium mb-2 mt-6" style={{ color: 'var(--color-deep-slate)' }}>B. Licence to operate the service</h3>
            <p>
              You grant Lighthouse Ledger a limited licence to host, process, store, display and share your content as needed to operate the service and as directed by your sharing settings.
            </p>

            <h3 className="text-lg font-medium mb-2 mt-6" style={{ color: 'var(--color-deep-slate)' }}>C. Your responsibilities</h3>
            <p className="mb-4">You agree not to submit:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>False, misleading or fabricated evidence</li>
              <li>Content you do not have the right to share</li>
              <li>Confidential third-party information without permission</li>
              <li>Sensitive personal data of others without explicit consent and lawful basis</li>
              <li>Illegal content or content that violates the rights of others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>Reviews, signals and records</h2>

            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-deep-slate)' }}>A. Review is bounded</h3>
            <p>
              Any review output reflects submitted evidence, stated criteria and documented review conditions. It does not certify universal competence.
            </p>

            <h3 className="text-lg font-medium mb-2 mt-6" style={{ color: 'var(--color-deep-slate)' }}>B. Confidence signals</h3>
            <p>
              Confidence signals are bounded indicators tied to evidence sufficiency and reviewer agreement for a specific domain and use case. They are not probabilities of competence.
            </p>

            <h3 className="text-lg font-medium mb-2 mt-6" style={{ color: 'var(--color-deep-slate)' }}>C. Issuance, status and revocation</h3>
            <p>
              Records may be issued when criteria are met. We may update, suspend or revoke a record if we identify integrity issues, policy violations or material errors. We may add audit notes where appropriate.
            </p>

            <h3 className="text-lg font-medium mb-2 mt-6" style={{ color: 'var(--color-deep-slate)' }}>D. Appeals</h3>
            <p>
              If an appeals process is offered, it will follow stated rules and timeframes proportionate to the stakes of the decision. Details may be published on the website or in product documentation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>Shareable links and verification pages</h2>
            <p>
              If you generate a shareable record link, you authorise Lighthouse Ledger to display the information configured for that link. Verification pages are intended to confirm authenticity, status and scope, not to guarantee outcomes.
            </p>
            <p className="mt-4">
              You are responsible for what you share and with whom you share it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>Acceptable use</h2>
            <p className="mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the service for unlawful purposes</li>
              <li>Attempt to bypass security controls</li>
              <li>Scrape, harvest or mass-collect data from the service</li>
              <li>Interfere with service operation</li>
              <li>Impersonate others or misrepresent affiliation</li>
              <li>Use records for unlawful discrimination or fully automated exclusion without human review</li>
            </ul>
            <p className="mt-4">
              We may restrict use to prevent misuse and protect users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>Fees</h2>
            <p>
              Some features may be free and some may require payment. If paid features are offered, pricing and billing terms will be shown at purchase. Taxes may apply.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>Intellectual property</h2>
            <p>
              The Lighthouse Ledger service, software, design and branding are owned by SP Corporate Services Sdn Bhd or its licensors. You may not copy, modify, reverse engineer or redistribute the service except as permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>Third-party services</h2>
            <p>
              The service may link to or integrate with third-party services. We are not responsible for third-party services, content or policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>Disclaimers</h2>
            <p>
              The service is provided on an as-is and as-available basis. We do not warrant that the service will be uninterrupted or error-free or that any record will be accepted by third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, SP Corporate Services Sdn Bhd will not be liable for indirect, incidental, special, consequential or punitive damages, or any loss of profits, data or business opportunities arising from your use of the service.
            </p>
            <p className="mt-4">
              If your jurisdiction does not allow certain limitations, some limitations may not apply.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>Indemnity</h2>
            <p>
              You agree to indemnify and hold harmless SP Corporate Services Sdn Bhd from claims arising out of your content, your misuse of the service or your violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>Termination</h2>
            <p>
              You may stop using the service at any time. We may suspend or terminate access if you violate these Terms or if needed to protect users, integrity or security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>Governing law and disputes</h2>
            <p>
              These Terms are governed by the laws of Malaysia. Disputes will be handled in the courts located in Kuala Lumpur, Wilayah Persekutuan, Malaysia, unless required otherwise by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>Changes to these Terms</h2>
            <p>
              We may update these Terms from time to time. We will post updates with a new effective date. Continued use after updates means you accept the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>Contact</h2>
            <p>
              General and support: info@lhledger.com<br />
              Address: Kuala Lumpur, Wilayah Persekutuan, Malaysia
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t flex flex-wrap gap-6" style={{ borderColor: 'var(--color-divider)' }}>
          <Link href="/privacy" className="text-sm font-medium transition-colors ll-hover-text-navy" style={{ color: 'var(--color-signal-blue)' }}>
            Privacy Policy
          </Link>
          <Link href="/" className="text-sm font-medium transition-colors ll-hover-text-navy" style={{ color: 'var(--color-signal-blue)' }}>
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
