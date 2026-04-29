import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import heroImage from '../assets/hero.png';
import { login } from '../api/auth';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await login(email, password);
      console.log('Login success:', data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-24 xl:px-32">
        <div className="max-w-md w-full mx-auto">
          {/* Logo Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tighter text-dark flex items-center gap-2">
              <span className="text-primary">BDPH</span>
              <span className="text-secondary font-light text-2xl">GROUP</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Telematics Management Suite</p>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-dark">Welcome back</h2>
            <p className="text-slate-500 mt-2">Please enter your details to sign in.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-semibold text-dark">Password</label>
                <a href="#" className="text-xs font-semibold text-primary hover:underline">Forgot password?</a>
              </div>
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
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-dark hover:text-primary transition-colors">
              Create an account
            </Link>
          </div>
        </div>
        
        {/* Footer info */}
        <div className="mt-auto py-8 text-xs text-slate-400">
          &copy; {new Date().getFullYear()} BDPH Group. All rights reserved.
        </div>
      </div>

      {/* Right Side: Hero Image */}
      <div className="hidden lg:block relative flex-1 bg-slate-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent z-10" />
        <img
          src={heroImage}
          alt="Telematics Hero"
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-90 scale-105 hover:scale-100 transition-transform duration-[10s] ease-linear"
        />
        
        {/* Floating Stats or Overlay */}
        <div className="absolute bottom-12 left-12 right-12 z-20">
          <div className="glass-panel p-8 rounded-2xl max-w-lg">
            <h3 className="text-xl font-bold text-dark mb-2">Real-time Fleet Tracking</h3>
            <p className="text-slate-600 leading-relaxed">
              Experience the power of advanced telematics with the BDPH Suite. 
              Monitor FMB920 devices, track vehicle status, and optimize your operations with precision.
            </p>
            <div className="mt-6 flex gap-6">
              <div>
                <p className="text-primary font-bold text-2xl">99.9%</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Uptime</p>
              </div>
              <div className="border-l border-slate-200 h-10" />
              <div>
                <p className="text-primary font-bold text-2xl">Real-time</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Updates</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
