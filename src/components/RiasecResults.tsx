import { useState, useRef } from 'react';
import { 
  Download, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle, 
  Briefcase, 
  DollarSign, 
  TrendingUp,
  Share2,
  FileText,
  BarChart2
} from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../utils/cn';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { RiasecResult, RiasecCategory, RecommendedCareer } from './RiasecAssessment';

// Props interface
interface RiasecResultsProps {
  result: RiasecResult;
  onStartNewAssessment: () => void;
}

// Color mapping for categories with improved colors
const categoryColors = {
  realistic: '#3b82f6', // blue
  investigative: '#8b5cf6', // purple
  artistic: '#ec4899', // pink
  social: '#10b981', // emerald
  enterprising: '#f59e0b', // amber
  conventional: '#6366f1', // indigo
};

// Label mapping for categories
const getCategoryLabel = (category: RiasecCategory, t: (key: string, fallback?: string) => string): string => {
  const labels: Record<RiasecCategory, string> = {
    realistic: t(`riasec.categories.${category}`, 'Realistic'),
    investigative: t(`riasec.categories.${category}`, 'Investigative'),
    artistic: t(`riasec.categories.${category}`, 'Artistic'),
    social: t(`riasec.categories.${category}`, 'Social'),
    enterprising: t(`riasec.categories.${category}`, 'Enterprising'),
    conventional: t(`riasec.categories.${category}`, 'Conventional'),
  };
  return labels[category];
};

// Category description mapping
const getCategoryDescription = (category: RiasecCategory, t: (key: string, fallback?: string) => string): string => {
  const descriptions: Record<RiasecCategory, string> = {
    realistic: t(`riasec.descriptions.${category}`, 'Anda menikmati pekerjaan praktis dan hands-on. Anda lebih memilih bekerja dengan benda, mesin, peralatan, tanaman, atau hewan.'),
    investigative: t(`riasec.descriptions.${category}`, 'Anda menikmati memecahkan masalah dan menemukan jawaban. Anda tertarik pada karir ilmiah atau penelitian.'),
    artistic: t(`riasec.descriptions.${category}`, 'Anda menikmati ekspresi kreatif, dan pekerjaan yang memungkinkan anda menggunakan imajinasi dan orisinalitas.'),
    social: t(`riasec.descriptions.${category}`, 'Anda menikmati bekerja dengan orang dan membantu orang lain. Anda suka mengajar, memberikan saran, atau membantu.'),
    enterprising: t(`riasec.descriptions.${category}`, 'Anda menikmati memimpin, memengaruhi, dan meyakinkan orang lain. Anda tertarik pada bisnis dan kepemimpinan.'),
    conventional: t(`riasec.descriptions.${category}`, 'Anda menikmati bekerja dengan data, detail, dan tugas terstruktur. Anda menyukai keteraturan dan kejelasan.'),
  };
  return descriptions[category];
};

