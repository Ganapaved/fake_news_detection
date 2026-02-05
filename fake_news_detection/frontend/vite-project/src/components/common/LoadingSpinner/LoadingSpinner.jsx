import { Loader2 } from 'lucide-react';
import './LoadingSpinner.css';

export function LoadingSpinner({ size = 'md', text = '' }) {
  const sizeClass = `spinner-${size}`;

  return (
    <div className="spinner-container">
      <Loader2 className={`spinner ${sizeClass}`} />
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
}
