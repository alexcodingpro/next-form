import { UpdateFormContent } from '@/app/actions/form';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useDesginerStore } from '@/store/store';
import { Loader2, Save } from 'lucide-react';
import { useTransition, useState, useEffect } from 'react';

export default function SaveFormBtn({ id }: { id: number }) {
  const { elements } = useDesginerStore();
  const [loading, startTransition] = useTransition();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedElements, setLastSavedElements] = useState<string>('');

  // Check for unsaved changes
  useEffect(() => {
    const currentElements = JSON.stringify(elements);
    setHasUnsavedChanges(currentElements !== lastSavedElements);
  }, [elements, lastSavedElements]);

  const updateFormContent = async () => {
    if (loading) return; // Prevent multiple saves
    
    try {
      const jsonElements = JSON.stringify(elements);
      
      if (jsonElements === lastSavedElements) {
        toast({
          title: 'No Changes',
          description: 'No changes to save.',
        });
        return;
      }

      console.log('Saving form with elements:', elements.length);
      
      const result = await UpdateFormContent(id, jsonElements);
      
      if (!result) {
        throw new Error('Update failed - no result returned');
      }

      // Update last saved state only after successful save
      setLastSavedElements(jsonElements);
      setHasUnsavedChanges(false);

      toast({
        title: 'Form Saved!',
        description: `Successfully saved ${elements.length} form elements.`,
      });
    } catch (error) {
      console.error('Save form error:', error);
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Failed to save form. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      variant={hasUnsavedChanges ? 'default' : 'secondary'}
      className="gap-2"
      disabled={loading}
      onClick={() => {
        startTransition(updateFormContent);
      }}>
      {loading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <Save className="mr-2 h-5 w-5" />
      )}
      {hasUnsavedChanges ? 'Save*' : 'Save'}
    </Button>
  );
}
