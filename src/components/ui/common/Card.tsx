import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string | ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function Card({ children, title, footer, className = '', contentClassName = '' }: CardProps) {
  return (
    <div className={`card bg-base-100 border border-base-300 shadow-sm ${className}`}>
      {title && (
        <div className="card-title p-4 border-b border-base-200">
          {typeof title === 'string' ? <h3 className="text-lg font-medium">{title}</h3> : title}
        </div>
      )}
      <div className={`card-body ${contentClassName}`}>
        {children}
      </div>
      {footer && (
        <div className="card-actions justify-end border-t border-base-200 p-4">
          {footer}
        </div>
      )}
    </div>
  );
} 