import { Check, Info } from 'lucide-react';
import { usePlanner } from '../context/PlannerContext.jsx';

export default function ToastRegion() {
  const { toast } = usePlanner();
  if (!toast) return null;
  const Icon = toast.type === 'error' ? Info : Check;
  return <div className={`toast toast-${toast.type}`} role="status" key={toast.id}><Icon size={18} /><span>{toast.message}</span></div>;
}