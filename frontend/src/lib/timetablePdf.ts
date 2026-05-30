import jsPDF from 'jspdf';
import type { TimetableDoc, TimetableSlot } from '../services/timetableService';

const PRIMARY: [number, number, number] = [30, 58, 95];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function slotSubject(slot: TimetableSlot): string {
  return typeof slot.subjectId === 'object' ? slot.subjectId.name : '—';
}
function slotTeacher(slot: TimetableSlot): string {
  return typeof slot.teacherId === 'object' ? slot.teacherId.name : '';
}

export function downloadTimetablePdf(opts: {
  timetable: TimetableDoc;
  orgName: string;
  className?: string;
  sectionName?: string;
  teacherName?: string;
}): void {
  const { timetable, orgName, className, sectionName, teacherName } = opts;

  const doc = new jsPDF('landscape', 'mm', 'a4');
  const W   = doc.internal.pageSize.getWidth();
  const H   = doc.internal.pageSize.getHeight();
  const m   = 12;
  const cw  = W - m * 2;
  let y     = 10;

  const periods = timetable.slots.length > 0
    ? Math.max(...timetable.slots.map(s => s.periodNo))
    : 8;
  const activeDays = [...new Set(timetable.slots.map(s => s.dayOfWeek))].sort();
  const days = activeDays.length > 0 ? activeDays : [1, 2, 3, 4, 5];

  const subtitle = teacherName
    ? `Teacher Schedule — ${teacherName}`
    : [className, sectionName ? `Section ${sectionName}` : ''].filter(Boolean).join(' — ');

  // ── Header ─────────────────────────────────────────────
  doc.setFillColor(...PRIMARY);
  doc.rect(m, y, cw, 22, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(orgName, m + 6, y + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(200, 215, 240);
  doc.text('CLASS TIMETABLE', m + 6, y + 17);
  if (subtitle) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(subtitle, W - m - 6, y + 10, { align: 'right' });
  }
  y += 26;

  // ── Grid ──────────────────────────────────────────────
  const labelColW = 14;
  const colW = (cw - labelColW) / periods;
  const rowH = (H - y - 18) / (days.length + 1); // +1 for header row

  // Period header row
  doc.setFillColor(245, 247, 250);
  doc.rect(m, y, cw, rowH, 'F');
  doc.setDrawColor(210, 215, 225);
  doc.rect(m, y, labelColW, rowH);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 110, 130);
  doc.text('Day', m + labelColW / 2, y + rowH / 2 + 2, { align: 'center' });

  for (let p = 1; p <= periods; p++) {
    const cx = m + labelColW + (p - 1) * colW;
    doc.setFillColor(245, 247, 250);
    doc.rect(cx, y, colW, rowH, 'F');
    doc.setDrawColor(210, 215, 225);
    doc.rect(cx, y, colW, rowH);

    const timing = timetable.periodTimings?.find(t => t.periodNo === p);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...PRIMARY);
    doc.text(`P${p}`, cx + colW / 2, y + rowH / 2, { align: 'center' });
    if (timing) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(130, 140, 155);
      doc.text(`${timing.startTime}–${timing.endTime}`, cx + colW / 2, y + rowH / 2 + 4, { align: 'center' });
    }
  }
  y += rowH;

  // Day rows
  days.forEach((dayNum, di) => {
    const dayName = DAYS[dayNum - 1] ?? `Day ${dayNum}`;
    const rowBg: [number, number, number] = di % 2 === 0 ? [255, 255, 255] : [249, 251, 253];

    // Day label cell
    doc.setFillColor(235, 240, 250);
    doc.rect(m, y, labelColW, rowH, 'F');
    doc.setDrawColor(210, 215, 225);
    doc.rect(m, y, labelColW, rowH);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...PRIMARY);

    // Rotate-style: short day name centered
    doc.text(dayName.slice(0, 3).toUpperCase(), m + labelColW / 2, y + rowH / 2 + 2, { align: 'center' });

    // Period cells
    for (let p = 1; p <= periods; p++) {
      const cx = m + labelColW + (p - 1) * colW;
      const slot = timetable.slots.find(s => s.dayOfWeek === dayNum && s.periodNo === p);

      doc.setFillColor(...rowBg);
      doc.rect(cx, y, colW, rowH, 'F');
      doc.setDrawColor(210, 215, 225);
      doc.rect(cx, y, colW, rowH);

      if (slot) {
        const sub = slotSubject(slot);
        const teacher = slotTeacher(slot);
        const room = slot.roomNo;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(30, 50, 80);
        const subLine = doc.splitTextToSize(sub, colW - 3);
        doc.text(subLine[0], cx + colW / 2, y + rowH * 0.38, { align: 'center' });

        if (teacher && !teacherName) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(5.5);
          doc.setTextColor(100, 115, 135);
          doc.text(teacher.split(' ')[0], cx + colW / 2, y + rowH * 0.62, { align: 'center' });
        }

        if (room) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(5);
          doc.setTextColor(150, 160, 175);
          doc.text(`Rm ${room}`, cx + colW / 2, y + rowH * 0.82, { align: 'center' });
        }
      }
    }
    y += rowH;
  });

  // ── Footer ──────────────────────────────────────────────
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(190, 190, 190);
  doc.text('Generated by EduStack PK — WolfStack', W / 2, H - 5, { align: 'center' });

  const safeName = (subtitle || 'timetable').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
  doc.save(`timetable_${safeName}.pdf`);
}
