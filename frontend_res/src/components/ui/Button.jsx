import { forwardRef } from 'react';
import PropTypes from 'prop-types';

const buttonStyles = {
  default: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'bg-muted text-text hover:bg-border',
  ghost: 'bg-transparent text-text hover:bg-muted',
};

const Button = forwardRef(function Button(
  { className = '', variant = 'default', loading = false, children, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 ${buttonStyles[variant] ?? buttonStyles.default} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
});

Button.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'secondary', 'ghost']),
  loading: PropTypes.bool,
  children: PropTypes.node,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
};

export default Button;
