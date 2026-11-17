'use client';
import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
export const Input = forwardRef(({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (<div>
        {label && (<label htmlFor={inputId} className="label-field">
            {label}
          </label>)}
        <input ref={ref} id={inputId} className={cn('input-field', error && 'border-red-400 focus:border-red-500 focus:ring-red-500', className)} {...props}/>
        {hint && !error && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
        {error && <p className="error-text">{error}</p>}
      </div>);
});
Input.displayName = 'Input';
export const Textarea = forwardRef(({ label, error, hint, className, id, ...props }, ref) => {
    const textareaId = id || props.name;
    return (<div>
        {label && (<label htmlFor={textareaId} className="label-field">
            {label}
          </label>)}
        <textarea ref={ref} id={textareaId} className={cn('input-field resize-none', error && 'border-red-400 focus:border-red-500 focus:ring-red-500', className)} {...props}/>
        {hint && !error && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
        {error && <p className="error-text">{error}</p>}
      </div>);
});
Textarea.displayName = 'Textarea';
