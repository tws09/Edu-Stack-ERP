import jsPDF from 'jspdf';
import type { ChallanDoc } from '../services/feeService';

function studentName(c: ChallanDoc) {
  return typeof c.studentId === 'object' ? c.studentId.profile.name : 'Student';
}
function rollNo(c: ChallanDoc) {
  return typeof c.studentId === 'object' ? c.studentId.rollNo : '';
}
function className(c: ChallanDoc) {
  return typeof c.classId === 'object' ? c.classId.name : '';
}
function pkr(n: number) {
  return `Rs ${Math.abs(n).toLocaleString('en-PK')}`;
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

const PRIMARY: [number, number, number] = [30, 58, 95];

function drawCopy(
  doc: jsPDF,
  challan: ChallanDoc,
  orgName: string,
  copyLabel: string,
  startY: number,
): number {
  const W  = doc.internal.pageSize.getWidth();
  const m  = 14;
  const cw = W - m * 2;
  const c1 = m + 4;
  const c2 = m + cw / 2;
  let y = startY;

  // ── Header bar ─────────────────────────────────────────
  doc.setFillColor(...PRIMARY);
  doc.rect(m, y, cw, 22, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(orgName, c1, y + 9);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('SCHOOL FEE CHALLAN', c1, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.text(copyLabel, W - m - 4, y + 8, { align: 'right' });
  doc.setFontSize(9);
  doc.text(`Ch# ${challan.challanNo}`, W - m - 4, y + 16, { align: 'right' });
  y += 26;

  // ── Info rows ───────────────────────────────────────────
  const infoRow = (lbl1: string, v1: string, lbl2: string, v2: string) => {
    doc.setFillColor(248, 250, 252);
    doc.rect(m, y, cw, 16, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.rect(m, y, cw, 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(110, 110, 110);
    doc.text(lbl1, c1, y + 5);
    doc.text(lbl2, c2, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text(v1, c1, y + 12.5);
    doc.text(v2, c2, y + 12.5);
    y += 18;
  };

  infoRow('Student Name', studentName(challan), 'Roll No.', rollNo(challan));
  infoRow('Class', className(challan), 'Month', challan.month);

  // ── Items table header ──────────────────────────────────
  doc.setFillColor(...PRIMARY);
  doc.rect(m, y, cw, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Description', c1, y + 5.5);
  doc.text('Amount', W - m - 4, y + 5.5, { align: 'right' });
  y += 8;

  challan.items.forEach((item, i) => {
    const bg: [number, number, number] = i % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
    doc.setFillColor(...bg);
    doc.rect(m, y, cw, 7, 'F');
    doc.setDrawColor(235, 235, 235);
    doc.line(m, y + 7, m + cw, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 30, 30);
    doc.text(item.name, c1, y + 5);
    doc.text(pkr(item.amount), W - m - 4, y + 5, { align: 'right' });
    y += 7;
  });
  y += 2;

  // ── Totals ──────────────────────────────────────────────
  const rows: [string, string][] = [];
  if (challan.discount > 0) rows.push(['Discount', `- ${pkr(challan.discount)}`]);
  if (challan.waiver   > 0) rows.push(['Waiver',   `- ${pkr(challan.waiver)}`]);
  if (challan.paidAmount > 0) rows.push(['Paid',   `- ${pkr(challan.paidAmount)}`]);
  const balance = Math.max(0, challan.netAmount - challan.paidAmount);

  rows.forEach(([lbl, val]) => {
    doc.setFillColor(240, 244, 248);
    doc.rect(m, y, cw, 7, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(lbl, c1, y + 5);
    doc.text(val, W - m - 4, y + 5, { align: 'right' });
    y += 7;
  });

  // NET PAYABLE row
  doc.setFillColor(...PRIMARY);
  doc.rect(m, y, cw, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('NET PAYABLE', c1, y + 7);
  doc.text(pkr(balance), W - m - 4, y + 7, { align: 'right' });
  y += 14;

  // ── Due date + status bar ───────────────────────────────
  doc.setFillColor(255, 249, 230);
  doc.rect(m, y, cw, 10, 'F');
  doc.setDrawColor(245, 210, 90);
  doc.rect(m, y, cw, 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(140, 70, 0);
  doc.text(`Due Date: ${fmtDate(challan.dueDate)}`, c1, y + 7);

  const STATUS_COLORS: Record<string, [number, number, number]> = {
    paid: [16, 185, 129], unpaid: [239, 68, 68],
    partial: [245, 158, 11], overdue: [220, 38, 38], waived: [59, 130, 246],
  };
  const sc = STATUS_COLORS[challan.status] ?? [100, 100, 100];
  doc.setTextColor(...sc);
  doc.text(challan.status.toUpperCase(), W - m - 4, y + 7, { align: 'right' });
  y += 14;

  return y;
}

export function downloadChallanPdf(challan: ChallanDoc, orgName: string): void {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  const W   = doc.internal.pageSize.getWidth();
  const H   = doc.internal.pageSize.getHeight();
  const m   = 14;

  let y = 12;
  y = drawCopy(doc, challan, orgName, 'SCHOOL COPY', y);

  // Scissor separator
  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([3, 2], 0);
  doc.line(m, y, W - m, y);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(160, 160, 160);
  doc.text('✂  Cut here', W / 2, y + 3, { align: 'center' });
  doc.setLineDashPattern([], 0);
  y += 8;

  if (y + 110 > H) { doc.addPage(); y = 12; }
  drawCopy(doc, challan, orgName, 'STUDENT COPY', y);

  // Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(190, 190, 190);
  doc.text('Generated by EduStack PK — WolfStack', W / 2, H - 5, { align: 'center' });

  doc.save(`challan_${challan.challanNo}.pdf`);
}
