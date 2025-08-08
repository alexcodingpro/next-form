'use client';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { generatePDF, downloadPDF, SubmissionData } from '@/lib/pdf-generator';
import { FormElementInstance } from '@/app/(dashboard)/_components/FormElements';
import { FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface PDFDownloadButtonProps {
  formName: string;
  formElements: FormElementInstance[];
  submissionData: SubmissionData;
}

export default function PDFDownloadButton({
  formName,
  formElements,
  submissionData,
}: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    if (isGenerating) return;

    setIsGenerating(true);

    try {
      // Generate PDF
      const pdf = generatePDF(formName, formElements, submissionData);
      
      // Download PDF
      downloadPDF(pdf, formName, submissionData.submitted);
      
      toast({
        title: 'PDF Generated!',
        description: 'Your form submission PDF has been downloaded.',
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'PDF Generation Failed',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownloadPDF}
      disabled={isGenerating}
      className="flex items-center gap-2"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileText className="h-4 w-4" />
      )}
      {isGenerating ? 'Generating...' : 'PDF'}
    </Button>
  );
}