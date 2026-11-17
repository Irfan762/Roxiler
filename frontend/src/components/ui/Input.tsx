'use client';

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div>
        {label && (
          <label htmlFor={inputId} className="label-field">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn('input-field', error && 'border-red-400 focus:border-red-500 focus:ring-red-500', className)}
          {...props}
        />
        {hint && !error && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
        {error && <p className="error-text">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const textareaId = id || props.name;
    return (
      <div>
        {label && (
          <label htmlFor={textareaId} className="label-field">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn('input-field resize-none', error && 'border-red-400 focus:border-red-500 focus:ring-red-500', className)}
          {...props}
        />
        {hint && !error && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
        {error && <p className="error-text">{error}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
