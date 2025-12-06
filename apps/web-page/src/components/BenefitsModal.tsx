import { X, Crown, Star, Calendar, CheckCircle2, AlertCircle, TrendingUp, Ship, User, BookOpen, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface BenefitsModalProps {
  onClose: () => void;
}

export default function BenefitsModal({ onClose }: BenefitsModalProps) {
  const { user } = useAuth();

  const getMembershipDisplay = () => {
    if (user?.membership_type === 'black_elite') return 'BLACK ELITE';
    if (user?.membership_type === 'platinum') return 'PLATINUM';
    return 'GOLD';
  };

  const benefits = [
    {
      id: 1,
      name: 'Acceso a Yates',
      category: 'Experiencias',
      icon: Ship,
      description: 'Disfruta de nuestros yates exclusivos para navegar por el Caribe.',
      conditions: '1 vez al mes • Riviera Maya • Sujeto a disponibilidad',
      status: 'Disponible',
      action: 'Reservar'
    },
    {
      id: 2,
      name: 'Concierge 24/7',
      category: 'Concierge',
      icon: User,
      description: 'Asistencia personal en todo momento para tus necesidades.',
      conditions: 'Ilimitado • Global',
      status: 'Disponible',
      action: 'Usar con Concierge'
    },
    {
      id: 3,
      name: 'Masterclass de Inversión',
      category: 'Cursos',
      icon: BookOpen,
      description: 'Aprende estrategias de inversión con expertos globales.',
      conditions: 'Acceso total • Online',
      status: 'Usado',
      action: 'Ver Grabación'
    },
    {
      id: 4,
      name: 'Asesoría Inmobiliaria',
      category: 'Real Estate',
      icon: Home,
      description: 'Consultoría privada para inversiones en propiedades de lujo.',
      conditions: 'Bajo demanda • Presencial/Online',
      status: 'Disponible',
      action: 'Agendar'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl shadow-gold-900/20 overflow-hidden flex flex-col max-h-[85vh] animate-zoomIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white tracking-wide">Mis Beneficios</h2>
          <button 
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Card */}
          <div className="relative overflow-hidden rounded-2xl p-6 border border-gold-400/20">
            <div className="absolute inset-0 bg-gradient-to-br from-gold-400/20 via-black to-black" />
            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="w-4 h-4 text-gold-400" />
                    <span className="text-xs font-bold text-gold-400 tracking-widest uppercase">Nivel</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-wide">{getMembershipDisplay()}</h3>
                </div>
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Activa
                  </span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-white/60 font-light">
                  Tienes <span className="text-white font-semibold">12 créditos</span> disponibles este mes para usar en experiencias exclusivas.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
              <p className="text-xl font-bold text-white">3</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Usados</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
              <p className="text-xl font-bold text-gold-400">12</p>
              <p className="text-[10px] text-gold-400/60 uppercase tracking-wider mt-1">Disponibles</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
              <p className="text-xl font-bold text-white">2</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Reservas</p>
            </div>
          </div>

          {/* Benefits List */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest px-1">Tu Plan Incluye</h3>
            
            {benefits.map((benefit) => (
              <div key={benefit.id} className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/10 transition-colors group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center text-gold-400">
                      <benefit.icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-white">{benefit.name}</h4>
                      <span className="text-[10px] text-white/40 uppercase tracking-wider">{benefit.category}</span>
                    </div>
                  </div>
                  {benefit.status === 'Disponible' ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                      Disponible
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-white/40 bg-white/5 px-2 py-1 rounded-full border border-white/10">
                      {benefit.status}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-white/60 font-light leading-relaxed mb-4">
                  {benefit.description}
                </p>
                
                <div className="flex items-center gap-4 text-[10px] text-white/40 font-medium tracking-wide uppercase mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {benefit.conditions}
                  </span>
                </div>

                <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-gold-400 hover:text-black text-white text-xs font-bold uppercase tracking-widest transition-all duration-300 border border-white/10 hover:border-gold-400">
                  {benefit.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
