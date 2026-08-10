import PropTypes from 'prop-types';

function Card({ children, className = '', interactive = false, ...props }) {
  return (
    <div
      className={`surface-card p-6 ${interactive ? 'hover-lift cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  interactive: PropTypes.bool,
};

export default Card;
