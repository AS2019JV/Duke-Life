import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, ChevronLeft, Loader2 } from 'lucide-react';

export default function Auth() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const { signIn } = useAuth();

  useEffect(() => {
    // Trigger title animation on mount
    setShowTitle(true);
  }, []);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err) {
      setError('Credenciales inválidas. Por favor intenta de nuevo.');
      setStep(1); // Go back to email on error? Or stay on password? Let's stay on password usually, but if email is wrong...
      // Actually, standard is to stay on password unless user wants to change email.
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Enhanced Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80 pointer-events-none" />
      
      {/* Title Animation */}
      <div 
        className={`mb-16 text-center transform transition-all duration-1000 ease-out relative z-10 ${
          showTitle 
            ? 'opacity-100 translate-z-0 scale-100 translate-y-0' 
            : 'opacity-0 scale-90 translate-y-10'
        }`}
      >
        <h1 className="text-4xl md:text-6xl font-extralight tracking-[0.15em] text-gold-400/90 drop-shadow-2xl">
          DUKE LIFE
        </h1>
        <div className="flex items-center justify-center gap-3 mt-6">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-gold-400/40"></div>
          <p className={`text-gold-400/60 text-[10px] tracking-[0.5em] font-light transition-all duration-1000 delay-500 ${
            showTitle ? 'opacity-100' : 'opacity-0'
          }`}>
            EXCELENCIA REDEFINIDA
          </p>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-gold-400/40"></div>
        </div>
      </div>

      {/* Auth Container */}
      <div className="w-full max-w-sm relative z-10">
        {/* Improved Backdrop Card */}
        <div className="relative backdrop-blur-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.03] border border-white/10 rounded-3xl p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
          {/* Subtle top accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-gold-400/30 to-transparent" />
          
          {step === 1 ? (
            <form onSubmit={handleEmailSubmit} className="space-y-10 animate-fadeIn">
              {/* Email Section with decorative lines */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-400/20"></div>
                  <label className="text-[10px] font-light text-gold-400/80 uppercase tracking-[0.3em]">
                    Bienvenido
                  </label>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-400/20"></div>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-white/20 px-2 py-3 text-white placeholder-white/20 focus:outline-none focus:border-gold-400 transition-all duration-300 text-lg font-light text-center"
                  placeholder="correo@ejemplo.com"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="group w-full bg-gold-400 hover:bg-gold-300 text-black font-medium py-4 rounded-full shadow-lg shadow-gold-900/20 transition-all duration-500 transform hover:scale-[1.02] flex items-center justify-center gap-3"
              >
                <span className="tracking-widest text-xs uppercase">Continuar</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-10 animate-fadeIn">
              {/* Password Section with decorative lines */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[9px] text-white/40 hover:text-gold-400 flex items-center gap-1 transition-colors uppercase tracking-wider"
                  >
                    <ChevronLeft className="w-3 h-3" />
                    Volver
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="h-px w-6 bg-gradient-to-r from-transparent to-gold-400/30"></div>
                    <span className="text-[10px] font-light text-gold-400/80 uppercase tracking-[0.3em]">
                      Contraseña
                    </span>
                    <div className="h-px w-6 bg-gradient-to-l from-transparent to-gold-400/30"></div>
                  </div>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-white/20 px-2 py-3 text-white placeholder-white/20 focus:outline-none focus:border-gold-400 transition-all duration-300 text-lg font-light text-center"
                  placeholder="••••••••"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold-400 hover:bg-gold-300 text-black font-medium py-4 rounded-full shadow-lg shadow-gold-900/20 transition-all duration-500 transform hover:scale-[1.02] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="tracking-widest text-xs uppercase">Iniciar Sesión</span>
                )}
              </button>
              
              <div className="text-center">
                <button type="button" className="text-[9px] text-white/40 hover:text-gold-400 transition-colors uppercase tracking-[0.2em] border-b border-transparent hover:border-gold-400/40">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </form>
          )}

          {error && (
            <div className="mt-8 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-red-400 text-xs text-center animate-shake tracking-wide font-light">
              {error}
            </div>
          )}
          
          {/* Subtle bottom accent line */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-gold-400/30 to-transparent" />
        </div>

        {/* Bottom Message with decorative accent */}
        <div className="mt-12 text-center relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/10"></div>
            <div className="w-1 h-1 rounded-full bg-gold-400/40"></div>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/10"></div>
          </div>
          <p className="text-white/30 text-[10px] tracking-[0.2em] font-light uppercase">
            ¿Nuevo en Duke Life?
          </p>
          <button className="mt-2 text-gold-400 font-light text-xs tracking-wider hover:text-gold-300 transition-colors border-b border-transparent hover:border-gold-400/40">
            Solicitar membresía
          </button>
        </div>
      </div>
    </div>
  );
}
