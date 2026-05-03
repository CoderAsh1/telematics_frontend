import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import heroImage from '../assets/hero.png';
import { signup } from '../api/auth';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await signup(fullName, email, password, phone);
      navigate('/verify-email');
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side: Signup Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-24 xl:px-32">
        <div className="max-w-md w-full mx-auto">
          {/* Logo Section */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tighter text-dark flex items-center gap-2">
              <span className="text-primary">BDPH</span>
              <span className="text-secondary font-light text-xl">GROUP</span>
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-dark">Create account</h2>
            <p className="text-slate-500 mt-2">Start managing your fleet with BDPH today.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-dark ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="John Doe"
                  className="input-field pl-11"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-dark ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="input-field pl-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-dark ml-1">Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="input-field pl-11"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-dark ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="input-field pl-11 pr-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 px-1">Must be at least 8 characters long.</p>
            </div>

            <div className="flex items-start gap-3 px-1 py-2">
              <input type="checkbox" className="mt-1 rounded border-slate-300 text-primary focus:ring-primary" required />
              <p className="text-xs text-slate-500 leading-tight">
                I agree to the <a href="#" className="text-primary font-semibold">Terms of Service</a> and <a href="#" className="text-primary font-semibold">Privacy Policy</a>.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/" className="font-bold text-dark hover:text-primary transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side: Hero Image (Shared with Login) */}
      <div className="hidden lg:block relative flex-1 bg-slate-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent z-10" />
        <img
          src={heroImage}
          alt="Telematics Hero"
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-90"
        />
        <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="glass-panel p-10 rounded-3xl max-w-md text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-dark mb-4">Precision Tracking</h3>
                <p className="text-slate-600">
                    Join hundreds of fleet managers who trust BDPH for their core telematics and asset management needs.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
