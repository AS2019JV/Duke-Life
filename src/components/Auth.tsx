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
      {/* Background Image with Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop')`,
          filter: 'blur(500px) grayscale(100%)',
          transform: 'scale(1.1)',
        }}
      />
      
      {/* Enhanced Gradient Overlay - Lighter than before */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60 pointer-events-none" />
      
      {/* Subtle vignette effect */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/30 pointer-events-none" />
      
      {/* Title Animation */}
      <div 
        className={`mb-16 text-center transform transition-all duration-1000 ease-out relative z-10 ${
          showTitle 
            ? 'opacity-100 translate-z-0 scale-100 translate-y-0' 
            : 'opacity-0 scale-90 translate-y-10'
        }`}
      >
        <h1 
          className="text-5xl md:text-7xl font-extralight tracking-[0.15em] text-gold-400 drop-shadow-2xl"
          style={{
            textShadow: '0 0 40px rgba(251, 191, 36, 0.3), 0 4px 20px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.9)'
          }}
        >
          DUKE LIFE
        </h1>
        <div className="flex items-center justify-center gap-4 mt-8">
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-gold-400/60 to-gold-400/40"></div>
          <p 
            className={`text-gold-300 text-xs tracking-[0.5em] font-light transition-all duration-1000 delay-500 ${
              showTitle ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              textShadow: '0 0 20px rgba(251, 191, 36, 0.4), 0 2px 10px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.9)'
            }}
          >
            EXCELENCIA REDEFINIDA
          </p>
          <div className="h-px w-12 bg-gradient-to-l from-transparent via-gold-400/60 to-gold-400/40"></div>
        </div>
      </div>

      {/* Auth Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Improved Backdrop Card */}
        <div className="relative backdrop-blur-3xl bg-gradient-to-b from-white/[0.12] to-white/[0.06] border border-white/20 rounded-3xl p-12 shadow-[0_8px_32px_0_rgba(0,0,0,0.5),0_0_80px_0_rgba(251,191,36,0.1)]">
          {/* Subtle top accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />
          
          {step === 1 ? (
            <form onSubmit={handleEmailSubmit} className="space-y-10 animate-fadeIn">
              {/* Email Section with decorative lines */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-400/30"></div>
                  <label 
                    className="text-xs font-medium text-gold-300 uppercase tracking-[0.3em]"
                    style={{
                      textShadow: '0 0 15px rgba(251, 191, 36, 0.3), 0 2px 8px rgba(0, 0, 0, 0.7)'
                    }}
                  >
                    Bienvenido
                  </label>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-400/30"></div>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border-b-2 border-white/30 px-4 py-4 text-white placeholder-white/40 focus:outline-none focus:border-gold-400 focus:bg-white/10 transition-all duration-300 text-lg font-light text-center rounded-t-lg"
                  placeholder="correo@ejemplo.com"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="group w-full bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-black font-semibold py-4 rounded-full shadow-lg shadow-gold-900/30 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-gold-900/40 flex items-center justify-center gap-3"
              >
                <span className="tracking-widest text-sm uppercase">Continuar</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-10 animate-fadeIn">
              {/* Password Section with decorative lines */}
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-white/50 hover:text-gold-400 flex items-center gap-1 transition-colors uppercase tracking-wider font-medium"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Volver
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-gradient-to-r from-transparent to-gold-400/40"></div>
                    <span 
                      className="text-xs font-medium text-gold-300 uppercase tracking-[0.3em]"
                      style={{
                        textShadow: '0 0 15px rgba(251, 191, 36, 0.3), 0 2px 8px rgba(0, 0, 0, 0.7)'
                      }}
                    >
                      Contraseña
                    </span>
                    <div className="h-px w-8 bg-gradient-to-l from-transparent to-gold-400/40"></div>
                  </div>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border-b-2 border-white/30 px-4 py-4 text-white placeholder-white/40 focus:outline-none focus:border-gold-400 focus:bg-white/10 transition-all duration-300 text-lg font-light text-center rounded-t-lg"
                  placeholder="••••••••"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-black font-semibold py-4 rounded-full shadow-lg shadow-gold-900/30 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-gold-900/40 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="tracking-widest text-sm uppercase">Iniciar Sesión</span>
                )}
              </button>
              
              <div className="text-center">
                <button type="button" className="text-xs text-white/50 hover:text-gold-400 transition-colors uppercase tracking-[0.2em] border-b border-transparent hover:border-gold-400/50 pb-1">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </form>
          )}

          {error && (
            <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-300 text-sm text-center animate-shake tracking-wide font-light backdrop-blur-sm">
              {error}
            </div>
          )}
          
          {/* Subtle bottom accent line */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />
        </div>

        {/* Bottom Message with decorative accent */}
        <div className="mt-12 text-center relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/20"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gold-400/60 shadow-lg shadow-gold-400/50"></div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/20"></div>
          </div>
          <p 
            className="text-white/50 text-xs tracking-[0.2em] font-light uppercase"
            style={{
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)'
            }}
          >
            ¿Nuevo en Duke Life?
          </p>
          <button className="mt-3 text-gold-400 font-medium text-sm tracking-wider hover:text-gold-300 transition-colors border-b border-transparent hover:border-gold-400/50 pb-1">
            Solicitar membresía
          </button>
        </div>
      </div>
    </div>
  );
}
