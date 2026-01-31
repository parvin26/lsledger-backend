export default function HomePage() {
  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem 1rem',
      textAlign: 'center'
    }}>
      <h1>Lighthouse Ledger API</h1>
      <p>Backend API server is running.</p>
      <p style={{ color: '#666', marginTop: '2rem' }}>
        API endpoints are available at <code>/api/*</code>
      </p>
    </div>
  )
}
