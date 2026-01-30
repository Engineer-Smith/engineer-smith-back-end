import { Hammer } from 'lucide-react';

const AuthHeader = () => {
  return (
    <div className="text-center mb-8">
      <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center glow-amber">
        <Hammer className="w-10 h-10 text-[#0a0a0b]" />
      </div>
      <h2 className="font-mono text-2xl font-bold text-gradient mb-2">
        EngineerSmith
      </h2>
      <p className="text-[#a1a1aa]">
        Comprehensive Coding Assessment Platform
      </p>
    </div>
  );
};

export default AuthHeader;
