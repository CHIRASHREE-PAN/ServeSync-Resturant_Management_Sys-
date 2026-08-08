import PropTypes from 'prop-types';

function Card({ children, className = '', ...props }) {
  return (
    <div className={`rounded-[20px] border border-border bg-card p-5 shadow-soft ${className}`} {...props}>
      {children}
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Card;
