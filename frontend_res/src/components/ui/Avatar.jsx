function Avatar({ name = 'User', className = '' }) {
  return (
    <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ${className}`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default Avatar;
