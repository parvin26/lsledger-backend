'use client'

import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      <div className="max-w-[720px] mx-auto py-16 px-4 md:px-8">
        <Link href="/" className="inline-block text-sm font-medium mb-8 transition-colors ll-hover-text-navy" style={{ color: 'var(--color-muted-text)' }}>
          ← Home
        </Link>

        <h1 className="text-3xl font-semibold mb-2" style={{ color: 'var(--color-lighthouse-navy)' }}>
          Privacy Policy
        </h1>
        <p className="text-sm mb-12" style={{ color: 'var(--color-muted-text)' }}>
          Effective date: 28 February 2026
        </p>

        <div className="prose prose-slate max-w-none space-y-8" style={{ color: 'var(--color-deep-slate)', lineHeight: 1.7 }}>
          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>Who we are</h2>
            <p>
              Lighthouse Ledger is operated by SP Corporate Services Sdn Bhd.<br />
              Address: Kuala Lumpur, Wilayah Persekutuan, Malaysia<br />
              Contact: info@lhledger.com
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>What this policy covers</h2>
            <p>
              This Privacy Policy explains how we collect, use, share and protect personal data when you use the Lighthouse Ledger website and services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>What we collect</h2>
            <p className="mb-4">We may collect:</p>

            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-deep-slate)' }}>A. Information you provide</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Account information:</strong> name, email, password and profile details</li>
              <li><strong>Evidence and records:</strong> files, links, descriptions, work artefacts, metadata and structured responses you submit</li>
              <li><strong>Communications:</strong> messages you send to us such as support requests</li>
            </ul>

            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-deep-slate)' }}>B. Information collected automatically</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Usage data:</strong> pages viewed, features used, clicks and time spent</li>
              <li><strong>Device and log data:</strong> IP address, browser type, device identifiers and timestamps</li>
              <li><strong>Cookies and similar tools:</strong> to keep you signed in, secure the service and understand usage</li>
            </ul>

            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-deep-slate)' }}>C. Information from connected services (optional)</h3>
            <p>If you connect third-party services, we may receive data you authorize us to access.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>Why we use your data</h2>
            <p className="mb-4">We use personal data to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and operate the service</li>
              <li>Create, store and display capability records you create</li>
              <li>Support evidence review workflows and quality assurance</li>
              <li>Provide record status and authenticity checks on shareable pages</li>
              <li>Prevent fraud, abuse and security incidents</li>
              <li>Improve the product through analytics, testing and debugging</li>
              <li>Meet legal and audit obligations where applicable</li>
              <li>Communicate with you about support requests, service changes and important notices</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>How sharing and public links work</h2>
            <p>
              If you generate a shareable record link, others may be able to view the information shown on that page.
            </p>
            <p className="mt-4">
              Verification pages are designed to confirm record authenticity, status and scope of review. They are not a licence, degree or proof of universal or future performance.
            </p>
            <p className="mt-4">
              You control sharing by your actions and settings. Do not upload sensitive personal data about other people unless you have lawful basis and explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>Who we share data with</h2>
            <p className="mb-4">We may share data with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Service providers that host, secure or support the service</li>
              <li>Reviewers or assessors involved in your review process under confidentiality and process rules</li>
              <li>Partners you explicitly authorize, for example when you ask to share a record with an institution</li>
              <li>Authorities where required by law or to protect rights, safety and security</li>
            </ul>
            <p className="mt-4 font-medium">We do not sell your personal data.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>Data retention</h2>
            <p>
              We retain personal data as long as needed to provide the service and for legitimate purposes such as security, auditability and dispute handling. You may request deletion, subject to legal or operational needs, including fraud prevention, security logs, audit records and unresolved disputes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>Security</h2>
            <p>
              We use reasonable administrative, technical and organisational safeguards to protect data. No system is perfectly secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>Your choices and rights</h2>
            <p className="mb-4">Depending on your location, you may have rights to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Withdraw consent where processing is based on consent</li>
              <li>Object to certain processing</li>
              <li>Request a copy of your personal data</li>
            </ul>
            <p>To make a request, contact info@lhledger.com.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>International transfers</h2>
            <p>
              Your data may be processed in Malaysia and in other countries where our service providers operate. We take steps to protect transfers using appropriate safeguards where required.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>Children</h2>
            <p>
              Lighthouse Ledger is intended for users who are at least 18 years old or the age of majority in their jurisdiction. If you are under 18, use of the service is only permitted where allowed by law and with appropriate parent or guardian consent. If you believe a child has provided personal data without appropriate consent, contact info@lhledger.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>Changes to this policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will post the updated version with a new effective date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>Contact</h2>
            <p>
              Privacy questions: info@lhledger.com<br />
              Address: Kuala Lumpur, Wilayah Persekutuan, Malaysia
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t flex flex-wrap gap-6" style={{ borderColor: 'var(--color-divider)' }}>
          <Link href="/terms" className="text-sm font-medium transition-colors ll-hover-text-navy" style={{ color: 'var(--color-signal-blue)' }}>
            Terms of Service
          </Link>
          <Link href="/" className="text-sm font-medium transition-colors ll-hover-text-navy" style={{ color: 'var(--color-signal-blue)' }}>
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
