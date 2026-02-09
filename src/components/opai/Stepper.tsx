import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

/**
 * Stepper - Indicador de progreso por pasos
 * 
 * Muestra una línea de progreso con círculos para cada paso.
 */
export function Stepper({ steps, currentStep, onStepClick, className }: StepperProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Progress bar */}
      <div className="mb-3 h-1 w-full rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${((currentStep + 0.5) / steps.length) * 100}%` }}
        />
      </div>
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-5">
        {steps.map((label, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <button
              key={index}
              type="button"
              onClick={() => onStepClick?.(index)}
              disabled={!onStepClick}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 py-2 rounded-lg transition-colors min-w-0",
                onStepClick && "cursor-pointer hover:bg-accent/50",
                !onStepClick && "cursor-default"
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all',
                  isCompleted && 'border-primary bg-primary text-primary-foreground',
                  isCurrent && 'border-primary bg-accent text-primary',
                  !isCompleted && !isCurrent && 'border-border bg-background text-muted-foreground'
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span
                className={cn(
                  'text-xs font-medium truncate w-full text-center',
                  isCurrent && 'text-foreground',
                  !isCurrent && 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
