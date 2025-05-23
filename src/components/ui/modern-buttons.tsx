import React from 'react';

// Button variants
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'success' | 'danger';

// Common button props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  className?: string;
}

// Regular button component
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  loadingText,
  icon,
  className = '',
  ...props
}) => {
  // Determine button class based on variant
  const buttonClass = `btn btn-${variant} ${isLoading ? 'btn-loading' : ''} ${className}`;
  
  return (
    <button className={buttonClass} {...props}>
      {isLoading && <span className="btn-spinner"></span>}
      {icon && !isLoading && <span className="btn-icon">{icon}</span>}
      {isLoading && loadingText ? loadingText : children}
    </button>
  );
};

// Icon button component
interface IconButtonProps extends Omit<ButtonProps, 'loadingText'> {
  title?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  variant = 'primary',
  icon,
  title,
  className = '',
  ...props
}) => {
  // Determine button class based on variant
  const buttonClass = `btn btn-icon ${variant !== 'primary' ? `btn-${variant}` : ''} ${className}`;
  
  return (
    <button className={buttonClass} title={title} {...props}>
      {icon || children}
    </button>
  );
};

// Loading button that automatically shows spinner
export const LoadingButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} isLoading={true} />;
};

// Primary button (default style)
export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => {
  return <Button {...props} variant="primary" />;
};

// Secondary button
export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => {
  return <Button {...props} variant="secondary" />;
};

// Outline button
export const OutlineButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => {
  return <Button {...props} variant="outline" />;
};

// Success button
export const SuccessButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => {
  return <Button {...props} variant="success" />;
};

// Danger button
export const DangerButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => {
  return <Button {...props} variant="danger" />;
};

// Edit icon button
interface EditButtonProps extends Omit<IconButtonProps, 'icon' | 'variant'> {
  onEdit: () => void;
}

export const EditButton: React.FC<EditButtonProps> = ({ onEdit, ...props }) => {
  return (
    <IconButton 
      title="Edit" 
      onClick={onEdit} 
      {...props}
    >
      <svg viewBox="0 0 24 24">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z"/>
      </svg>
    </IconButton>
  );
};

// Delete icon button
interface DeleteButtonProps extends Omit<IconButtonProps, 'icon' | 'variant'> {
  onDelete: () => void;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({ onDelete, ...props }) => {
  return (
    <IconButton 
      variant="danger" 
      title="Delete" 
      onClick={onDelete} 
      {...props}
    >
      <svg viewBox="0 0 24 24">
        <path d="M3 6h18"/>
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        <rect x="5" y="6" width="14" height="14" rx="2"/>
        <path d="M10 11v6"/>
        <path d="M14 11v6"/>
      </svg>
    </IconButton>
  );
};

// Add icon button
interface AddButtonProps extends Omit<IconButtonProps, 'icon' | 'variant'> {
  onAdd: () => void;
}

export const AddButton: React.FC<AddButtonProps> = ({ onAdd, ...props }) => {
  return (
    <IconButton 
      variant="success" 
      title="Add" 
      onClick={onAdd} 
      {...props}
    >
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v8M8 12h8"/>
      </svg>
    </IconButton>
  );
}; 