import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <Loader2 className="w-16 h-16 animate-spin text-black" />
      <span className="ml-4 font-black uppercase tracking-widest text-2xl">LOADING...</span>
    </div>
  );
}
