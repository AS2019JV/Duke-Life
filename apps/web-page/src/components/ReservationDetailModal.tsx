import { useEffect } from 'react';
import { X, MapPin, Calendar, Clock, QrCode, MessageSquare, Users } from 'lucide-react';
import { Reservation } from '../lib/supabase';

interface ReservationDetailModalProps {
  reservation: Reservation;
  onClose: () => void;
  onNavigate?: (page: string) => void;
}

export default function ReservationDetailModal({
  reservation,
  onClose,
  onNavigate,
}: ReservationDetailModalProps) {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md relative bg-[#0a0a0a] rounded-3xl animate-slideUp shadow-2xl shadow-gold-900/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0 calc(100% - 20px))'
        }}
      >
        {/* Ticket Top Decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-400 via-gold-200 to-gold-400" />

        {/* Header */}
        <div className="relative bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] p-5 pb-6 border-b border-white/5">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                <span className="text-[9px] text-emerald-400 font-bold tracking-[0.2em] uppercase">
                  Confirmado
                </span>
              </div>
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-gold-400 to-gold-200 tracking-wide">
                TICKET DE ACCESO
              </h2>
              <p className="text-[10px] text-white/40 font-light tracking-widest uppercase mt-0.5">
                #{reservation.id.slice(0, 8)}
              </p>
            </div>
            {/* Close button moved to bottom right of this section, see below */}
          </div>
          
          <button
              onClick={onClose}
              className="absolute bottom-3 right-4 text-white/20 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-full"
            >
              <X size={18} />
            </button>

          {/* Decorative Circles */}
          <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-[#0a0a0a] border border-white/5 z-10" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-[#0a0a0a] border border-white/5 z-10" />
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 bg-[#0a0a0a]">
          {/* QR Code Section */}
          <div className="flex justify-center py-2">
            <div className="bg-white p-3 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              {reservation.qr_code ? (
                <img
                  src={reservation.qr_code}
                  alt="QR Code"
                  className="w-32 h-32 object-contain"
                />
              ) : (
                <div className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded-lg">
                  <QrCode className="w-10 h-10 text-gray-300" />
                </div>
              )}
            </div>
          </div>

          {/* Experience Info */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <img
                src={reservation.experiences?.image_url}
                alt={reservation.experiences?.title}
                className="w-20 h-20 rounded-xl object-cover border border-white/10"
              />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white tracking-wide leading-tight">
                  {reservation.experiences?.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-gold-400/80 font-medium tracking-wide">
                  <MapPin size={12} />
                  {reservation.experiences?.destinations?.name}
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 bg-white/5 rounded-2xl p-4 border border-white/5">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-white/40 uppercase tracking-wider">
                <Calendar size={12} />
                Fecha
              </div>
              <p className="text-sm text-white font-medium capitalize">
                {formatDate(reservation.reservation_date)}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-white/40 uppercase tracking-wider">
                <Clock size={12} />
                Hora
              </div>
              <p className="text-sm text-white font-medium">
                {formatTime(reservation.reservation_date)}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-white/40 uppercase tracking-wider">
                <Users size={12} />
                Personas
              </div>
              <p className="text-sm text-white font-medium">
                {reservation.people_count || 1}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-white/40 uppercase tracking-wider">
                <span className="text-sage-400">$</span>
                Total
              </div>
              <p className="text-sm text-sage-400 font-bold">
                {reservation.price_paid === 0 ? 'Incluido' : `$${reservation.price_paid}`}
              </p>
            </div>
          </div>

          {/* Concierge Action */}
          <div className="pt-4 border-t border-dashed border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-white/40 uppercase tracking-widest">¿Necesitas ayuda?</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onNavigate?.('concierge');
              }}
              className="w-full bg-white/5 hover:bg-white/10 border border-gold-400/20 rounded-xl p-4 flex items-center justify-between group transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-400">
                  <MessageSquare size={18} />
                </div>
                <div className="text-left">
                  <p className="text-xs text-white/60 font-light">Habla con</p>
                  <p className="text-sm font-bold text-gold-400 tracking-wide">Smart Concierge</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all">
                →
              </div>
            </button>
          </div>

          {/* Footer Info */}
          <div className="text-center space-y-2">
            <p className="text-[10px] text-white/30 uppercase tracking-widest">
              Cancelación gratuita hasta 48 horas antes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
