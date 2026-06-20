export default function DeleteAccountPage() {
  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", background: '#f9fafb', color: '#111827', lineHeight: 1.7, minHeight: '100vh' }}>
      <header style={{ background: '#dc2626', color: '#fff', padding: '40px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Account Deletion Request</h1>
        <p style={{ marginTop: 8, fontSize: '0.95rem', opacity: 0.85 }}>EduStack — edu.tws.enterprises</p>
      </header>

      <main style={{ maxWidth: 700, margin: '40px auto', padding: '0 24px 80px' }}>
        <div style={card}>
          <h2 style={h2Red}>How to Delete Your Account</h2>
          <p style={p}>EduStack accounts are created and managed by school institutions. Depending on your role, follow the appropriate steps below.</p>

          <Step num={1} title="Students & Parents">
            Contact your school administrator directly and request account deletion. The admin can remove your account from the EduStack school portal.
          </Step>
          <Step num={2} title="School Administrators">
            Send an email to <a href="mailto:m.subhan6612@gmail.com" style={{ color: '#dc2626' }}>m.subhan6612@gmail.com</a> with the subject line <strong>"Account Deletion Request"</strong>, including your organization name and the account(s) to be deleted.
          </Step>
          <Step num={3} title="Confirmation">
            You will receive a confirmation email once the deletion is complete. All personal data is permanently deleted within <strong>30 days</strong> of a verified request.
          </Step>
        </div>

        <div style={card}>
          <h2 style={h2Red}>What Gets Deleted</h2>
          <ul style={{ margin: '8px 0 12px 20px' }}>
            {['Your login credentials (email & password)', 'Profile information (name, phone, photo)', 'Push notification device tokens', 'Session and login history'].map((item) => (
              <li key={item} style={li}>{item}</li>
            ))}
          </ul>
          <p style={p}>Academic records (grades, attendance) may be retained in anonymized form for the school's regulatory compliance obligations, with all personally identifying information removed.</p>
          <div style={{ background: '#fef2f2', borderLeft: '4px solid #dc2626', padding: '14px 18px', borderRadius: 6, fontSize: '0.93rem', color: '#7f1d1d', marginTop: 12 }}>
            <strong>Note:</strong> Account deletion is permanent and cannot be undone. Any data associated with your account will be irrecoverably removed within 30 days.
          </div>
        </div>

        <div style={card}>
          <h2 style={h2Red}>Contact</h2>
          <p style={p}>For questions about your data or the deletion process:</p>
          <ul style={{ margin: '8px 0 12px 20px' }}>
            <li style={li}><strong>Email:</strong> <a href="mailto:m.subhan6612@gmail.com" style={{ color: '#dc2626' }}>m.subhan6612@gmail.com</a></li>
            <li style={li}><strong>Privacy Policy:</strong> <a href="/privacy" style={{ color: '#dc2626' }}>edu.tws.enterprises/privacy</a></li>
          </ul>
          <p style={p}>We respond to all requests within <strong>5 business days</strong>.</p>
        </div>
      </main>

      <footer style={{ textAlign: 'center', padding: 24, fontSize: '0.85rem', color: '#9ca3af' }}>
        &copy; 2026 TWS Enterprises — EduStack. All rights reserved.
      </footer>
    </div>
  );
}

function Step({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
      <div style={{ background: '#dc2626', color: '#fff', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '0.9rem' }}>
        {num}
      </div>
      <div>
        <h3 style={{ fontSize: '0.97rem', fontWeight: 700, color: '#111827', marginBottom: 4 }}>{title}</h3>
        <p style={{ margin: 0, fontSize: '0.96rem', color: '#374151' }}>{children}</p>
      </div>
    </div>
  );
}

const card: React.CSSProperties = { background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: '36px 40px', marginBottom: 24 };
const h2Red: React.CSSProperties = { fontSize: '1.1rem', fontWeight: 700, color: '#dc2626', marginBottom: 14, paddingBottom: 8, borderBottom: '2px solid #fef2f2' };
const p: React.CSSProperties = { marginBottom: 12, fontSize: '0.96rem', color: '#374151' };
const li: React.CSSProperties = { marginBottom: 8, fontSize: '0.96rem', color: '#374151' };
