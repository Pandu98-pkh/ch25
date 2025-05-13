import { format, parseISO } from 'date-fns';
import { CounselingSession } from '../types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generateSessionReport = (sessions: CounselingSession[]) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('Counseling Sessions Report', 14, 22);
  
  // Add date
  doc.setFontSize(11);
  doc.text(`Generated on ${format(new Date(), 'PPP')}`, 14, 30);
  
  // Add summary information
  doc.setFontSize(14);
  doc.text('Summary', 14, 40);
  
  doc.setFontSize(10);
  doc.text(`Total Sessions: ${sessions.length}`, 14, 48);
  
  // Calculate total duration
  const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0);
  doc.text(`Total Duration: ${totalDuration} minutes`, 14, 54);
  
  // Calculate sessions by type
  const typeGroups = sessions.reduce((acc, session) => {
    acc[session.type] = (acc[session.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  doc.text('Sessions by Type:', 14, 60);
  let yPos = 66;
  Object.entries(typeGroups).forEach(([type, count]) => {
    doc.text(`- ${type}: ${count}`, 20, yPos);
    yPos += 6;
  });
  
  // Create table of sessions
  const tableData = sessions.map(session => [
    format(parseISO(session.date), 'PPP'),
    format(parseISO(session.date), 'p'),
    session.studentId,
    session.type,
    session.duration + ' min',
    session.outcome
  ]);
  
  doc.autoTable({
    startY: yPos + 10,
    head: [['Date', 'Time', 'Student ID', 'Type', 'Duration', 'Outcome']],
    body: tableData,
    headStyles: { fillColor: [41, 128, 185] },
    alternateRowStyles: { fillColor: [240, 240, 240] }
  });
  
  // Save the PDF
  doc.save(`counseling-sessions-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
