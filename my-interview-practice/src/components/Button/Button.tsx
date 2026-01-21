// Button.tsx
import React from 'react';
import styles from './Button.module.scss';

// Define props interface for TypeScript
interface ButtonProps {
  text: string;
  onClick: () => void;
  type?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  ariaLabel?: string;
}

const Button: React.FC<ButtonProps> = ({
  text,
  onClick,
  type = 'primary',
  disabled = false,
  ariaLabel
}) => {
  // Determine CSS class based on type
  const buttonClass = `${styles.button} ${styles[type]}`;
  
  return (
    <button
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || `Button: ${text}`}
      aria-disabled={disabled}
    >
      {text}
    </button>
  );
};

export default Button;