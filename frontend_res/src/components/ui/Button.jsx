import { forwardRef } from 'react';
import PropTypes from 'prop-types';

const buttonStyles = {
  default: 'bg-primary text-white shadow-card hover:bg-primary-hover',
  secondary: 'bg-muted text-text border border-border hover:bg-divider',
  outline: 'bg-transparent text-text border border-border hover:bg-muted',
  ghost: 'bg-transparent text-text hover:bg-muted',
  accent: 'bg-accent text-text hover:brightness-95',
  danger: 'bg-error text-white hover:brightness-95',
};

const buttonSizes = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

const Button = forwardRef(function Button(
  {
    className = '',
    variant = 'default',
    size = 'md',
    loading = false,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-button font-semibold tracking-tight transition-all duration-200 ease-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 ${
        buttonSizes[size] ?? buttonSizes.md
      } ${buttonStyles[variant] ?? buttonStyles.default} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
});

Button.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf([
    'default',
    'secondary',
    'outline',
    'ghost',
    'accent',
    'danger',
  ]),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  loading: PropTypes.bool,
  children: PropTypes.node,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
};

export default Button;
