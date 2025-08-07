'use client';

import {
  ElementsType,
  FormElement,
  FormElementInstance,
  SubmitFunction,
} from '@/app/(dashboard)/_components/FormElements';
import { Label } from '@radix-ui/react-label';
import { Edit3, Pen, Type } from 'lucide-react';
import { z } from 'zod';
import { useDesginerStore } from '@/store/store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useRef, useCallback } from 'react';
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
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

const type: ElementsType = 'SignatureField';

const extraAttributes = {
  label: 'Signature Field',
  helperText: 'Draw your signature in the box or type your name',
  required: false,
  defaultMode: 'pen' as 'pen' | 'type',
};

const propertiesSchema = z.object({
  label: z.string().min(2).max(50),
  helperText: z.string().max(200),
  required: z.boolean().default(false),
  defaultMode: z.enum(['pen', 'type']).default('pen'),
});

export const SignatureFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: <Edit3 className="h-8 w-8" />,
    label: 'Signature Field',
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,

  validate: (formElement: FormElementInstance, currentValue: string): boolean => {
    const element = formElement as CustomInstance;

    if (element.extraAttributes.required) {
      return currentValue.length > 0;
    }

    return true;
  }
};

type propertiesType = z.infer<typeof propertiesSchema>;

function PropertiesComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;

  const { updateElement } = useDesginerStore();

  const { label, helperText, required, defaultMode } = element.extraAttributes;

  const form = useForm<propertiesType>({
    resolver: zodResolver(propertiesSchema),
    defaultValues: {
      label: label,
      helperText: helperText,
      required: required,
      defaultMode: defaultMode,
    },
  });

  useEffect(() => {
    form.reset(element.extraAttributes);
  }, [element, form]);

  function applyChanges(data: propertiesType) {
    const { label, helperText, required, defaultMode } = data;

    updateElement(element.id, {
      ...element,
      extraAttributes: {
        label,
        helperText,
        required,
        defaultMode,
      },
    });
  }

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
                The label of the Signature Field. <br /> It will be displayed above
                the signature canvas.
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
                The helper text of the Signature Field. <br /> It will be displayed
                below the signature canvas.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="required"
          render={({ field }) => (
            <FormItem>
              <div className="space-y-0.5">
                <FormLabel>Required</FormLabel>
                <FormDescription>
                  Whether the Signature Field is required or not.
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
        <FormField
          control={form.control}
          name="defaultMode"
          render={({ field }) => (
            <FormItem>
              <div className="space-y-0.5">
                <FormLabel>Default Mode</FormLabel>
                <FormDescription>
                  Choose the default signature mode for users.
                </FormDescription>
              </div>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pen" id="pen" />
                    <Label htmlFor="pen" className="flex items-center gap-2">
                      <Pen className="h-4 w-4" />
                      Draw signature
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="type" id="type" />
                    <Label htmlFor="type" className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      Type signature
                    </Label>
                  </div>
                </RadioGroup>
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

  const { label, required, helperText, defaultMode } = element.extraAttributes;

  return (
    <div className="flex w-full flex-col gap-1">
      <Label className="mr-2 text-sm text-foreground">
        {label}
        {required && <span className="ml-2 text-red-500">*</span>}
      </Label>
      <div className="w-full h-16 border-2 border-dashed border-muted-foreground/25 rounded-md flex items-center justify-center bg-muted/10">
        <div className="flex flex-col items-center gap-1 text-muted-foreground">
          {defaultMode === 'type' ? (
            <>
              <Type className="h-6 w-6" />
              <span className="text-xs">Type Signature</span>
            </>
          ) : (
            <>
              <Pen className="h-6 w-6" />
              <span className="text-xs">Draw Signature</span>
            </>
          )}
        </div>
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState(defaultValues || '');
  const [typedSignature, setTypedSignature] = useState('');
  const [activeTab, setActiveTab] = useState<'pen' | 'type'>(element.extraAttributes.defaultMode || 'pen');
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

  useEffect(() => {
    if (defaultValues) {
      if (defaultValues.startsWith('data:image')) {
        // It's a canvas signature
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const img = new Image();
            img.onload = () => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = defaultValues;
          }
        }
        setActiveTab('pen');
      } else {
        // It's a typed signature
        setTypedSignature(defaultValues);
        setActiveTab('type');
      }
    }
  }, [defaultValues]);

  const { label, required, helperText } = element.extraAttributes;

  const generateTypedSignature = useCallback((text: string) => {
    if (!text.trim()) return '';
    
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#000000';
      ctx.font = '48px "Brush Script MT", "Lucida Handwriting", "Segoe Print", cursive';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    }
    
    return canvas.toDataURL();
  }, []);

  const handleTypedSignatureChange = useCallback((value: string) => {
    setTypedSignature(value);
    const signatureData = generateTypedSignature(value);
    setSignature(signatureData);

    if (submitFunction) {
      const valid = SignatureFieldFormElement.validate(element, signatureData);
      setError(!valid);
      if (valid) {
        submitFunction(element.id, signatureData);
      }
    }
  }, [element, submitFunction, generateTypedSignature]);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    canvas.style.cursor = 'crosshair';
    
    return { scaleX, scaleY };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    
    if ('touches' in e) {
      e.preventDefault();
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
  }, []);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    
    if ('touches' in e) {
      e.preventDefault();
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineTo(x, y);
    ctx.stroke();
  }, [isDrawing]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL();
    setSignature(dataURL);

    if (submitFunction) {
      const valid = SignatureFieldFormElement.validate(element, dataURL);
      setError(!valid);
      if (valid) {
        submitFunction(element.id, dataURL);
      }
    }
  }, [isDrawing, element, submitFunction]);

  const clearSignature = useCallback(() => {
    if (activeTab === 'pen') {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      setTypedSignature('');
    }
    
    setSignature('');

    if (submitFunction) {
      const valid = SignatureFieldFormElement.validate(element, '');
      setError(!valid);
      if (valid) {
        submitFunction(element.id, '');
      }
    }
  }, [activeTab, element, submitFunction]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setupCanvas();
  }, [setupCanvas]);

  return (
    <div className="flex w-full flex-col gap-2">
      <Label className={cn("mr-2 text-foreground", error && 'text-red-500')}>
        {label}
        {required && <span className="ml-2 text-red-500">*</span>}
      </Label>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'pen' | 'type')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pen" className="flex items-center gap-2">
            <Pen className="h-4 w-4" />
            Draw
          </TabsTrigger>
          <TabsTrigger value="type" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Type
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pen" className="mt-2">
          <div className={cn("border rounded-md p-4", error && 'border-red-500')}>
            <canvas
              ref={canvasRef}
              width={400}
              height={200}
              className="w-full h-32 border border-muted-foreground/25 rounded bg-white touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearSignature}
              className="mt-2"
            >
              Clear
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="type" className="mt-2">
          <div className={cn("border rounded-md p-4 space-y-3", error && 'border-red-500')}>
            <Input
              value={typedSignature}
              onChange={(e) => handleTypedSignatureChange(e.target.value)}
              placeholder="Type your full name"
              className="w-full"
            />
            {typedSignature && (
              <div className="w-full h-32 border border-muted-foreground/25 rounded bg-white flex items-center justify-center">
                <span 
                  style={{ 
                    fontFamily: '"Brush Script MT", "Lucida Handwriting", "Segoe Print", cursive',
                    fontSize: '2rem',
                    color: '#000000'
                  }}
                >
                  {typedSignature}
                </span>
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearSignature}
              className="mt-2"
            >
              Clear
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      {helperText && (
        <p className={cn("text-[.8rem] text-muted-foreground", error && ("text-rose-500"))}>{helperText}</p>
      )}
    </div>
  );
}