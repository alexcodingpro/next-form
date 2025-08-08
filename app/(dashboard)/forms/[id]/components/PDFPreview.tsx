'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FormElementInstance } from '@/app/(dashboard)/_components/FormElements';
import { SubmissionData } from '@/lib/pdf-generator';
import { format } from 'date-fns';
import { Eye, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface PDFPreviewProps {
  formName: string;
  formElements: FormElementInstance[];
  submissionData: SubmissionData;
}

export default function PDFPreview({
  formName,
  formElements,
  submissionData,
}: PDFPreviewProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Eye className="h-4 w-4 mr-1" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            PDF Preview
          </DialogTitle>
          <DialogDescription>
            This is how the form submission will appear in the generated PDF.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 bg-white p-6 border rounded-lg">
          {/* Header */}
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold text-black">Form Submission</h1>
            <h2 className="text-lg font-semibold text-gray-700 mt-2">{formName}</h2>
            <p className="text-sm text-gray-500 mt-2">
              Submitted: {format(new Date(submissionData.submitted), 'PPPp')}
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {formElements.map((element) => {
              // Only show form input elements
              switch (element.type) {
                case "TextField":
                case "NumberField":
                case "TextAreaField":
                case "DateField":
                case "SelectField":
                case "CheckboxField":
                case "SignatureField":
                  const fieldLabel = element.extraAttributes?.label || 'Untitled Field';
                  const fieldValue = submissionData[element.id] || '';
                  const isRequired = element.extraAttributes?.required;

                  let displayValue: React.ReactNode = fieldValue;

                  // Format different field types
                  switch (element.type) {
                    case "DateField":
                      if (fieldValue) {
                        try {
                          const date = new Date(fieldValue);
                          displayValue = <Badge variant="outline">{format(date, 'PP')}</Badge>;
                        } catch {
                          displayValue = fieldValue;
                        }
                      } else {
                        displayValue = <span className="text-gray-400 italic">(Not provided)</span>;
                      }
                      break;

                    case "CheckboxField":
                      const checked = fieldValue === 'true';
                      displayValue = <Checkbox checked={checked} disabled />;
                      break;

                    case "SignatureField":
                      if (fieldValue && fieldValue.startsWith('data:image')) {
                        displayValue = (
                          <div className="border border-gray-300 rounded p-2 max-w-xs">
                            <img
                              src={fieldValue}
                              alt="Signature"
                              className="max-w-full h-auto"
                            />
                          </div>
                        );
                      } else {
                        displayValue = <span className="text-gray-400 italic">(No signature provided)</span>;
                      }
                      break;

                    default:
                      if (!fieldValue?.trim()) {
                        displayValue = <span className="text-gray-400 italic">(Not provided)</span>;
                      }
                      break;
                  }

                  return (
                    <div key={element.id} className="border-l-4 border-gray-200 pl-4">
                      <label className="block font-semibold text-gray-800 mb-1">
                        {fieldLabel}
                        {isRequired && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <div className="text-gray-600">
                        {displayValue}
                      </div>
                    </div>
                  );

                default:
                  return null;
              }
            })}
          </div>

          {/* Footer */}
          <div className="border-t pt-4 flex justify-between items-center text-xs text-gray-400">
            <span>Generated by NextForm</span>
            <span>Generated on {format(new Date(), 'PPPp')}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}