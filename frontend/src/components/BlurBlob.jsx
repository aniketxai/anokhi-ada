export default function BlurBlob({ className = '', color = 'bg-primary' }) {
  return (
    <div
      className={`absolute rounded-full blur-blob opacity-10 pointer-events-none ${color} ${className}`}
    />
  );
}
