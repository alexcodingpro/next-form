'use client';

import { UpdateFormContent } from '@/app/actions/form';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useDesginerStore } from '@/store/store';
import { CheckCircle2, Loader2, Save } from 'lucide-react';
import { useTransition, useState, useEffect, useCallback } from 'react';

export default function AutoSaveFormBtn({ id }: { id: number }) {
  const { elements } = useDesginerStore();
  const [loading, startTransition] = useTransition();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedElements, setLastSavedElements] = useState<string>('');
  const [autoSaved, setAutoSaved] = useState(false);

  // Initialize with current form content
  useEffect(() => {
    if (lastSavedElements === '') {
      const initialElements = JSON.stringify(elements);
      setLastSavedElements(initialElements);
    }
  }, [elements, lastSavedElements]); // Initialize when elements first load

  // Check for unsaved changes
  useEffect(() => {
    const currentElements = JSON.stringify(elements);
    const hasChanges = currentElements !== lastSavedElements && lastSavedElements !== '';
    setHasUnsavedChanges(hasChanges);
    
    if (hasChanges) {
      setAutoSaved(false);
    }
  }, [elements, lastSavedElements]);

  const updateFormContent = useCallback(async (showToast = true) => {
    if (loading) return false; // Prevent multiple saves
    
    try {
      const jsonElements = JSON.stringify(elements);
      
      if (jsonElements === lastSavedElements) {
        if (showToast) {
          toast({
            title: 'No Changes',
            description: 'No changes to save.',
          });
        }
        return true;
      }

      console.log('Saving form with elements:', elements.length);
      
      const result = await UpdateFormContent(id, jsonElements);
      
      if (!result) {
        throw new Error('Update failed - no result returned');
      }

      // Update last saved state only after successful save
      setLastSavedElements(jsonElements);
      setHasUnsavedChanges(false);
      setAutoSaved(true);

      if (showToast) {
        toast({
          title: 'Form Saved!',
          description: `Successfully saved ${elements.length} form elements.`,
        });
      }
      
      return true;
    } catch (error) {
      console.error('Save form error:', error);
      if (showToast) {
        toast({
          title: 'Save Failed',
          description: error instanceof Error ? error.message : 'Failed to save form. Please try again.',
          variant: 'destructive',
        });
      }
      return false;
    }
  }, [elements, id, lastSavedElements, loading]);

  // Auto-save every 30 seconds if there are unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges || loading) return;

    const autoSaveTimer = setTimeout(() => {
      startTransition(async () => {
        await updateFormContent(false);
      });
    }, 30000); // 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [hasUnsavedChanges, loading, updateFormContent]);

  const handleManualSave = () => {
    startTransition(async () => {
      await updateFormContent(true);
    });
  };

  // Show different states
  const getButtonContent = () => {
    if (loading) {
      return (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Saving...
        </>
      );
    }
    
    if (!hasUnsavedChanges && autoSaved) {
      return (
        <>
          <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
          Saved
        </>
      );
    }
    
    return (
      <>
        <Save className="mr-2 h-5 w-5" />
        {hasUnsavedChanges ? 'Save*' : 'Save'}
      </>
    );
  };

  return (
    <Button
      variant={hasUnsavedChanges ? 'default' : 'secondary'}
      className="gap-2"
      disabled={loading}
      onClick={handleManualSave}>
      {getButtonContent()}
    </Button>
  );
}