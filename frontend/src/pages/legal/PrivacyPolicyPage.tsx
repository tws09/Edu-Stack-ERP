export default function PrivacyPolicyPage() {
  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", background: '#f9fafb', color: '#111827', lineHeight: 1.7, minHeight: '100vh' }}>
      <header style={{ background: '#1e40af', color: '#fff', padding: '40px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.5px' }}>EduStack Privacy Policy</h1>
        <p style={{ marginTop: 8, fontSize: '0.95rem', opacity: 0.85 }}>Last updated: June 20, 2026 &nbsp;|&nbsp; Effective: June 20, 2026</p>
      </header>

      <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 24px 80px' }}>

        <Card>
          <H2>1. Who We Are</H2>
          <P>EduStack is a school management platform (ERP) developed and operated by <strong>TWS Enterprises</strong> under the domain <strong>edu.tws.enterprises</strong>. We provide software services to educational institutions across Pakistan, enabling them to manage students, attendance, academics, fees, and staff.</P>
          <P>This Privacy Policy explains how EduStack collects, uses, stores, and protects personal data when you use our mobile application or web platform.</P>
          <P><strong>Contact:</strong> <A href="mailto:m.subhan6612@gmail.com">m.subhan6612@gmail.com</A></P>
        </Card>

        <Card>
          <H2>2. Data We Collect</H2>
          <P>EduStack collects only the data necessary to deliver school management services. The type of data collected depends on your role (admin, teacher, student, parent).</P>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={th}>Category</th>
                <th style={th}>Data Points</th>
                <th style={th}>Who</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Account Information', 'Full name, email address, phone number, password (hashed)', 'All users'],
                ['Student Identity', 'Full name, date of birth, gender, profile photo, home address, CNIC / B-Form number', 'Students'],
                ['Academic Records', 'Attendance records, exam results, grades, assignment submissions, timetable', 'Students'],
                ['Financial Records', 'Fee structure, payment history, outstanding balance, JazzCash / EasyPaisa transaction references', 'Students / Parents'],
                ['Parent / Guardian', 'Full name, phone number, email address, relationship to student', 'Parents'],
                ['Device Data', 'Firebase device token (push notifications only), device type', 'All users'],
                ['Usage Data', 'Login timestamps, IP address (for security audit logs only)', 'All users'],
              ].map(([cat, data, who], i) => (
                <tr key={i}><td style={td}>{cat}</td><td style={td}>{data}</td><td style={td}>{who}</td></tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <H2>3. How We Use Your Data</H2>
          <ul style={ulStyle}>
            {[
              'Authenticate users and manage role-based access',
              'Display student academic records, attendance, and results',
              'Process and track school fee payments',
              'Send push notifications (fee reminders, exam schedules, announcements)',
              'Generate academic reports and certificates',
              'Manage staff payroll records',
              'Monitor system security and investigate unauthorized access',
            ].map((item) => <li key={item} style={liStyle}>{item}</li>)}
          </ul>
          <P>We do <strong>not</strong> use your data for advertising, profiling, or selling to third parties.</P>
        </Card>

        <Card>
          <H2>4. Data Sharing & Third-Party Services</H2>
          <P>EduStack uses the following trusted third-party services that may process your data as part of delivering our platform.</P>
          <table style={tableStyle}>
            <thead>
              <tr><th style={th}>Service</th><th style={th}>Provider</th><th style={th}>Purpose</th></tr>
            </thead>
            <tbody>
              {[
                ['Firebase Cloud Messaging', 'Google LLC', 'Push notifications to mobile devices'],
                ['Firebase Crashlytics', 'Google LLC', 'Crash reporting and app stability'],
                ['AWS S3', 'Amazon Web Services', 'Secure cloud storage for uploaded files and documents'],
                ['JazzCash', 'Jazz / Mobilink Microfinance', 'Mobile payment processing (Pakistan)'],
                ['EasyPaisa', 'Telenor Microfinance Bank', 'Mobile payment processing (Pakistan)'],
                ['MongoDB Atlas', 'MongoDB Inc.', 'Managed database hosting'],
              ].map(([svc, provider, purpose], i) => (
                <tr key={i}><td style={td}>{svc}</td><td style={td}>{provider}</td><td style={td}>{purpose}</td></tr>
              ))}
            </tbody>
          </table>
          <P style={{ marginTop: 16 }}><strong>We do not sell, rent, or trade your personal data to any third party for marketing or commercial purposes.</strong></P>
          <P>Data is shared with school administrators, teachers, and parents only to the extent required for normal school operations and only within your institution's account.</P>
        </Card>

        <Card>
          <H2>5. Data Security</H2>
          <ul style={ulStyle}>
            {[
              ['All data is transmitted over ', 'HTTPS / TLS 1.2+'],
              ['Passwords are hashed using ', 'bcrypt (cost factor 12)', ' — never stored in plaintext'],
              ['Authentication uses short-lived ', 'JWT access tokens (15-minute expiry)', ' with secure, HttpOnly refresh tokens'],
              ['On mobile, tokens are stored in ', 'encrypted Keystore/Keychain (Flutter Secure Storage)'],
              ['Files stored on AWS S3 are accessed via time-limited ', 'presigned URLs'],
              ['Database access is restricted by IP allowlist and role-based permissions'],
              ['Audit logs record all sensitive data modifications with timestamp and user ID'],
            ].map((parts, i) => (
              <li key={i} style={liStyle}>
                {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <H2>6. Data Retention</H2>
          <table style={tableStyle}>
            <thead>
              <tr><th style={th}>Data Type</th><th style={th}>Retention Period</th></tr>
            </thead>
            <tbody>
              {[
                ['Student academic records', '10 years after graduation / leaving'],
                ['Attendance records', '5 years'],
                ['Fee & payment records', '7 years (financial compliance)'],
                ['Audit logs', '2 years'],
                ['Push notification tokens', 'Until account deletion or token rotation'],
                ['Deleted accounts', 'Permanently removed within 30 days of deletion request'],
              ].map(([type, period], i) => (
                <tr key={i}><td style={td}>{type}</td><td style={td}>{period}</td></tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <H2>7. Your Rights</H2>
          <P>You have the right to:</P>
          <ul style={ulStyle}>
            {[
              ['Access', ' the personal data EduStack holds about you'],
              ['Correct', ' inaccurate or incomplete data'],
              ['Request deletion', ' of your account and associated data'],
              ['Object', ' to specific processing activities'],
              ['Export', ' your data in a portable format (upon written request)'],
            ].map(([bold, rest], i) => (
              <li key={i} style={liStyle}><strong>{bold}</strong>{rest}</li>
            ))}
          </ul>
          <P>To exercise any of these rights, contact your <strong>school administrator</strong> or email us at <A href="mailto:m.subhan6612@gmail.com">m.subhan6612@gmail.com</A>.</P>
        </Card>

        <Card>
          <H2>8. Account & Data Deletion</H2>
          <P>To delete your account and all associated personal data:</P>
          <ul style={ulStyle}>
            <li style={liStyle}><strong>Students / Parents:</strong> Contact your school administrator to request account removal</li>
            <li style={liStyle}><strong>School Admins:</strong> Email <A href="mailto:m.subhan6612@gmail.com">m.subhan6612@gmail.com</A> with your organization name and deletion request</li>
          </ul>
          <P>All personal data will be permanently and irreversibly deleted within <strong>30 days</strong> of a verified deletion request. Academic records required for regulatory compliance may be retained in anonymized form only.</P>
          <P>You can also submit a deletion request via our dedicated page: <A href="/delete-account">edu.tws.enterprises/delete-account</A></P>
        </Card>

        <Card>
          <H2>9. Children's Privacy</H2>
          <P>EduStack is designed for use by educational institutions. Our platform is intended for users aged <strong>13 and above</strong>. We do not knowingly collect personal data from children under 13 without verifiable parental or guardian consent obtained through the school.</P>
          <P>All student data is managed and controlled by the school institution, not directly by minors. If you believe a child's data has been collected improperly, contact us immediately at <A href="mailto:m.subhan6612@gmail.com">m.subhan6612@gmail.com</A>.</P>
        </Card>

        <Card>
          <H2>10. Cookies & Tracking</H2>
          <P>The EduStack web platform uses <strong>HttpOnly session cookies</strong> for authentication only. We do not use advertising cookies, tracking pixels, or third-party analytics cookies. The mobile app does not use cookies.</P>
        </Card>

        <Card>
          <H2>11. Changes to This Policy</H2>
          <P>We may update this Privacy Policy periodically. When we make significant changes, we will notify users via in-app notification or email. The "Last updated" date at the top of this page always reflects the most recent revision.</P>
          <P>Continued use of EduStack after changes are posted constitutes your acceptance of the revised policy.</P>
        </Card>

        <Card>
          <H2>12. Contact Us</H2>
          <P>For any privacy-related questions, requests, or concerns:</P>
          <ul style={ulStyle}>
            <li style={liStyle}><strong>Email:</strong> <A href="mailto:m.subhan6612@gmail.com">m.subhan6612@gmail.com</A></li>
            <li style={liStyle}><strong>Website:</strong> <A href="https://edu.tws.enterprises">edu.tws.enterprises</A></li>
            <li style={liStyle}><strong>Operator:</strong> TWS Enterprises, Pakistan</li>
          </ul>
          <P>We aim to respond to all privacy inquiries within <strong>5 business days</strong>.</P>
        </Card>

      </main>

      <footer style={{ textAlign: 'center', padding: 24, fontSize: '0.85rem', color: '#9ca3af' }}>
        &copy; 2026 TWS Enterprises — EduStack. All rights reserved.
      </footer>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: '36px 40px', marginBottom: 24 }}>{children}</div>;
}
function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e40af', marginBottom: 14, paddingBottom: 8, borderBottom: '2px solid #eff6ff' }}>{children}</h2>;
}
function P({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <p style={{ marginBottom: 12, fontSize: '0.96rem', color: '#374151', ...style }}>{children}</p>;
}
function A({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} style={{ color: '#1e40af', textDecoration: 'none' }}>{children}</a>;
}

const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', marginTop: 10, fontSize: '0.93rem' };
const th: React.CSSProperties = { background: '#eff6ff', color: '#1e40af', textAlign: 'left', padding: '10px 14px', fontWeight: 600 };
const td: React.CSSProperties = { padding: '9px 14px', borderBottom: '1px solid #f3f4f6', color: '#374151' };
const ulStyle: React.CSSProperties = { margin: '8px 0 12px 20px' };
const liStyle: React.CSSProperties = { marginBottom: 6, fontSize: '0.96rem', color: '#374151' };
