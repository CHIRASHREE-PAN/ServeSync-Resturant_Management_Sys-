import { forwardRef } from "react";
import PropTypes from "prop-types";

const Input = forwardRef(function Input(
  { className = "", ...props },
  ref
) {
  return (
    <input
      ref={ref}
      {...props}
      className={`w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${className}`}
    />
  );
});

Input.displayName = "Input";

Input.propTypes = {
  className: PropTypes.string,
};

export default Input;