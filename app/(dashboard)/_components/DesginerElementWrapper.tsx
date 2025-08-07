import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDesginerStore } from '@/store/store';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Loader2, Trash } from 'lucide-react';
import { useState } from 'react';
import { FormElementInstance, FormElements } from './FormElements';
import { toast } from '@/components/ui/use-toast';
import { deleteElementInstance } from '@/app/actions/form';
import { useRouter } from 'next/navigation';

export default
  function DesginerElementWrapper({
    element,
    formId,
  }: {
    element: FormElementInstance;
    formId: number;
  }) {
  const router = useRouter()
  const [mouseOver, setMouseOver] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const DesignerElement = FormElements[element.type].designerComponent;
  const { removeElement, setSelectedElement } =
    useDesginerStore();

  const topHalf = useDroppable({
    id: element.id + '-top',
    data: {
      type: element.type,
      elementId: element.id,
      isTopHalfDesignerElement: true,
    },
  });

  const bottomHalf = useDroppable({
    id: element.id + '-bottom',
    data: {
      type: element.type,
      elementId: element.id,
      isTopHalfDesignerElement: true,
    },
  });

  const draggable = useDraggable({
    id: element.id + '-drag-handle',
    data: {
      type: element.type,
      elementId: element.id,
      isDesignerElement: true,
    },
  });

  async function handleDeleteElement() {
    if (isDeleting) return; // Prevent multiple clicks
    
    setIsDeleting(true);
    
    try {
      // First, delete from database
      await deleteElementInstance(formId, element.id);
      
      // Only remove from local state if database operation succeeded
      removeElement(element.id);
      
      toast({
        title: "Success",
        description: "Element deleted successfully",
      });

    } catch (error) {
      console.error('Delete element error:', error);
      toast({
        title: "Error",
        description: "Failed to delete element. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div
        ref={draggable.setNodeRef}
        {...draggable.attributes}
        {...draggable.listeners}
        className="relative flex h-[120px] flex-col rounded-md text-foreground ring-1 ring-inset ring-accent hover:cursor-pointer"
        onMouseOver={() => setMouseOver(true)}
        onMouseLeave={() => setMouseOver(false)}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedElement(element);
        }}>
        <div
          ref={topHalf.setNodeRef}
          className="absolute h-1/2 w-full rounded-t-md"
        />
        <div
          ref={bottomHalf.setNodeRef}
          className="absolute bottom-0 h-1/2 w-full rounded-b-md"
        />
        {mouseOver && (
          <>
            <div className="absolute right-0 z-10 h-full">
              <Button
                className="flex h-full justify-center rounded-md rounded-l-none border bg-red-500"
                size={'icon'}
                variant={'outline'}
                disabled={isDeleting}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteElement();
                }}>
                {isDeleting ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Trash className="h-6 w-6" />
                )}
              </Button>
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse">
              <p>Click for properties or drag to move</p>
            </div>
          </>
        )}
        {topHalf.isOver && (
          <div className="absolute top-0 h-[8px] w-full rounded-md rounded-b-none bg-primary" />
        )}
        <div
          className={cn(
            'pointer-events-none flex h-[120px] w-full items-center rounded-md bg-accent/40 px-4 py-2',
            mouseOver && 'opacity-30'
          )}>
          <DesignerElement elementInstance={element} />
        </div>
        {bottomHalf.isOver && (
          <div className="absolute bottom-0 h-[8px] w-full rounded-md rounded-t-none bg-primary" />
        )}
      </div>
    </>
  );
}
