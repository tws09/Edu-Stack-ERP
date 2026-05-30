import jsPDF from 'jspdf';

export interface TCStudent {
  admissionNo: string;
  rollNo: string;
  profile: {
    name: string;
    dateOfBirth?: string;
    gender?: string;
    cnicOrBForm?: string;
    address?: string;
  };
  guardianInfo: {
    fatherName: string;
    fatherCnic?: string;
    fatherPhone?: string;
  };
  admissionDate?: string;
  status: string;
  classId?: { name: string } | string;
  sectionId?: { name: string } | string;
}

const PRIMARY: [number, number, number] = [30, 58, 95];

export function downloadTransferCertPdf(student: TCStudent, orgName: string): void {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const m = 20;
  const cw = W - m * 2;
  let y = 15;

  const className = typeof student.classId === 'object' ? student.classId?.name ?? '—' : '—';
  const tcNo = `TC-${student.admissionNo}-${new Date().getFullYear()}`;
  const issueDate = new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'long', year: 'numeric' });

  // ── Header ────────────────────────────────────────────────
  doc.setFillColor(...PRIMARY);
  doc.rect(m, y, cw, 30, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(orgName, W / 2, y + 12, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(200, 215, 240);
  doc.text('TRANSFER CERTIFICATE', W / 2, y + 21, { align: 'center' });
  y += 36;

  // TC No & Date (top right)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`TC No: ${tcNo}`, W - m, y, { align: 'right' });
  doc.text(`Issue Date: ${issueDate}`, W - m, y + 6, { align: 'right' });
  y += 16;

  // ── Certification line ────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  const certLine = `This is to certify that the following student was enrolled at ${orgName} and is hereby issued this Transfer Certificate.`;
  const split = doc.splitTextToSize(certLine, cw);
  doc.text(split, m, y);
  y += split.length * 6 + 8;

  // ── Student details table ─────────────────────────────────
  const rows: [string, string][] = [
    ['Student Name',    student.profile.name],
    ['Admission No',    student.admissionNo],
    ['Roll No',         student.rollNo],
    ['Date of Birth',   student.profile.dateOfBirth ? new Date(student.profile.dateOfBirth).toLocaleDateString('en-PK') : '—'],
    ['Gender',          student.profile.gender ? student.profile.gender.charAt(0).toUpperCase() + student.profile.gender.slice(1) : '—'],
    ['CNIC / B-Form',   student.profile.cnicOrBForm ?? '—'],
    ['Class Last Attended', className],
    ['Admission Date',  student.admissionDate ? new Date(student.admissionDate).toLocaleDateString('en-PK') : '—'],
    ['Status at Leaving', student.status.charAt(0).toUpperCase() + student.status.slice(1)],
    ["Father's Name",   student.guardianInfo.fatherName ?? '—'],
    ["Father's CNIC",   student.guardianInfo.fatherCnic ?? '—'],
    ["Father's Phone",  student.guardianInfo.fatherPhone ?? '—'],
    ['Address',         student.profile.address ?? '—'],
  ];

  const labelW = 60;
  const rowH = 9;

  rows.forEach((row, i) => {
    const bg: [number, number, number] = i % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
    doc.setFillColor(...bg);
    doc.rect(m, y, cw, rowH, 'F');
    doc.setDrawColor(230, 230, 230);
    doc.rect(m, y, cw, rowH);

    // Label cell
    doc.setFillColor(240, 244, 250);
    doc.rect(m, y, labelW, rowH, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(60, 80, 110);
    doc.text(row[0], m + 3, y + 6);

    // Value cell
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.text(String(row[1]), m + labelW + 4, y + 6);
    y += rowH;
  });
  y += 20;

  // ── Remarks ───────────────────────────────────────────────
  doc.setFillColor(248, 250, 252);
  doc.rect(m, y, cw, 20, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.rect(m, y, cw, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text('Remarks:', m + 3, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.text('The student bears good character and has no dues outstanding at the time of leaving.', m + 3, y + 14);
  y += 30;

  // ── Signature blocks ──────────────────────────────────────
  const sigW = (cw - 20) / 2;
  const sigs = ['Class Teacher', 'Principal'];
  sigs.forEach((title, i) => {
    const sx = m + i * (sigW + 20);
    doc.setDrawColor(180, 180, 180);
    doc.line(sx, y + 18, sx + sigW, y + 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(title, sx + sigW / 2, y + 24, { align: 'center' });
    doc.text('Signature & Stamp', sx + sigW / 2, y + 29, { align: 'center' });
  });
  y += 35;

  // ── Official stamp area ───────────────────────────────────
  doc.setFillColor(245, 245, 245);
  doc.rect(W / 2 - 20, y, 40, 14, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.setLineDashPattern([2, 1], 0);
  doc.rect(W / 2 - 20, y, 40, 14);
  doc.setLineDashPattern([], 0);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(180, 180, 180);
  doc.text('Official Stamp', W / 2, y + 9, { align: 'center' });

  // ── Footer ────────────────────────────────────────────────
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(190, 190, 190);
  doc.text('Generated by EduStack PK — WolfStack', W / 2, H - 9, { align: 'center' });
  doc.text('This is a computer-generated document.', W / 2, H - 5, { align: 'center' });

  doc.save(`TC_${student.profile.name.replace(/\s+/g, '_')}_${student.admissionNo}.pdf`);
}
