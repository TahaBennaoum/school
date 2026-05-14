import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  studentName: string;
  studentClass: string;
  parentName: string;
  schoolName: string;
  items: Array<{
    description: string;
    amount: number;
    quantity?: number;
  }>;
  totalAmount: number;
  amountPaid?: number;
  balance?: number;
  status: string;
  paymentMethod?: string;
  notes?: string;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  let yPosition = margin;

  // Header
  pdf.setFontSize(20);
  pdf.text(data.schoolName, margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.text(`Invoice #${data.invoiceNumber}`, margin, yPosition);
  yPosition += 6;

  // Date info
  pdf.setFontSize(10);
  pdf.text(`Date: ${data.date}`, margin, yPosition);
  yPosition += 5;
  pdf.text(`Due Date: ${data.dueDate}`, margin, yPosition);
  yPosition += 8;

  // Student info
  pdf.setFontSize(11);
  pdf.setFont(undefined, 'bold');
  pdf.text('Student Information', margin, yPosition);
  yPosition += 5;
  
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(10);
  pdf.text(`Name: ${data.studentName}`, margin, yPosition);
  yPosition += 4;
  pdf.text(`Class: ${data.studentClass}`, margin, yPosition);
  yPosition += 4;
  pdf.text(`Parent: ${data.parentName}`, margin, yPosition);
  yPosition += 8;

  // Items table
  pdf.setFontSize(11);
  pdf.setFont(undefined, 'bold');
  pdf.text('Items', margin, yPosition);
  yPosition += 5;

  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(10);

  // Table header
  const tableStartY = yPosition;
  pdf.setDrawColor(200);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 2;

  pdf.text('Description', margin + 2, yPosition);
  pdf.text('Qty', pageWidth - margin - 30, yPosition);
  pdf.text('Amount', pageWidth - margin - 15, yPosition);
  yPosition += 4;

  pdf.setDrawColor(200);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 3;

  // Items
  let subtotal = 0;
  data.items.forEach((item) => {
    const amount = item.amount * (item.quantity || 1);
    subtotal += amount;
    
    pdf.text(item.description.substring(0, 40), margin + 2, yPosition);
    pdf.text(String(item.quantity || 1), pageWidth - margin - 30, yPosition);
    pdf.text(`$${amount.toFixed(2)}`, pageWidth - margin - 15, yPosition);
    yPosition += 5;
  });

  pdf.setDrawColor(200);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 3;

  // Totals
  pdf.setFont(undefined, 'bold');
  pdf.text(`Total Amount: $${data.totalAmount.toFixed(2)}`, pageWidth - margin - 30, yPosition);
  yPosition += 5;

  if (data.amountPaid !== undefined) {
    pdf.text(`Amount Paid: $${data.amountPaid.toFixed(2)}`, pageWidth - margin - 30, yPosition);
    yPosition += 5;
  }

  if (data.balance !== undefined) {
    pdf.setTextColor(data.balance > 0 ? 255 : 0, data.balance > 0 ? 0 : 0, 0);
    pdf.text(`Balance: $${data.balance.toFixed(2)}`, pageWidth - margin - 30, yPosition);
    pdf.setTextColor(0);
  }

  yPosition += 8;

  // Status and notes
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(10);
  pdf.text(`Status: ${data.status}`, margin, yPosition);
  yPosition += 5;

  if (data.paymentMethod) {
    pdf.text(`Payment Method: ${data.paymentMethod}`, margin, yPosition);
    yPosition += 5;
  }

  if (data.notes) {
    pdf.text(`Notes: ${data.notes}`, margin, yPosition);
  }

  return pdf.output('blob');
}

export async function generateReceiptPDF(data: InvoiceData): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 10;
  let yPosition = margin;

  // Header
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.text('PAYMENT RECEIPT', margin, yPosition);
  yPosition += 10;

  // Receipt info
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  pdf.text(`Receipt #${data.invoiceNumber}`, margin, yPosition);
  yPosition += 4;
  pdf.text(`Date: ${data.date}`, margin, yPosition);
  yPosition += 8;

  // Student info
  pdf.setFont(undefined, 'bold');
  pdf.text('Student Information', margin, yPosition);
  yPosition += 4;
  
  pdf.setFont(undefined, 'normal');
  pdf.text(`Name: ${data.studentName}`, margin, yPosition);
  yPosition += 3;
  pdf.text(`Class: ${data.studentClass}`, margin, yPosition);
  yPosition += 3;
  pdf.text(`Parent: ${data.parentName}`, margin, yPosition);
  yPosition += 8;

  // Payment details
  pdf.setFont(undefined, 'bold');
  pdf.text('Payment Details', margin, yPosition);
  yPosition += 4;

  pdf.setFont(undefined, 'normal');
  data.items.forEach((item) => {
    const amount = item.amount * (item.quantity || 1);
    pdf.text(`${item.description}: $${amount.toFixed(2)}`, margin, yPosition);
    yPosition += 4;
  });

  yPosition += 3;
  pdf.setFont(undefined, 'bold');
  pdf.setFontSize(12);
  pdf.text(`Total Paid: $${data.totalAmount.toFixed(2)}`, margin, yPosition);
  yPosition += 8;

  // Thank you message
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'italic');
  pdf.text('Thank you for your payment!', margin, yPosition);

  return pdf.output('blob');
}
