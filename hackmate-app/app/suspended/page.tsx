import { AlertCircle } from 'lucide-react';

export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col px-4 text-center animate-fade-in">
      <div className="bg-white p-8 md:p-12 border-4 border-black shadow-[8px_8px_0_0_#000] flex flex-col items-center max-w-lg w-full">
        <AlertCircle className="w-24 h-24 text-red-500 mb-6" />
        <h1 className="text-4xl md:text-5xl font-black uppercase text-black mb-4 tracking-tight">Account Suspended</h1>
        <p className="text-lg md:text-xl font-bold text-gray-700 leading-relaxed mb-8">
          Your account has been suspended by the administrator. You no longer have access to this application.
        </p>
        <div className="w-full h-1 bg-black mb-8" />
        <p className="text-md font-bold text-gray-500 uppercase">
          Please contact support for more information.
        </p>
      </div>
    </div>
  );
}
