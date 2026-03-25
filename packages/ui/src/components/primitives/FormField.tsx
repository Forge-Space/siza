import * as React from 'react';
import { cn } from '../../lib/utils';

/* ─────────────────────────────────────────────────────────────────────────
   FormField
   A composable form field wrapper: label + input slot + hint + error.
   Works with any input element passed as children.
   ───────────────────────────────────────────────────────────────────────── */

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  /** Unique id forwarded to the label's htmlFor and the inner input. */
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  /** Marks the field as required — adds a visible asterisk. */
  required?: boolean;
  /** Marks the field as optional — adds a subtle "(optional)" label. */
  optional?: boolean;
  children: React.ReactNode;
}

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  optional,
  children,
  className,
  ...props
}: FormFieldProps) {
  const descId = htmlFor ? `${htmlFor}-desc` : undefined;
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)} {...props}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="flex items-center gap-1 text-sm font-medium text-[--forge-text]"
        >
          {label}
          {required && (
            <span className="text-[--forge-error]" aria-hidden="true">
              *
            </span>
          )}
          {optional && (
            <span className="text-xs font-normal text-[--forge-text-muted]">(optional)</span>
          )}
        </label>
      )}

      {/* Inject id, aria-describedby and aria-invalid onto the child input.
          Only include an id in aria-describedby when that node is actually rendered. */}
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
            id: htmlFor,
            'aria-describedby': [
              hint && !error ? descId : undefined,
              error ? errorId : undefined,
            ]
              .filter(Boolean)
              .join(' ') || undefined,
            'aria-invalid': error ? (true as const) : undefined,
          } as React.HTMLAttributes<HTMLElement>)
        : children}

      {hint && !error && (
        <p id={descId} className="text-xs leading-relaxed text-[--forge-text-muted]">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="flex items-center gap-1 text-xs text-[--forge-error]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

FormField.displayName = 'FormField';

/* ─────────────────────────────────────────────────────────────────────────
   FormSection
   Groups related FormFields under a titled section with optional divider.
   ───────────────────────────────────────────────────────────────────────── */

export interface FormSectionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  divider?: boolean;
  children: React.ReactNode;
}

export function FormSection({
  title,
  description,
  divider = true,
  children,
  className,
  ...props
}: FormSectionProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        divider && 'border-b border-[--forge-divider] pb-6',
        className
      )}
      role="group"
      aria-label={typeof title === 'string' ? title : undefined}
      {...props}
    >
      {(title || description) && (
        <div className="mb-1">
          {title && (
            <p className="text-sm font-semibold text-[--forge-text]">{title}</p>
          )}
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-[--forge-text-muted]">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

FormSection.displayName = 'FormSection';