const RiasecResults = ({ result, onStartNewAssessment }: RiasecResultsProps) => {
  const { t } = useLanguage();
  const [currentTab, setCurrentTab] = useState<'overview' | 'careers'>('overview');
  const [isDownloading, setIsDownloading] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Format currency for salary
  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'IDR') {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
  };
  
  // Helper function to get a displayable date from ISO string
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (e) {
      return dateString;
    }
  };
  
  // Download PDF functionality
  const handleDownloadPDF = () => {
    try {
      setIsDownloading(true);
      
      // Initialize jsPDF with professional settings
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 15;
      let yPos = 30; // Starting Y position
      
      // Add professional header with gradient effect
      // Top gradient bar
      doc.setFillColor(79, 70, 229); // brand-600 color
      doc.rect(0, 0, pageWidth, 15, 'F');
      
      // Bottom thin line for a professional look
      doc.setFillColor(99, 102, 241); // brand-500 color
      doc.rect(0, 15, pageWidth, 2, 'F');
      
      // Add professional logo/icon in corner
      doc.setFillColor(255, 255, 255);
      doc.circle(margin + 5, 10, 6, 'F');
      doc.setFont("helvetica", "bold");
      doc.setTextColor(79, 70, 229);
      doc.setFontSize(10);
      doc.text("R", margin + 3, 12);
      
      // Add document title with professional typography
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text(t('riasec.results.title', 'Hasil Penilaian RIASEC'), margin + 15, 10);
      
      // Reset text color for the rest of the document
      doc.setTextColor(30, 41, 59); // slate-800 for better readability
      
      // Add document info section
      yPos = 30;
      doc.setFillColor(243, 244, 246); // gray-100
      doc.roundedRect(margin, yPos - 10, pageWidth - (2 * margin), 25, 3, 3, 'F');
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text(`${t('riasec.results.completedOn', 'Selesai pada')}:`, margin + 5, yPos);
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text(formatDate(result.timestamp), margin + 50, yPos);
      
      // Add RIASEC code in a prominent location
      const riasecCode = result.topCategories.map(c => getCategoryLabel(c, t).charAt(0)).join('');
      doc.setFillColor(219, 234, 254); // blue-100
      doc.roundedRect(pageWidth - margin - 40, yPos - 8, 35, 20, 3, 3, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(37, 99, 235); // blue-600
      doc.text(`${t('riasec.results.code', 'Kode')}:`, pageWidth - margin - 35, yPos - 2);
      doc.setFontSize(14);
      doc.text(riasecCode, pageWidth - margin - 35, yPos + 7);
      
      // Add a professional section divider
      yPos += 25;
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      
      // Add top categories section with professional styling
      yPos += 15;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text(t('riasec.results.topCategories', 'Kategori Teratas Anda'), margin, yPos);
      
      // Add a subtle separator line below the heading
      doc.setDrawColor(79, 70, 229); // brand-600
      doc.setLineWidth(0.5);
      doc.line(margin, yPos + 5, margin + 60, yPos + 5);
      
      // Create table data for top categories with professional styling
      const categoriesData = result.topCategories.map((category, index) => [
        `${index + 1}`,
        getCategoryLabel(category, t),
        `${result[category]}%`
      ]);
      
      // Add table for top categories with improved professional styling
      yPos += 10;
      autoTable(doc, {
        startY: yPos,
        head: [['#', t('riasec.category', 'Kategori'), t('riasec.results.score', 'Skor')]],
        body: categoriesData,
        theme: 'grid',
        headStyles: { 
          fillColor: [79, 70, 229], // brand-600
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 11,
          halign: 'left',
          cellPadding: 6
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
          lineColor: [226, 232, 240], // slate-200
          lineWidth: 0.2,
          font: 'helvetica'
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10, fontStyle: 'bold' },
          1: { cellWidth: 'auto', fontStyle: 'normal' },
          2: { halign: 'center', cellWidth: 20, fontStyle: 'bold', fillColor: [243, 244, 246] }
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251] // very light gray for alternating rows
        },
        margin: { left: margin, right: margin },
        tableWidth: pageWidth - (2 * margin),
        didParseCell: function(data) {
          // Add color to score column based on value
          if (data.section === 'body' && data.column.index === 2) {
            const scoreText = Array.isArray(data.cell.text) ? data.cell.text[0] : data.cell.text as string;
            const scoreValue = parseInt(scoreText);
            
            if (!isNaN(scoreValue)) {
              if (scoreValue >= 80) {
                data.cell.styles.textColor = [22, 163, 74]; // green-600
              } else if (scoreValue >= 60) {
                data.cell.styles.textColor = [37, 99, 235]; // blue-600
              } else if (scoreValue >= 40) {
                data.cell.styles.textColor = [202, 138, 4]; // yellow-600
              } else {
                data.cell.styles.textColor = [220, 38, 38]; // red-600
              }
            }
          }
        }
      });
      
      // Get the current Y position after the table
      yPos = (doc as any).lastAutoTable.finalY + 20;
      
      // Add chart/visualization
      yPos += 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text(t('riasec.results.profileVisualization', 'Visualisasi Profil RIASEC'), margin, yPos);
      
      // Add a subtle separator line below the heading
      doc.setDrawColor(79, 70, 229); // brand-600
      doc.setLineWidth(0.5);
      doc.line(margin, yPos + 5, margin + 70, yPos + 5);
      
      // Create a simple radar chart visualization for the PDF
      yPos += 15;
      
      const centerX = pageWidth / 2;
      const centerY = yPos + 50;
      const radius = 40;
      
      // Draw radar chart background
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.2);
      
      // Draw concentric circles
      [0.25, 0.5, 0.75, 1].forEach(scale => {
        doc.circle(centerX, centerY, radius * scale, 'S');
      });
      
      // Draw category axis lines and labels
      const categories = Object.keys(result).filter(key => 
        ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'].includes(key)
      ) as RiasecCategory[];
      
      const categoryValues = categories.map(cat => result[cat]);
      const angleStep = (2 * Math.PI) / categories.length;
      
      // Draw axis lines
      categories.forEach((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const endX = centerX + radius * Math.cos(angle);
        const endY = centerY + radius * Math.sin(angle);
        doc.line(centerX, centerY, endX, endY);
      });
      
      // Plot data points and create polygon
      const points = categories.map((category, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const value = result[category] / 100; // Normalize to 0-1
        return {
          x: centerX + radius * value * Math.cos(angle),
          y: centerY + radius * value * Math.sin(angle),
          category
        };
      });
      
      // Draw data polygon - use a lighter color instead of opacity
      doc.setDrawColor(79, 70, 229); // brand-600
      doc.setLineWidth(1.5);
      doc.setFillColor(235, 233, 254); // Very light purple (brand-100) instead of transparent brand-600
      
      doc.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        doc.lineTo(points[i].x, points[i].y);
      }
      doc.lineTo(points[0].x, points[0].y);
      doc.fill();
      
      // Draw data points - no need to reset opacity since we're not using it
      points.forEach(point => {
        doc.setFillColor(79, 70, 229); // brand-600
        doc.circle(point.x, point.y, 2, 'F');
        doc.setFillColor(255, 255, 255);
        doc.circle(point.x, point.y, 1, 'F');
      });
      
      // Add category labels
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105); // slate-600
      
      categories.forEach((category, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const labelRadius = radius + 15;
        const x = centerX + labelRadius * Math.cos(angle);
        const y = centerY + labelRadius * Math.sin(angle);
        
        // Adjust text alignment based on position
        if (angle > -Math.PI/4 && angle < Math.PI/4) {
          doc.text(getCategoryLabel(category, t), x, y, { align: 'center' });
        } else if (angle >= Math.PI/4 && angle < 3*Math.PI/4) {
          doc.text(getCategoryLabel(category, t), x, y, { align: 'left' });
        } else if ((angle >= 3*Math.PI/4 && angle <= Math.PI) || (angle <= -3*Math.PI/4 && angle >= -Math.PI)) {
          doc.text(getCategoryLabel(category, t), x, y, { align: 'center' });
        } else {
          doc.text(getCategoryLabel(category, t), x, y, { align: 'right' });
        }
      });
      
      // Add recommended careers
      yPos = centerY + radius + 30;
      
      // Check if we need a page break
      if (yPos > pageHeight - 70) {
        doc.addPage();
        yPos = 30;
        
        // Add header to the new page
        doc.setFillColor(79, 70, 229);
        doc.rect(0, 0, pageWidth, 15, 'F');
        doc.setFillColor(99, 102, 241);
        doc.rect(0, 15, pageWidth, 2, 'F');
      }
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text(t('riasec.results.recommendedCareers', 'Karir yang Direkomendasikan'), margin, yPos);
      
      // Add a subtle separator line below the heading
      doc.setDrawColor(79, 70, 229); // brand-600
      doc.setLineWidth(0.5);
      doc.line(margin, yPos + 5, margin + 75, yPos + 5);
      
      // Create table data for recommended careers
      const careersData = result.recommendedCareers.slice(0, 5).map(career => [
        career.title,
        `${career.match}%`,
        career.categories.map(c => getCategoryLabel(c, t).charAt(0)).join(''),
        career.educationRequired
      ]);
      
      // Add table for recommended careers with improved styling
      yPos += 10;
      autoTable(doc, {
        startY: yPos,
        head: [[
          t('career.title', 'Judul'), 
          t('riasec.results.match', 'Kecocokan'), 
          t('riasec.results.code', 'Kode'),
          t('riasec.results.education', 'Pendidikan')
        ]],
        body: careersData,
        theme: 'grid',
        headStyles: { 
          fillColor: [79, 70, 229], // brand-600
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9.5,
          halign: 'center',
          cellPadding: 4,
          minCellHeight: 14,
          valign: 'middle',
          overflow: 'ellipsize'
        },
        styles: {
          fontSize: 9,
          cellPadding: 5,
          overflow: 'linebreak',
          font: 'helvetica',
          lineColor: [226, 232, 240], // slate-200
          lineWidth: 0.2
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251] // gray-50
        },
        columnStyles: {
          0: { cellWidth: 55, fontStyle: 'bold' },
          1: { halign: 'center', cellWidth: 20, fontStyle: 'bold' },
          2: { halign: 'center', cellWidth: 15, fontStyle: 'bold' },
          3: { cellWidth: 30, fontStyle: 'normal' }
        },
        margin: { left: margin, right: margin },
        tableWidth: pageWidth - (2 * margin),
        showHead: 'firstPage',
        didParseCell: function(data) {
          // Make sure headers are in a single line
          if (data.section === 'head') {
            data.cell.styles.overflow = 'ellipsize';
            data.cell.styles.cellWidth = 'wrap';
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.minCellHeight = 14;
          }
          
          // Add colors for match percentage
          if (data.section === 'body' && data.column.index === 1) {
            const matchText = Array.isArray(data.cell.text) ? data.cell.text[0] : data.cell.text as string;
            const matchValue = parseInt(matchText);
            
            if (!isNaN(matchValue)) {
              if (matchValue >= 90) {
                data.cell.styles.textColor = [22, 163, 74]; // green-600
                data.cell.styles.fillColor = [240, 253, 244]; // green-50
              } else if (matchValue >= 70) {
                data.cell.styles.textColor = [37, 99, 235]; // blue-600
                data.cell.styles.fillColor = [239, 246, 255]; // blue-50
              } else {
                data.cell.styles.textColor = [217, 119, 6]; // amber-600
                data.cell.styles.fillColor = [254, 252, 232]; // yellow-50
              }
            }
          }
        },
        willDrawCell: function(data) {
          // Ensure minimum row height for content
          if (data.section === 'body') {
            data.row.height = Math.max(data.row.height, 9);
          }
        }
      });
      
      // Get the current Y position after the careers table
      yPos = (doc as any).lastAutoTable.finalY + 20;
      
      // Check if we need a page break for the explanation section
      if (yPos > pageHeight - 70) {
        doc.addPage();
        yPos = 30;
        
        // Add header to the new page
        doc.setFillColor(79, 70, 229);
        doc.rect(0, 0, pageWidth, 15, 'F');
        doc.setFillColor(99, 102, 241);
        doc.rect(0, 15, pageWidth, 2, 'F');
      }
      
      // Add explanation section with elegant styling
      doc.setFillColor(243, 244, 246); // gray-100
      doc.roundedRect(margin, yPos, pageWidth - (2 * margin), 40, 3, 3, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text(t('riasec.results.whatThisMeans', 'Apa Artinya Ini?'), margin + 10, yPos + 10);
      
      // Create explanation text
      const explanation = `${t('riasec.results.profileExplanation', 'Profil RIASEC Anda menunjukkan kategori minat dan preferensi Anda yang dominan. Kode RIASEC tiga huruf teratas Anda adalah ')}${result.topCategories.map(c => getCategoryLabel(c, t).charAt(0)).join('')}${t('riasec.results.profileExplanation2', '. Kode ini dapat membantu Anda mengidentifikasi karir yang sesuai dengan preferensi dan minat Anda.')}`;
      
      // Split text into multiple lines for better formatting
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105); // slate-600
      const splitText = doc.splitTextToSize(explanation, pageWidth - (2 * margin) - 20);
      doc.text(splitText, margin + 10, yPos + 20);
      
      // Add professional footer on each page
      const addFooter = (pageNum: number, totalPages: number) => {
        // Horizontal line
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setLineWidth(0.5);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        
        // Date generated
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text(`${t('riasec.results.generatedOn', 'Dibuat pada')}: ${new Date().toLocaleString()}`, margin, pageHeight - 8);
        
        // Page numbers
        doc.text(`${pageNum} / ${totalPages}`, pageWidth - margin - 10, pageHeight - 8, { align: 'right' });
      };
      
      // Add footer to all pages
      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        addFooter(i, pageCount);
      }
      
      // Save the PDF with a professional name format
      const dateStr = new Date().toISOString().split('T')[0];
      const userName = 'Report'; // In a real app, this could be the user's name
      doc.save(`RIASEC_${userName}_${dateStr}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Share functionality
  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };
  
  // Copy results as text
  const copyResultsToClipboard = () => {
    const text = `
RIASEC Assessment Results:
Date: ${formatDate(result.timestamp)}

Top Categories:
${result.topCategories.map((category, idx) => 
  `${idx + 1}. ${getCategoryLabel(category, t)}: ${result[category]}%`
).join('\n')}

Recommended Careers:
${result.recommendedCareers.slice(0, 5).map(career => 
  `- ${career.title} (${career.match}% match)`
).join('\n')}

My RIASEC Code: ${result.topCategories.map(c => getCategoryLabel(c, t).charAt(0)).join('')}
    `;
    
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopySuccess(t('riasec.results.copied', 'Berhasil disalin!'));
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(err => {
        console.error('Error copying text: ', err);
      });
  };
  
  // Native share if available
  const nativeShare = () => {
    if (typeof navigator.share === 'function') {
      navigator.share({
        title: t('riasec.results.title', 'Hasil Penilaian RIASEC'),
        text: `Hasil penilaian RIASEC saya: ${result.topCategories.map(c => getCategoryLabel(c, t).charAt(0)).join('')}. Karir terbaik untuk saya: ${result.recommendedCareers[0]?.title}.`,
      })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
    }
  };
  
  // Create data for radar chart
  const radarChartData = {
    labels: Object.keys(result).filter(key => 
      ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'].includes(key)
    ) as RiasecCategory[],
    values: Object.entries(result)
      .filter(([key]) => ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'].includes(key))
      .map(([_, value]) => value as number)
  };
  
  // Render improved SVG radar chart
  const renderRadarChart = () => {
    const centerX = 150;
    const centerY = 150;
    const radius = 100;
    const angleStep = (2 * Math.PI) / radarChartData.labels.length;
    
    // Generate points for the polygon
    const points = radarChartData.labels.map((label, i) => {
      const angle = i * angleStep - Math.PI / 2; // Start from top
      const value = radarChartData.values[i] / 100; // Normalize to 0-1
      return {
        x: centerX + radius * value * Math.cos(angle),
        y: centerY + radius * value * Math.sin(angle),
        label,
        value: radarChartData.values[i]
      };
    });
    
    // Create polygon points string
    const polygonPoints = points.map(point => `${point.x},${point.y}`).join(' ');
    
    return (
      <svg width="400" height="300" viewBox="0 0 300 300" className="mx-auto drop-shadow-md">
        {/* Background gradient */}
        <defs>
          <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#f9fafb" />
            <stop offset="100%" stopColor="#f3f4f6" />
          </radialGradient>
          <linearGradient id="polygonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(79, 70, 229, 0.3)" />
            <stop offset="100%" stopColor="rgba(79, 70, 229, 0.1)" />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle cx={centerX} cy={centerY} r={radius} fill="url(#radarGradient)" stroke="#e5e7eb" strokeWidth="1" />
        
        {/* Background circles */}
        {[0.2, 0.4, 0.6, 0.8].map((scale, i) => (
          <circle 
            key={i}
            cx={centerX}
            cy={centerY}
            r={radius * scale}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        ))}
        
        {/* Axis lines */}
        {radarChartData.labels.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const endX = centerX + radius * Math.cos(angle);
          const endY = centerY + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={endX}
              y2={endY}
              stroke="#d1d5db"
              strokeWidth="1"
            />
          );
        })}
        
        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill="url(#polygonGradient)"
          stroke="#4f46e5"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {points.map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="white"
              stroke="#4f46e5"
              strokeWidth="2"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="2"
              fill="#4f46e5"
            />
          </g>
        ))}
        
        {/* Labels with backgrounds */}
        {radarChartData.labels.map((label, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelRadius = radius + 25; // Position labels slightly outside the chart
          const x = centerX + labelRadius * Math.cos(angle);
          const y = centerY + labelRadius * Math.sin(angle);
          
          // Adjust text-anchor based on position
          let textAnchor = "middle";
          if (x < centerX - radius * 0.5) textAnchor = "end";
          if (x > centerX + radius * 0.5) textAnchor = "start";
          
          const categoryLabel = getCategoryLabel(label, t);
          
          return (
            <g key={i}>
              <rect
                x={textAnchor === "end" ? x - 85 : textAnchor === "start" ? x : x - 42.5}
                y={y - 16}
                width="85"
                height="22"
                rx="11"
                ry="11"
                fill="white"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={x}
                y={y}
                textAnchor={textAnchor}
                fontSize="11"
                fontWeight="bold"
                fill={categoryColors[label]}
                dominantBaseline="middle"
              >
                {categoryLabel}
              </text>
            </g>
          );
        })}
        
        {/* Score labels near each point */}
        {points.map((point, i) => {
          // Position score labels just outside the polygon points
          const angle = i * angleStep - Math.PI / 2;
          const scoreRadius = radius * (point.value / 100) + 15;
          const x = centerX + scoreRadius * Math.cos(angle);
          const y = centerY + scoreRadius * Math.sin(angle);
          
          return (
            <g key={`score-${i}`}>
              <rect
                x={x - 16}
                y={y - 11}
                width="32"
                height="22"
                rx="11"
                ry="11"
                fill={categoryColors[point.label]}
                opacity="0.8"
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                fontSize="11"
                fontWeight="bold"
                fill="white"
                dominantBaseline="middle"
              >
                {point.value}%
              </text>
            </g>
          );
        })}
      </svg>
    );
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden w-full" ref={resultsRef}>
      <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-gray-50 to-white">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('riasec.results.title', 'Hasil Penilaian RIASEC')}</h2>
          <p className="text-base text-gray-600">
            {t('riasec.results.completedOn', 'Selesai pada')}: {formatDate(result.timestamp)}
          </p>
        </div>
        
        <div className="flex items-center space-x-4 self-end sm:self-auto">
          <div className="relative">
            <button 
              onClick={handleShare}
              className="inline-flex items-center px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              <Share2 className="h-4 w-4 mr-2" />
              {t('riasec.results.share', 'Bagikan')}
            </button>
            
            {showShareOptions && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 border border-gray-100 overflow-hidden">
                <div className="py-2 divide-y divide-gray-100" role="menu" aria-orientation="vertical">
                  {typeof navigator.share === 'function' && (
                    <button
                      onClick={nativeShare}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      role="menuitem"
                    >
                      <Share2 className="h-4 w-4 mr-3 text-gray-500" />
                      {t('riasec.results.nativeShare', 'Bagikan...')}
                    </button>
                  )}
                  <button
                    onClick={copyResultsToClipboard}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    role="menuitem"
                  >
                    <FileText className="h-4 w-4 mr-3 text-gray-500" />
                    {t('riasec.results.copyToClipboard', 'Salin ke clipboard')}
                  </button>
                </div>
                {copySuccess && (
                  <div className="px-4 py-3 text-sm text-green-700 bg-green-50 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    {copySuccess}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button 
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className={cn(
              "inline-flex items-center px-4 py-2 border-2 rounded-xl text-sm font-medium transition-colors duration-200",
              isDownloading
                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-brand-200 text-brand-700 bg-brand-50 hover:bg-brand-100 hover:border-brand-300"
            )}
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('riasec.results.downloading', 'Mengunduh...')}
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                {t('riasec.results.download', 'Unduh PDF')}
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="px-6 pt-4 border-b border-gray-200 bg-white">
        <nav className="flex -mb-px space-x-8" aria-label="Tabs">
          {['overview', 'careers'].map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab as any)}
              className={cn(
                'py-4 px-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors duration-200',
                currentTab === tab
                  ? 'border-brand-500 text-brand-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab === 'overview' ? (
                <div className="flex items-center">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  {t(`riasec.results.tabs.${tab}`, 'Ringkasan')}
                </div>
              ) : (
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  {t(`riasec.results.tabs.${tab}`, 'Karir Sesuai')}
                </div>
              )}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Overview Tab */}
      {currentTab === 'overview' && (
        <div className="p-6 bg-gray-50">
          <div className="mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-5 flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-brand-600" />
              {t('riasec.results.yourProfile', 'Profil RIASEC Anda')}
            </h3>
            
            {/* Radar Chart */}
            <div className="mb-6 p-4 bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex justify-center">
                {renderRadarChart()}
              </div>
            </div>
            
            {/* Top Categories */}
            <div className="mt-6">
              <h4 className="text-base font-semibold text-gray-900 mb-4 border-l-4 border-brand-500 pl-3">
                {t('riasec.results.topCategories', 'Kategori Teratas Anda')}
              </h4>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {result.topCategories.map((category, index) => (
                  <div key={category} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-brand-200 transition-all duration-200">
                    <div className="flex items-center mb-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 shadow-sm"
                        style={{ backgroundColor: `${categoryColors[category]}`, color: "white" }}  
                      >
                        <span className="text-xl font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h5 className="text-lg font-semibold text-gray-900">
                          {getCategoryLabel(category, t)}
                        </h5>
                        <div className="flex items-center mt-2">
                          <div className="w-full h-2.5 bg-gray-100 rounded-full mr-3">
                            <div 
                              className="h-2.5 rounded-full" 
                              style={{ 
                                width: `${result[category]}%`,
                                backgroundColor: categoryColors[category],
                                backgroundImage: `linear-gradient(90deg, ${categoryColors[category]}aa, ${categoryColors[category]})`
                              }}
                            ></div>
                          </div>
                          <span 
                            className="text-sm font-semibold px-2.5 py-1 rounded-lg" 
                            style={{ 
                              backgroundColor: `${categoryColors[category]}20`,
                              color: categoryColors[category] 
                            }}
                          >
                            {result[category]}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 border-l-4 pl-3 py-2" style={{ borderColor: `${categoryColors[category]}40` }}>
                      {getCategoryDescription(category, t)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* What this means */}
            <div className="mt-6 bg-gradient-to-r from-brand-50 to-indigo-50 rounded-xl p-5 border border-brand-100">
              <h4 className="text-base font-semibold text-brand-800 mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-brand-600" />
                {t('riasec.results.whatThisMeans', 'Apa Artinya Ini?')}
              </h4>
              <p className="text-brand-700">
                {t('riasec.results.profileExplanation', 'Profil RIASEC Anda menunjukkan kategori minat dan preferensi Anda yang dominan. Kode RIASEC tiga huruf teratas Anda adalah ')}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-white font-semibold bg-brand-600 mx-1">
                  {result.topCategories.map(c => getCategoryLabel(c, t).charAt(0)).join('')}
                </span>
                {t('riasec.results.profileExplanation2', '. Kode ini dapat membantu Anda mengidentifikasi karir yang sesuai dengan preferensi dan minat Anda.')}
              </p>
            </div>
            
            {/* Next steps */}
            <div className="mt-6 p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                <ChevronRight className="h-5 w-5 mr-2 text-brand-600" />
                {t('riasec.results.nextSteps', 'Langkah Selanjutnya')}
              </h4>
              <div className="space-y-4">
                <div className="flex items-start p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200">
                  <div className="p-1 bg-green-100 rounded-lg mr-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-gray-700">
                    {t('riasec.results.exploreTab', 'Jelajahi tab "Karir Sesuai" untuk melihat karir yang paling cocok dengan profil Anda')}
                  </p>
                </div>
                <div className="flex items-start p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200">
                  <div className="p-1 bg-green-100 rounded-lg mr-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-gray-700">
                    {t('riasec.results.researchCareers', 'Lakukan riset lebih dalam tentang karir yang menarik bagi Anda')}
                  </p>
                </div>
                <div className="flex items-start p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200">
                  <div className="p-1 bg-green-100 rounded-lg mr-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-gray-700">
                    {t('riasec.results.connectCounselor', 'Hubungi konselor karir untuk diskusi lebih lanjut tentang pilihan Anda')}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button 
              onClick={() => setCurrentTab('careers')}
              className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 shadow-sm transition-all duration-200"
            >
              {t('riasec.results.viewCareers', 'Lihat Karir yang Direkomendasikan')}
              <ChevronRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      
      {/* Careers Tab */}
      {currentTab === 'careers' && (
        <div className="p-6 bg-gray-50">
          <div className="mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-brand-600" />
              {t('riasec.results.recommendedCareers', 'Karir yang Direkomendasikan')}
            </h3>
            <p className="text-gray-600 mb-2 border-l-4 border-brand-200 pl-3 py-1">
              {t('riasec.results.basedOnProfile', 'Berdasarkan profil RIASEC Anda: ')}
              <span className="inline-flex items-center px-3 py-1 rounded-full text-white font-semibold bg-brand-600 text-sm ml-1">
                {result.topCategories.map(c => getCategoryLabel(c, t).charAt(0)).join('')}
              </span>
            </p>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {result.recommendedCareers.map((career: RecommendedCareer, index) => (
              <div 
                key={career.title}
                className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:border-brand-200 hover:shadow-md transition-all duration-200"
              >
                <div className="sm:flex sm:items-start sm:justify-between">
                  <div className="mb-5 sm:mb-0 sm:mr-4 flex-1">
                    <div className="flex items-center mb-3">
                      <div className="flex-shrink-0 mr-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" 
                          style={{ 
                            backgroundColor: career.match >= 90 ? '#4ade80' : career.match >= 70 ? '#facc15' : '#f87171',
                            color: career.match >= 90 ? '#166534' : career.match >= 70 ? '#854d0e' : '#7f1d1d'
                          }}
                        >
                          <span className="text-lg font-bold">{index + 1}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900">{career.title}</h4>
                        <div className="flex items-center mt-1.5">
                          <div 
                            className="px-3 py-1 rounded-lg text-sm font-semibold mr-3"
                            style={{ 
                              backgroundColor: career.match >= 90 ? '#dcfce7' : career.match >= 70 ? '#fef9c3' : '#fee2e2',
                              color: career.match >= 90 ? '#166534' : career.match >= 70 ? '#854d0e' : '#7f1d1d'
                            }}
                          >
                            {career.match}% {t('riasec.results.match', 'cocok')}
                          </div>
                          <div className="flex items-center">
                            {career.categories.map(category => (
                              <span 
                                key={category}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-1.5"
                                style={{ 
                                  backgroundColor: `${categoryColors[category]}20`,
                                  color: categoryColors[category]
                                }}
                              >
                                {getCategoryLabel(category, t).charAt(0)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 pl-16">{career.description}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <Briefcase className="h-5 w-5 text-gray-500 mr-3" />
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-1">{t('riasec.results.education', 'Pendidikan')}</div>
                          <div className="text-sm font-medium text-gray-700">{career.educationRequired}</div>
                        </div>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <DollarSign className="h-5 w-5 text-gray-500 mr-3" />
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-1">{t('riasec.results.salary', 'Gaji')}</div>
                          <div className="text-sm font-medium text-gray-700">
                            {formatCurrency(career.salary.min, career.salary.currency)} - {formatCurrency(career.salary.max, career.salary.currency)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <TrendingUp className="h-5 w-5 text-gray-500 mr-3" />
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-1">{t('riasec.results.outlook', 'Prospek')}</div>
                          <div className="text-sm font-medium text-gray-700">
                            {career.outlookGrowth}% {t('riasec.results.growth', 'pertumbuhan')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex sm:flex-col sm:items-end gap-3 sm:gap-4">
                    <button className="inline-flex items-center px-4 py-2 border-2 border-brand-500 rounded-xl text-sm font-medium text-brand-700 bg-white hover:bg-brand-50 transition-colors duration-200 shadow-sm">
                      {t('riasec.results.learnMore', 'Pelajari Lebih Lanjut')}
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm">
                      {t('riasec.results.findPrograms', 'Cari Program')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
            <button 
              onClick={() => setCurrentTab('overview')}
              className="inline-flex items-center justify-center px-5 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 shadow-sm"
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              {t('riasec.results.backToOverview', 'Kembali ke Ringkasan')}
            </button>
            
            <button 
              onClick={onStartNewAssessment}
              className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 shadow-sm transition-all duration-200"
            >
              {t('riasec.results.newAssessment', 'Mulai Penilaian Baru')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiasecResults;
