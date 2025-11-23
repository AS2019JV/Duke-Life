import { ReactNode } from 'react';

export default function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto bg-black border-8 border-gray-700 rounded-3xl shadow-2xl overflow-hidden">
        <div className="h-[85vh] rounded-2xl bg-[#0a0a0a] relative flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
