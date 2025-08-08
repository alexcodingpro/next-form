'use client';

import {
  ElementsType,
  FormElement,
  FormElementInstance,
  SubmitFunction,
} from '@/app/(dashboard)/_components/FormElements';
import { Label } from '@radix-ui/react-label';
import { FileText, Braces } from 'lucide-react';
import { Input } from '../ui/input';
import { z } from 'zod';
import { useDesginerStore } from '@/store/store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useMemo } from 'react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const type: ElementsType = 'TextParagraphField';

const extraAttributes = {
  label: 'Text Paragraph',
  helperText: 'Fill in the variables in the text',
  required: false,
  paragraph: 'Hello {{name}}, welcome to {{company}}! Your appointment is scheduled for {{date}} at {{time}}.',
};

const propertiesSchema = z.object({
  label: z.string().min(2).max(50),
  helperText: z.string().max(200),
  required: z.boolean().default(false),
  paragraph: z.string().min(1).max(1000),
});

export const TextParagraphFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: <FileText className="h-8 w-8" />,
    label: 'Text Paragraph',
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,

  validate: (formElement: FormElementInstance, currentValue: string): boolean => {
    const element = formElement as CustomInstance;
    
    if (element.extraAttributes.required) {
      // For paragraph fields, we need to check if all variables have been filled
      const variables = extractVariables(element.extraAttributes.paragraph);
      
      try {
        const submissionData = JSON.parse(currentValue || '{}');
        return variables.every(variable => 
          submissionData[variable] && submissionData[variable].trim().length > 0
        );
      } catch {
        return false;
      }
    }

    return true;
  }
};

// Helper function to extract variables from text like {{variable}}
function extractVariables(text: string): string[] {
  const matches = text.match(/\{\{([^}]+)\}\}/g);
  if (!matches) return [];
  
  return matches.map(match => match.replace(/[\{\}]/g, ''));
}

// Helper function to replace variables in text
function replaceVariables(text: string, variables: Record<string, string>): string {
  let result = text;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value || `{{${key}}}`);
  });
  return result;
}

type propertiesType = z.infer<typeof propertiesSchema>;

function PropertiesComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;

  const { updateElement } = useDesginerStore();

  const { label, helperText, required, paragraph } = element.extraAttributes;

  const form = useForm<propertiesType>({
    resolver: zodResolver(propertiesSchema),
    defaultValues: {
      label,
      helperText,
      required,
      paragraph,
    },
  });

  useEffect(() => {
    form.reset(element.extraAttributes);
  }, [element, form]);

  function applyChanges(data: propertiesType) {
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        ...data,
      },
    });
  }

  const paragraphValue = form.watch('paragraph');
  const variables = useMemo(() => extractVariables(paragraphValue), [paragraphValue]);

  const addSampleVariable = () => {
    const currentParagraph = form.getValues('paragraph');
    const newText = currentParagraph + ' {{new_variable}}';
    form.setValue('paragraph', newText);
  };

  return (
    <Form {...form}>
      <form
        onBlur={form.handleSubmit(applyChanges)}
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="space-y-4">
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormDescription>
                The label of the Text Paragraph. <br /> It will be displayed above
                the paragraph.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="helperText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Helper Text</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormDescription>
                The helper text of the Text Paragraph. <br /> It will be displayed
                below the paragraph.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="paragraph"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paragraph Text</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={5}
                  placeholder="Enter your paragraph with variables like {{name}}, {{date}}, etc."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormDescription>
                Write your paragraph and use double curly braces for variables: {'{{'} variable_name {'}}'} 
                <br />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={addSampleVariable}
                >
                  <Braces className="h-4 w-4 mr-1" />
                  Add Variable
                </Button>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {variables.length > 0 && (
          <div className="space-y-2">
            <FormLabel>Variables Found:</FormLabel>
            <div className="flex flex-wrap gap-2">
              {variables.map((variable, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {variable}
                </Badge>
              ))}
            </div>
            <FormDescription className="text-xs">
              Users will need to fill in these variables when submitting the form.
            </FormDescription>
          </div>
        )}
        <FormField
          control={form.control}
          name="required"
          render={({ field }) => (
            <FormItem>
              <div className="space-y-0.5">
                <FormLabel>Required</FormLabel>
                <FormDescription>
                  Whether all variables in the paragraph must be filled.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

function DesignerComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;

  const { label, required, helperText, paragraph } = element.extraAttributes;
  const variables = extractVariables(paragraph);

  return (
    <div className="flex w-full flex-col gap-2">
      <Label className="text-sm text-foreground">
        {label}
        {required && <span className="ml-2 text-red-500">*</span>}
      </Label>
      <div className="w-full p-3 border-2 border-dashed border-muted-foreground/25 rounded-md bg-muted/10">
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {paragraph}
        </p>
        {variables.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {variables.slice(0, 3).map((variable, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {variable}
              </Badge>
            ))}
            {variables.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{variables.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </div>
      {helperText && (
        <p className="text-xs text-muted-foreground truncate">{helperText}</p>
      )}
    </div>
  );
}

function FormComponent({
  elementInstance,
  submitFunction,
  isInvalid,
  defaultValues,
}: {
  elementInstance: FormElementInstance;
  submitFunction?: SubmitFunction;
  isInvalid?: boolean;
  defaultValues?: string;
}) {
  const element = elementInstance as CustomInstance;
  const variables = useMemo(() => extractVariables(element.extraAttributes.paragraph), [element.extraAttributes.paragraph]);
  
  const [variableValues, setVariableValues] = useState<Record<string, string>>(() => {
    try {
      return defaultValues ? JSON.parse(defaultValues) : {};
    } catch {
      return {};
    }
  });
  
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

  const { label, required, helperText, paragraph } = element.extraAttributes;

  const handleVariableChange = (variable: string, value: string) => {
    const newValues = { ...variableValues, [variable]: value };
    setVariableValues(newValues);
    
    if (submitFunction) {
      const valid = TextParagraphFieldFormElement.validate(element, JSON.stringify(newValues));
      setError(!valid);
      if (valid || !required) {
        submitFunction(element.id, JSON.stringify(newValues));
      }
    }
  };

  const previewText = replaceVariables(paragraph, variableValues);

  return (
    <div className="flex w-full flex-col gap-4">
      <Label className={cn("text-foreground", error && 'text-red-500')}>
        {label}
        {required && <span className="ml-2 text-red-500">*</span>}
      </Label>
      
      {/* Preview of the paragraph with filled variables */}
      <div className="w-full p-4 border rounded-md bg-muted/50">
        <p className="text-sm whitespace-pre-wrap">
          {previewText}
        </p>
      </div>
      
      {/* Variable input fields */}
      {variables.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Fill in the variables:</Label>
          <div className="grid gap-3">
            {variables.map((variable, index) => (
              <div key={index} className="flex items-center gap-3">
                <Badge variant="outline" className="min-w-[100px] justify-center">
                  {variable}
                </Badge>
                <Input
                  placeholder={`Enter ${variable}`}
                  value={variableValues[variable] || ''}
                  onChange={(e) => handleVariableChange(variable, e.target.value)}
                  className={cn(error && !variableValues[variable] && 'border-red-500')}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {helperText && (
        <p className={cn("text-[.8rem] text-muted-foreground", error && ("text-rose-500"))}>{helperText}</p>
      )}
    </div>
  );
}