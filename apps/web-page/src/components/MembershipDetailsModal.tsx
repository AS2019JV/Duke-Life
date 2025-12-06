import { X, Crown, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface MembershipDetailsModalProps {
  onClose: () => void;
}

export default function MembershipDetailsModal({ onClose }: MembershipDetailsModalProps) {
  const { user } = useAuth();

  const getMembershipDisplay = () => {
    if (user?.membership_type === 'black_elite') return 'BLACK ELITE';
    if (user?.membership_type === 'platinum') return 'PLATINUM';
    return 'GOLD';
  };

  const inclusions = [
    '12 Créditos mensuales para experiencias',
    'Acceso ilimitado a Smart Concierge 24/7',
    'Descuentos exclusivos con partners globales',
    'Acceso prioritario a eventos Duke Life',
    'Invitaciones a Masterclasses mensuales',
    'Asesoría en inversiones inmobiliarias'
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl shadow-gold-900/20 overflow-hidden flex flex-col max-h-[85vh] animate-zoomIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white tracking-wide">Detalles de Membresía</h2>
          <button 
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Main Info Card */}
          <div className="relative overflow-hidden rounded-2xl p-8 border border-gold-400/30 group">
            <div className="absolute inset-0 bg-gradient-to-br from-gold-900/20 via-black to-black" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/10 rounded-full blur-3xl group-hover:bg-gold-400/20 transition-colors" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-gold-400" />
                    <span className="text-xs font-bold text-gold-400 tracking-widest uppercase">Membresía</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-wide">{getMembershipDisplay()}</h3>
                  <p className="text-sm text-white/60 font-medium">Plan Anual</p>
                </div>
                <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Activa
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Inicio</p>
                  <p className="text-sm text-white font-medium">01 Ene 2024</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Renovación</p>
                  <p className="text-sm text-white font-medium">01 Ene 2025</p>
                </div>
              </div>
            </div>
          </div>

          {/* Inclusions */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest px-1">Tu Plan Incluye</h3>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-3">
              {inclusions.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5 w-4 h-4 rounded-full bg-gold-400/20 flex items-center justify-center border border-gold-400/30">
                    <Check size={10} className="text-gold-400" />
                  </div>
                  <p className="text-sm text-white/80 font-light leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest px-1">Reglas Clave</h3>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
              <div className="flex gap-4">
                <AlertCircle className="w-5 h-5 text-white/40 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-xs text-white/60 font-light leading-relaxed">
                    • Las cancelaciones deben realizarse con 48 horas de anticipación para evitar penalizaciones.
                  </p>
                  <p className="text-xs text-white/60 font-light leading-relaxed">
                    • Los créditos no utilizados se acumulan hasta por 3 meses.
                  </p>
                  <p className="text-xs text-white/60 font-light leading-relaxed">
                    • Puedes invitar hasta 2 acompañantes por experiencia sin costo adicional (sujeto a disponibilidad).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Area */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest px-1">Facturación</h3>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-white">$5,000 <span className="text-sm font-normal text-white/40">USD / Anual</span></p>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Próximo cargo: 01 Ene 2025</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/5 flex items-center gap-3">
                <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center border border-white/10">
                  <div className="w-6 h-4 bg-white/20 rounded-sm" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">Visa •••• 4242</p>
                  <p className="text-[10px] text-white/40">Vía Stripe Secure Payment</p>
                </div>
                <button className="text-xs text-gold-400 hover:text-gold-300 font-medium transition-colors">
                  Actualizar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
