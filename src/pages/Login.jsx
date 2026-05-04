import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import heroImage from '../assets/hero.png';
import { login } from '../api/auth';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) navigate('/dashboard');
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white selection:bg-primary/20">
      {/* Left side: Content & Form */}
      <div className="w-full lg:w-[45%] flex flex-col p-8 lg:p-16 xl:p-24 justify-between bg-white relative z-20">
        <div className="max-w-md w-full mx-auto lg:mx-0">
          <div className="flex items-center gap-3 mb-24 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-dark uppercase">BDPH <span className="font-light text-slate-400">Group</span></h1>
          </div>

          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 stagger-1">
            <div className="space-y-4">
              <h2 className="text-5xl font-black text-dark tracking-tighter leading-none">Sign in.</h2>
              <p className="text-slate-500 font-medium text-lg">Enter your details to access your fleet.</p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-sm animate-shake">
                <AlertCircle size={20} className="shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 group">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    className="input-field pl-14"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Password</label>
                  <a href="#" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-accent">Forgot?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="input-field pl-14 pr-14"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary group">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-8 text-sm text-slate-500 font-medium">
              New to BDPH?{' '}
              <Link to="/signup" className="text-dark font-black hover:text-primary transition-colors border-b-2 border-slate-100 pb-0.5 hover:border-primary/30">
                Create an account
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
          &copy; {new Date().getFullYear()} BDPH Global Systems &bull; Built for precision
        </div>
      </div>

      {/* Right side: Visual */}
      <div className="hidden lg:block flex-1 relative bg-[#0F172A] overflow-hidden">
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-primary/20 via-transparent to-transparent pointer-events-none" />
        <img
          src={heroImage}
          alt="Fleet Management"
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity scale-110"
        />
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-20 px-12">
          <div className="glass-panel p-12 rounded-[40px] animate-in zoom-in-95 duration-1000">
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">Coming Soon</span>
                <h3 className="text-4xl font-black text-dark tracking-tighter leading-tight">Advanced Fleet Analytics.</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  Monitor your entire logistics operation from a single, unified interface. Built for speed, safety, and efficiency.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-3xl font-black text-dark tracking-tight">100%</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Telemetry</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-dark tracking-tight">Real-time</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Global Coverage</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-[-10%] right-[-10%] w-1/2 h-1/2 bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-1/2 h-1/2 bg-blue-500/10 blur-[120px] rounded-full" />
      </div>
    </div>
  );
};

export default Login;
