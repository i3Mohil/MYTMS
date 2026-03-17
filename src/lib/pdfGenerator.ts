import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Company, Document } from '../db/db';

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}-${month}-${year}`;
};

export const generatePDF = (doc: Document, company: Company, userEmail?: string) => {
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  
  const drawBox = (x: number, y: number, w: number, h: number) => {
    pdf.setDrawColor(150);
    pdf.rect(x, y, w, h);
  };

  // 1. Header Section
  let currentY = 10;
  
  if (company.logo) {
    try {
      const imgType = company.logo.includes('image/jpeg') ? 'JPEG' : 'PNG';
      pdf.addImage(company.logo, imgType, 14, currentY, 40, 20, undefined, 'FAST');
    } catch (e) {
      console.error('Error adding logo to PDF', e);
    }
  }

  pdf.setTextColor(0, 51, 153); // Dark blue
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(28); // Bit wider/larger
  pdf.text(company.name.toUpperCase(), pageWidth / 2, currentY + 8, { align: 'center' });
  pdf.setTextColor(0); // Reset to black
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(company.address, pageWidth / 2, currentY + 14, { align: 'center' });
  
  if (company.tagline) {
    pdf.setFontSize(9);
    pdf.text(company.tagline, pageWidth / 2, currentY + 19, { align: 'center' });
  }

  pdf.setFontSize(9);
  const rightX = pageWidth - 14;
  if (company.phone) pdf.text(`Ph: ${company.phone}`, rightX, currentY + 8, { align: 'right' });
  if (userEmail) pdf.text(`Email: ${userEmail}`, rightX, currentY + 13, { align: 'right' });

  currentY += 25;

  // 2. Info Grid (3 columns)
  const colWidth1 = (pageWidth - 28) * 0.33;
  const colWidth2 = (pageWidth - 28) * 0.33;
  const colWidth3 = (pageWidth - 28) * 0.34;
  
  const boxHeight1 = 25;
  
  drawBox(14, currentY, colWidth1, boxHeight1);
  drawBox(14 + colWidth1, currentY, colWidth2, boxHeight1);
  drawBox(14 + colWidth1 + colWidth2, currentY, colWidth3, boxHeight1);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Notice', 14 + colWidth1/2, currentY + 4, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  const noticeText = "Without the consignee's written permission this consignment will not be diverted, rerouted, or rebooked and it should be delivered at the destination. Lorry Receipt will be delivered to the only consignee. Without prior approval, Lorry Receipt can not be handover to anyone.";
  pdf.text(noticeText, 16, currentY + 8, { maxWidth: colWidth1 - 4 });

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text("AT OWNER'S RISK", 14 + colWidth1/2, currentY + 22, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  if (company.gstNo) pdf.text(`GST No.: ${company.gstNo}`, 14 + colWidth1 + 2, currentY + 6);
  if (company.panNo) pdf.text(`PAN No.: ${company.panNo}`, 14 + colWidth1 + 2, currentY + 11);

  pdf.text(`LR Date: ${formatDate(doc.date)}`, 14 + colWidth1 + colWidth2 + 2, currentY + 6);
  pdf.text(`LR No: ${doc.lrNumber}`, 14 + colWidth1 + colWidth2 + colWidth3/2, currentY + 6);
  
  pdf.text(`Truck/Vehicle No.: ${doc.vehicleNo || 'N/A'}`, 14 + colWidth1 + colWidth2 + 2, currentY + 11);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`From: ${doc.pickup}`, 14 + colWidth1 + colWidth2 + 2, currentY + 17);
  pdf.text(`To: ${doc.delivery}`, 14 + colWidth1 + colWidth2 + colWidth3/2, currentY + 17);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Payment Status: ${doc.paymentType}`, 14 + colWidth1 + colWidth2 + colWidth3/2, currentY + 23);

  currentY += boxHeight1;

  // 3. Consignor / Consignee / Insurance
  const boxHeight2 = 25;
  drawBox(14, currentY, colWidth1, boxHeight2);
  drawBox(14 + colWidth1, currentY, colWidth2, boxHeight2);
  drawBox(14 + colWidth1 + colWidth2, currentY, colWidth3, boxHeight2);

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Consignor: ${doc.consignorName || ''}`, 16, currentY + 5);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`GST No: ${doc.consignorGst || ''}`, 16, currentY + 10);
  pdf.text(`Address: ${doc.consignorAddress || ''}`, 16, currentY + 15, { maxWidth: colWidth1 - 4 });

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Consignee: ${doc.consigneeName || ''}`, 14 + colWidth1 + 2, currentY + 5);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`GST No: ${doc.consigneeGst || ''}`, 14 + colWidth1 + 2, currentY + 10);
  pdf.text(`Address: ${doc.consigneeAddress || ''}`, 14 + colWidth1 + 2, currentY + 15, { maxWidth: colWidth2 - 4 });

  pdf.setFontSize(8);
  pdf.text(`E-Way Bill No: ${doc.ewayBill || 'N/A'}`, 14 + colWidth1 + colWidth2 + 2, currentY + 5);
  pdf.text(`Invoice Value: Rs. ${doc.invoiceValue || 0}`, 14 + colWidth1 + colWidth2 + 2, currentY + 10);
  
  pdf.setFontSize(9);
  pdf.setTextColor(100);
  pdf.text(doc.insuranceNote || "Insurance details is not\navailable or not insured.", 14 + colWidth1 + colWidth2 + colWidth3/2, currentY + 18, { align: 'center' });
  pdf.setTextColor(0);

  currentY += boxHeight2;

  // 4. Main Table
  const tableWidth = pageWidth - 28 - 70;

  autoTable(pdf, {
    startY: currentY,
    margin: { left: 14, right: 14 + 70 },
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 8, halign: 'center', lineColor: [150, 150, 150], lineWidth: 0.1 },
    bodyStyles: { fontSize: 8, halign: 'center', lineColor: [150, 150, 150], lineWidth: 0.1 },
    head: [['Sr\nno.', 'Product / Material', 'Packaging Type', 'Articles/\nPackages', 'Actual\nWeight', 'Charge\nWeight', 'Freight Rate']],
    body: [
      [
        '1',
        doc.productMaterial || '-',
        doc.packagingType || '-',
        doc.packages || '-',
        `${doc.totalWeight || 0} Ton`,
        `${doc.chargeWeight || 0} Ton`,
        `Rs. ${doc.freightRate || 0}`
      ]
    ],
  });

  const tableFinalY = (pdf as any).lastAutoTable.finalY;
  
  const totalsX = 14 + tableWidth;
  const totalsW = 70;
  
  const totals = [
    { label: 'Total Basic Freight', value: doc.freight || 0 },
    { label: 'CGST', value: doc.cgst || 0 },
    { label: 'SGST', value: doc.sgst || 0 },
    { label: 'IGST', value: doc.igst || 0 },
    { label: 'Total Freight', value: (doc.freight || 0) + (doc.cgst || 0) + (doc.sgst || 0) + (doc.igst || 0), bold: true },
    { label: 'Advance Paid', value: doc.advancePaid || 0 },
    { label: 'Remaining Payable Amount', value: doc.remainingToPay || 0, bold: true }
  ];

  const rowHeight = 6;
  const totalsHeight = totals.length * rowHeight;
  
  const maxH = Math.max(tableFinalY - currentY, totalsHeight);
  
  drawBox(totalsX, currentY, totalsW, maxH);
  
  let ty = currentY;
  pdf.setFontSize(8);
  totals.forEach((t, i) => {
    if (i > 0) {
      pdf.setDrawColor(150);
      pdf.line(totalsX, ty, totalsX + totalsW, ty);
    }
    if (t.bold) pdf.setFont('helvetica', 'bold');
    else pdf.setFont('helvetica', 'normal');
    
    pdf.text(t.label, totalsX + totalsW - 25, ty + 4, { align: 'right' });
    pdf.text(t.value.toString(), totalsX + totalsW - 2, ty + 4, { align: 'right' });
    
    ty += rowHeight;
  });

  if (totalsHeight > (tableFinalY - currentY)) {
     drawBox(14, tableFinalY, tableWidth, maxH - (tableFinalY - currentY));
  }

  currentY += maxH;

  // 5. Remarks and Signatures
  const remarkHeight = 25;
  drawBox(14, currentY, tableWidth, remarkHeight);
  drawBox(totalsX, currentY, totalsW, remarkHeight);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Other Remark:', 16, currentY + 5);
  pdf.setFont('helvetica', 'normal');
  pdf.text(doc.remarks || '', 16, currentY + 10, { maxWidth: tableWidth - 4 });

  if (company.signature) {
    try {
      const imgType = company.signature.includes('image/jpeg') ? 'JPEG' : 'PNG';
      pdf.addImage(company.signature, imgType, totalsX + totalsW/2 - 15, currentY + 2, 30, 15);
    } catch (e) {
      console.error('Error adding signature to PDF', e);
    }
  }
  pdf.setFontSize(8);
  pdf.text(`For ${company.name}`, totalsX + totalsW/2, currentY + 5, { align: 'center' });
  pdf.text('Authorized Signatory', totalsX + totalsW/2, currentY + 22, { align: 'center' });

  currentY += remarkHeight;

  // 6. Footer Grid
  const footerHeight = 20;
  drawBox(14, currentY, colWidth1, footerHeight);
  drawBox(14 + colWidth1, currentY, colWidth2, footerHeight);
  drawBox(14 + colWidth1 + colWidth2, currentY, colWidth3, footerHeight);

  pdf.setFontSize(7);
  pdf.text(`A/C Name: ${doc.accountName || ''}`, 14 + colWidth1/2, currentY + 4, { align: 'center' });
  pdf.text(`Bank Name: ${doc.bankName || ''}`, 14 + colWidth1/2, currentY + 8, { align: 'center' });
  pdf.text(`Bank A/C No.: ${doc.bankAcNo || ''}`, 14 + colWidth1/2, currentY + 12, { align: 'center' });
  pdf.text(`IFSC: ${doc.ifscCode || ''}`, 14 + colWidth1/2, currentY + 16, { align: 'center' });

  pdf.text('"Total amount of goods as per the invoice"', 14 + colWidth1 + colWidth2/2, currentY + 8, { align: 'center' });
  pdf.text('This is computer generated LR/ Bilty.', 14 + colWidth1 + colWidth2/2, currentY + 12, { align: 'center' });

  pdf.setFont('helvetica', 'bold');
  pdf.text('Schedule of demurrage charges', 14 + colWidth1 + colWidth2 + colWidth3/2, currentY + 5, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.text(doc.termsNote || 'Demurrage charges applicable from reporting time after: 1 hour\nApplicable Charge : Rs. 0 Per Hour', 14 + colWidth1 + colWidth2 + colWidth3/2, currentY + 10, { align: 'center' });

  return pdf;
};
