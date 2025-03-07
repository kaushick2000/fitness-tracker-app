import React from 'react';
import './Ui.css'; // Make sure to create this CSS file with the previous CSS

// Button Component
export const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = '', 
  type = 'button',
  ...props 
}) => {
  return (
    <button 
      className={`btn btn-${variant} ${className}`} 
      onClick={onClick}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
};

// Input Component
export const Input = ({ 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  className = '',
  ...props 
}) => {
  return (
    <input 
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`form-control ${className}`}
      {...props}
    />
  );
};

// Card Components
export const Card = ({ children, className = '' }) => {
  return <div className={`card ${className}`}>{children}</div>;
};

export const CardHeader = ({ children, className = '' }) => {
  return <div className={`card-header ${className}`}>{children}</div>;
};

export const CardTitle = ({ children, className = '' }) => {
  return <h2 className={`card-title ${className}`}>{children}</h2>;
};

export const CardContent = ({ children, className = '' }) => {
  return <div className={`card-body ${className}`}>{children}</div>;
};

// Dialog Components
export const Dialog = ({ 
  isOpen, 
  onClose, 
  children,
  className = ''
}) => {
  return (
    <div className={`dialog ${isOpen ? 'open' : ''} ${className}`}>
      {children}
    </div>
  );
};

export const DialogTrigger = ({ children, onClick }) => {
  return (
    <div onClick={onClick}>
      {children}
    </div>
  );
};

export const DialogContent = ({ children, className = '' }) => {
  return (
    <div className={`dialog-content ${className}`}>
      {children}
    </div>
  );
};

export const DialogHeader = ({ children, className = '' }) => {
  return (
    <div className={`dialog-header ${className}`}>
      {children}
    </div>
  );
};

export const DialogTitle = ({ children, className = '' }) => {
  return (
    <h2 className={`dialog-title ${className}`}>
      {children}
    </h2>
  );
};

// Select Components
export const Select = ({ 
  children, 
  value, 
  onChange, 
  className = '',
  ...props 
}) => {
  return (
    <div className="select-wrapper">
      <select 
        value={value}
        onChange={onChange}
        className={`select ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="select-arrow">▼</div>
    </div>
  );
};

export const SelectTrigger = ({ children, onClick, className = '' }) => {
  return (
    <div 
      className={`select-trigger ${className}`} 
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const SelectValue = ({ children, className = '' }) => {
  return (
    <div className={`select-value ${className}`}>
      {children}
    </div>
  );
};

export const SelectContent = ({ children, className = '' }) => {
  return (
    <div className={`select-content ${className}`}>
      {children}
    </div>
  );
};

export const SelectItem = ({ value, children, className = '' }) => {
  return (
    <option 
      value={value} 
      className={`select-item ${className}`}
    >
      {children}
    </option>
  );
};