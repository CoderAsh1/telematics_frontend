import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, RefreshCw, ChevronLeft, ShieldCheck } from 'lucide-react';

const VerifyEmail = () => {
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();

  const handleResend = () => {
    setIsResending(true);
    setTimeout(() => setIsResending(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Back link */}
        <Link to="/signup" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-dark mb-8 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back to signup
        </Link>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 p-10 text-center border border-slate-100">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>

          <h2 className="text-3xl font-bold text-dark mb-3">Verification Pending</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Your account has been created successfully. Our team is currently reviewing your details. 
            You will receive an email once your account is activated.
          </p>

          <div className="space-y-4">
            <button 
                onClick={() => navigate('/')}
                className="btn-primary flex items-center justify-center gap-2"
            >
              Return to Login
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-10 text-sm text-slate-400">
            Didn't receive the email? Check your spam folder or contact support.
          </p>
        </div>
        
        <div className="mt-12 text-center">
            <h1 className="text-xl font-bold tracking-tighter text-dark opacity-30 flex items-center justify-center gap-2">
              <span className="text-primary">BDPH</span>
              <span className="text-secondary font-light">GROUP</span>
            </h1>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
