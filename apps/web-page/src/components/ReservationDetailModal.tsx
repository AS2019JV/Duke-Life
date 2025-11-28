import { useEffect } from 'react';
import { X, MapPin, Calendar, Clock, QrCode, Phone, Mail } from 'lucide-react';
import { Reservation } from '../lib/supabase';

interface ReservationDetailModalProps {
  reservation: Reservation;
  onClose: () => void;
}

export default function ReservationDetailModal({
  reservation,
  onClose,
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
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] border border-gold-400/20 rounded-3xl animate-in zoom-in-95 fade-in duration-300 max-h-[90vh] flex flex-col shadow-2xl shadow-gold-900/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-b from-[#0a0a0a] to-transparent border-b border-gold-400/10 p-6 flex justify-between items-start rounded-t-3xl">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
              <span className="text-[10px] text-gold-400/70 font-light tracking-widest uppercase">
                Confirmado
              </span>
            </div>
            <h2 className="text-2xl font-extralight text-white tracking-wide leading-tight">
              Detalles de Reserva
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* QR Code Section */}
          {reservation.qr_code ? (
            <div className="bg-gradient-to-br from-gold-400/5 to-gold-400/10 border border-gold-400/20 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <QrCode className="w-5 h-5 text-gold-400" />
                <h3 className="text-sm font-light text-gold-400 tracking-widest uppercase">
                  Código de Acceso
                </h3>
              </div>
              <div className="bg-white rounded-2xl p-6 flex items-center justify-center">
                <img
                  src={reservation.qr_code}
                  alt="QR Code"
                  className="w-48 h-48 object-contain"
                />
              </div>
              <p className="text-xs text-white/60 text-center font-light leading-relaxed">
                Presenta este código QR al llegar a tu experiencia
              </p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gold-400/5 to-gold-400/10 border border-gold-400/20 rounded-2xl p-8 text-center">
              <QrCode className="w-12 h-12 text-gold-400/40 mx-auto mb-3" />
              <p className="text-sm text-white/60 font-light">
                Tu código QR se generará pronto
              </p>
            </div>
          )}

          {/* Experience Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-medium text-gold-400/70 tracking-widest uppercase">
              Experiencia
            </h3>
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <img
                src={reservation.experiences?.image_url}
                alt={reservation.experiences?.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-5 space-y-3">
                <h4 className="text-lg font-light text-white tracking-wide">
                  {reservation.experiences?.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <MapPin className="w-3 h-3" />
                  <span className="font-light tracking-wide">
                    {reservation.experiences?.destinations?.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold-400" />
                <span className="text-xs text-white/40 font-light tracking-wider uppercase">
                  Fecha
                </span>
              </div>
              <p className="text-sm text-white font-light capitalize leading-relaxed">
                {formatDate(reservation.reservation_date)}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-400" />
                <span className="text-xs text-white/40 font-light tracking-wider uppercase">
                  Hora
                </span>
              </div>
              <p className="text-sm text-white font-light">
                {formatTime(reservation.reservation_date)}
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="bg-gradient-to-br from-gold-400/10 to-gold-400/5 border border-gold-400/30 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gold-400/70 font-light tracking-widest uppercase">
                Total Pagado
              </span>
              <span className="text-2xl font-light text-gold-400">
                {reservation.price_paid === 0 ? (
                  <span className="text-base">Incluido</span>
                ) : (
                  `$${reservation.price_paid}`
                )}
              </span>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-medium text-gold-400/70 tracking-widest uppercase">
              ¿Necesitas Ayuda?
            </h3>
            <div className="space-y-3">
              <a
                href="tel:+1234567890"
                className="flex items-center gap-3 text-sm text-white/70 hover:text-gold-400 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gold-400/10 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="font-light">+1 (234) 567-890</span>
              </a>
              <a
                href="mailto:concierge@dukelife.com"
                className="flex items-center gap-3 text-sm text-white/70 hover:text-gold-400 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gold-400/10 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="font-light">concierge@dukelife.com</span>
              </a>
            </div>
          </div>

          {/* Additional Info */}
          <div className="pt-4 border-t border-white/5 space-y-3">
            <p className="text-xs text-white/40 font-light tracking-wider uppercase">
              Información Importante
            </p>
            <ul className="space-y-2 text-sm text-white/60 font-light">
              <li className="flex items-start gap-2">
                <span className="text-gold-400 mt-1">•</span>
                <span>Llega 15 minutos antes de tu hora reservada</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-400 mt-1">•</span>
                <span>Presenta tu QR code y una identificación válida</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-400 mt-1">•</span>
                <span>Cancelación gratuita hasta 24 horas antes</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gradient-to-t from-[#0a0a0a] to-transparent border-t border-gold-400/10 p-6 rounded-b-3xl">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-black font-semibold py-4 rounded-full shadow-lg shadow-gold-900/30 transition-all duration-500 transform hover:scale-105 active:scale-95 text-sm tracking-widest uppercase"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
