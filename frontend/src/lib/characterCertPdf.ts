import jsPDF from 'jspdf';

export interface CharCertStudent {
  admissionNo: string;
  rollNo?: string;
  profile: {
    name: string;
    dateOfBirth?: string;
    gender?: string;
    cnicOrBForm?: string;
  };
  guardianInfo: { fatherName: string };
  admissionDate?: string;
  classId?: { name: string } | string;
  leavingInfo?: { initiatedAt?: string; reason?: string; leftAt?: string };
}

const PRIMARY: [number, number, number] = [30, 58, 95];

export function downloadCharacterCertPdf(student: CharCertStudent, orgName: string): void {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const m = 22;
  const cw = W - m * 2;
  let y = 15;

  const issueDate = new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'long', year: 'numeric' });
  const certNo = `CC-${student.admissionNo}-${new Date().getFullYear()}`;
  const className = typeof student.classId === 'object' ? student.classId?.name ?? '—' : '—';

  // Header
  doc.setFillColor(...PRIMARY);
  doc.rect(m, y, cw, 30, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text(orgName, W / 2, y + 11, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(200, 220, 255);
  doc.text('CHARACTER CERTIFICATE', W / 2, y + 21, { align: 'center' });
  y += 36;

  // Cert No & Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text(`Cert No: ${certNo}`, m, y);
  doc.text(`Issue Date: ${issueDate}`, W - m, y, { align: 'right' });
  y += 14;

  // Intro
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(35, 35, 35);
  const intro = `This is to certify that the following student was enrolled at ${orgName} and during the entire period of their study, they maintained good moral character and discipline.`;
  const splitIntro = doc.splitTextToSize(intro, cw);
  doc.text(splitIntro, m, y);
  y += splitIntro.length * 5.5 + 12;

  // Details table
  const rows: [string, string][] = [
    ["Student's Name",   student.profile.name],
    ["Father's Name",    student.guardianInfo.fatherName],
    ['CNIC / B-Form',    student.profile.cnicOrBForm ?? '—'],
    ['Date of Birth',    student.profile.dateOfBirth ? new Date(student.profile.dateOfBirth).toLocaleDateString('en-PK') : '—'],
    ['Gender',           student.profile.gender ? student.profile.gender.charAt(0).toUpperCase() + student.profile.gender.slice(1) : '—'],
    ['Admission No',     student.admissionNo],
    ['Class / Program',  className],
    ['Admission Date',   student.admissionDate ? new Date(student.admissionDate).toLocaleDateString('en-PK') : '—'],
    ['Date of Leaving',  student.leavingInfo?.leftAt ? new Date(student.leavingInfo.leftAt).toLocaleDateString('en-PK') : issueDate],
  ];

  const labelW = 60;
  const rowH = 9;

  for (let i = 0; i < rows.length; i++) {
    const [label, value] = rows[i];
    const bg: [number, number, number] = i % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
    doc.setFillColor(...bg);
    doc.rect(m, y, cw, rowH, 'F');
    doc.setDrawColor(228, 228, 228);
    doc.rect(m, y, cw, rowH);

    doc.setFillColor(238, 244, 252);
    doc.rect(m, y, labelW, rowH, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(55, 75, 115);
    doc.text(label, m + 3, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.text(String(value), m + labelW + 4, y + 6);
    y += rowH;
  }
  y += 16;

  // Certificate body
  const body = `It is further certified that ${student.profile.name} was a student of good conduct throughout their tenure at ${orgName}. No disciplinary action was ever taken against them. They are leaving the institution on their own accord and we wish them all the best in their future endeavors.`;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(35, 35, 35);
  const splitBody = doc.splitTextToSize(body, cw);
  doc.text(splitBody, m, y);
  y += splitBody.length * 5.5 + 18;

  // Signature blocks
  const sigW = (cw - 20) / 2;
  ['Class Teacher', 'Principal / Director'].forEach((title, i) => {
    const sx = m + i * (sigW + 20);
    doc.setDrawColor(170, 170, 170);
    doc.line(sx, y + 14, sx + sigW, y + 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 100);
    doc.text(title, sx + sigW / 2, y + 20, { align: 'center' });
    doc.text('Signature & Stamp', sx + sigW / 2, y + 25, { align: 'center' });
  });
  y += 32;

  // Official stamp
  doc.setFillColor(246, 246, 246);
  doc.setDrawColor(200, 200, 200);
  doc.setLineDashPattern([2, 1], 0);
  doc.rect(W / 2 - 22, y, 44, 16, 'FD');
  doc.setLineDashPattern([], 0);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(180, 180, 180);
  doc.text('Official Stamp', W / 2, y + 9, { align: 'center' });

  // Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(190, 190, 190);
  doc.text('Generated by EduStack PK — WolfStack  |  This is a computer-generated document.', W / 2, H - 7, { align: 'center' });

  doc.save(`CharCert_${student.profile.name.replace(/\s+/g, '_')}_${student.admissionNo}.pdf`);
}
