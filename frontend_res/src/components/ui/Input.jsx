import { forwardRef } from "react";
import PropTypes from "prop-types";

const Input = forwardRef(function Input({ className = "", ...props }, ref) {
  return (
    <input
      ref={ref}
      {...props}
      className={`h-11 w-full rounded-input border border-border bg-card px-3.5 text-sm text-text outline-none transition-all duration-200 ease-smooth placeholder:text-secondary-text/70 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70 ${className}`}
    />
  );
});

Input.displayName = "Input";

Input.propTypes = {
  className: PropTypes.string,
};

export default Input;
