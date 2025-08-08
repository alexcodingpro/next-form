import jsPDF from 'jspdf';
import { FormElementInstance, ElementsType } from '@/app/(dashboard)/_components/FormElements';
import { format } from 'date-fns';

export interface SubmissionData {
  [key: string]: string;
  submitted: string;
}

export interface FormColumn {
  id: string;
  label: string;
  required: boolean;
  type: ElementsType;
}

export function generatePDF(
  formName: string,
  formElements: FormElementInstance[],
  submissionData: SubmissionData
) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // A4 dimensions: 210mm x 297mm
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  let currentY = margin;
  
  // Helper function to add text with automatic line wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 12) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    
    // Check if we need a new page
    if (y + (lines.length * fontSize * 0.5) > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
    
    pdf.text(lines, x, y);
    return y + (lines.length * fontSize * 0.5) + 5; // Return new Y position
  };
  
  // Header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.setTextColor(0, 0, 0);
  currentY = addWrappedText('Form Submission', margin, currentY, contentWidth, 20);
  
  // Form name
  pdf.setFontSize(16);
  currentY = addWrappedText(formName, margin, currentY, contentWidth, 16);
  currentY += 10;
  
  // Submission date
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  const submittedDate = new Date(submissionData.submitted);
  currentY = addWrappedText(
    `Submitted: ${format(submittedDate, 'PPPp')}`, 
    margin, 
    currentY, 
    contentWidth, 
    10
  );
  currentY += 15;
  
  // Form fields
  formElements.forEach((element) => {
    // Only process form input elements
    switch (element.type) {
      case "TextField":
      case "NumberField":
      case "TextAreaField":
      case "DateField":
      case "SelectField":
      case "CheckboxField":
      case "SignatureField":
      case "TextParagraphField":
        const fieldLabel = element.extraAttributes?.label || 'Untitled Field';
        const fieldValue = submissionData[element.id] || '';
        const isRequired = element.extraAttributes?.required;
        
        // Check if we need a new page
        if (currentY > pageHeight - 50) {
          pdf.addPage();
          currentY = margin;
        }
        
        // Field label
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        let labelText = fieldLabel;
        if (isRequired) {
          labelText += ' *';
        }
        currentY = addWrappedText(labelText, margin, currentY, contentWidth, 12);
        
        // Field value
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        
        let displayValue = fieldValue;
        let skipTextOutput = false;
        
        // Format different field types
        switch (element.type) {
          case "DateField":
            if (fieldValue) {
              try {
                const date = new Date(fieldValue);
                displayValue = format(date, 'PP');
              } catch {
                displayValue = fieldValue;
              }
            } else {
              displayValue = '(Not provided)';
            }
            break;
            
          case "CheckboxField":
            displayValue = fieldValue === 'true' ? '☑ Yes' : '☐ No';
            break;
            
          case "SignatureField":
            if (fieldValue && fieldValue.startsWith('data:image')) {
              try {
                // Add signature image
                const imgWidth = 60; // mm
                const imgHeight = 30; // mm
                
                // Check if we need space for the image
                if (currentY + imgHeight > pageHeight - margin) {
                  pdf.addPage();
                  currentY = margin;
                }
                
                pdf.addImage(fieldValue, 'PNG', margin + 5, currentY, imgWidth, imgHeight);
                currentY += imgHeight + 5;
                skipTextOutput = true; // Don't add text since we added the image
              } catch (error) {
                console.warn('Could not embed signature image:', error);
                displayValue = '[Digital Signature Provided - Could not embed image]';
              }
            } else {
              displayValue = '(No signature provided)';
            }
            break;
            
          case "TextParagraphField":
            try {
              const variables = JSON.parse(fieldValue);
              const paragraph = element.extraAttributes?.paragraph || '';
              
              // Replace variables in the paragraph
              let filledParagraph = paragraph;
              Object.entries(variables).forEach(([key, value]) => {
                const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
                filledParagraph = filledParagraph.replace(regex, value as string || `{{${key}}}`);
              });
              
              displayValue = filledParagraph;
            } catch {
              displayValue = '(Invalid paragraph data)';
            }
            break;
            
          default:
            if (!fieldValue.trim()) {
              displayValue = '(Not provided)';
            }
            break;
        }
        
        if (!skipTextOutput && displayValue) {
          currentY = addWrappedText(displayValue, margin + 5, currentY, contentWidth - 5, 10);
        }
        currentY += 10; // Space between fields
        break;
        
      default:
        break;
    }
  });
  
  // Footer
  if (currentY > pageHeight - 40) {
    pdf.addPage();
    currentY = pageHeight - 30;
  } else {
    currentY = pageHeight - 30;
  }
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text('Generated by NextForm', margin, currentY);
  pdf.text(
    `Generated on ${format(new Date(), 'PPPp')}`, 
    pageWidth - margin, 
    currentY, 
    { align: 'right' }
  );
  
  return pdf;
}

export function downloadPDF(
  pdf: jsPDF,
  formName: string,
  submissionDate: string
) {
  const fileName = `${formName.replace(/[^a-zA-Z0-9]/g, '_')}_${format(new Date(submissionDate), 'yyyy-MM-dd')}.pdf`;
  pdf.save(fileName);
}