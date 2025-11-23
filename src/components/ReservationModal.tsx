import { useState } from 'react';
import { X, Clock, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { supabase, Experience } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ReservationModalProps {
  experience: Experience;
  onClose: () => void;
  onReservationCreated: () => void;
}

export default function ReservationModal({
  experience,
  onClose,
  onReservationCreated,
}: ReservationModalProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [step, setStep] = useState<'date' | 'time' | 'confirm'>('date');

  const getPrice = () => {
    if (user?.membership_type === 'black_elite' && experience.black_elite_included) {
      return 0;
    }
    if (user?.membership_type === 'black_elite') {
      return experience.black_elite_price;
    }
    if (user?.membership_type === 'platinum') {
      return experience.platinum_price;
    }
    return experience.gold_price;
  };

  const handleReserve = async () => {
    if (!selectedDate || !user) {
      setError('Por favor selecciona una fecha');
      return;
    }

    setLoading(true);
    setError('');

    const reservationDate = new Date(`${selectedDate}T${selectedTime}`).toISOString();

    const { error: insertError } = await supabase.from('reservations').insert({
      user_id: user.id,
      experience_id: experience.id,
      reservation_date: reservationDate,
      status: 'confirmed',
      price_paid: getPrice(),
    });

    if (insertError) {
      setError('Error al crear la reserva. Intenta de nuevo.');
      setLoading(false);
      return;
    }

    setLoading(false);
    onReservationCreated();
    onClose();
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const tomorrow = getTomorrowDate();
  const minDateString = formatDateString(
    tomorrow.getFullYear(),
    tomorrow.getMonth(),
    tomorrow.getDate()
  );

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const isDateDisabled = (day: number | null) => {
    if (!day) return true;
    const dateStr = formatDateString(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return dateStr < minDateString;
  };

  const isDateSelected = (day: number | null) => {
    if (!day) return false;
    const dateStr = formatDateString(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return dateStr === selectedDate;
  };

  const handleDateSelect = (day: number) => {
    if (isDateDisabled(day)) return;
    const dateStr = formatDateString(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(dateStr);
    setTimeout(() => setStep('time'), 300);
  };

  const handlePrevMonth = () => {
    if (currentMonth.getMonth() === tomorrow.getMonth() && currentMonth.getFullYear() === tomorrow.getFullYear()) {
      return;
    }
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const canGoPrev = !(currentMonth.getMonth() === tomorrow.getMonth() && currentMonth.getFullYear() === tomorrow.getFullYear());

  const calendarDays = generateCalendarDays();
  const monthName = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const selectedDateFormatted = selectedDate
    ? new Date(selectedDate).toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : '';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end z-50">
      <div className="w-full bg-gradient-to-b from-[#0a0a0a] to-[#0a0a0a] border-t border-white/10 rounded-t-3xl animate-in slide-in-from-bottom duration-300 max-h-[92vh] flex flex-col">
        <div className="sticky top-0 bg-[#0a0a0a] border-b border-white/10 p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {step === 'date' && 'Elige una fecha'}
              {step === 'time' && 'Elige una hora'}
              {step === 'confirm' && 'Confirma tu reserva'}
            </h2>
            <p className="text-xs text-gray-500 mt-1 font-light">{experience.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {step === 'date' && (
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrevMonth}
                  disabled={!canGoPrev}
                  className="p-2 hover:bg-[#1a1a1a] rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} className="text-yellow-600" />
                </button>
                <p className="text-white font-semibold text-lg capitalize flex-1 text-center tracking-wide">{monthName}</p>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
                >
                  <ChevronRight size={20} className="text-yellow-600" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-3">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
                  <div key={day} className="text-center text-xs text-gray-500 font-medium py-2 tracking-wide">
                    {day}
                  </div>
                ))}
                {calendarDays.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => day && handleDateSelect(day)}
                    disabled={isDateDisabled(day)}
                    className={`aspect-square rounded-xl text-sm font-semibold transition-all tracking-wide ${
                      isDateSelected(day)
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow-lg shadow-yellow-500/30'
                        : isDateDisabled(day)
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'bg-[#1a1a1a] text-white hover:bg-[#2a2a2a] border border-white/10 hover:border-yellow-600/50'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'time' && (
            <div className="p-6 space-y-6">
              <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-2 font-light">Fecha seleccionada</p>
                <p className="text-white font-bold text-lg capitalize tracking-wide">{selectedDateFormatted}</p>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">Selecciona una hora</p>
                <div className="grid grid-cols-4 gap-2">
                  {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map((time) => (
                    <button
                      key={time}
                      onClick={() => {
                        setSelectedTime(time);
                        setTimeout(() => setStep('confirm'), 300);
                      }}
                      className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all tracking-wide ${
                        selectedTime === time
                          ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow-lg shadow-yellow-500/30'
                          : 'bg-[#1a1a1a] text-gray-300 border border-white/10 hover:border-yellow-600/50 hover:bg-[#2a2a2a]'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5">
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-3">Experiencia</p>
                  <p className="text-white font-bold text-base tracking-tight">{experience.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-2">Fecha</p>
                    <p className="text-white font-bold text-sm capitalize tracking-wide">{selectedDateFormatted}</p>
                  </div>
                  <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-2 flex items-center gap-1">
                      <Clock size={12} />
                      Hora
                    </p>
                    <p className="text-white font-bold text-sm tracking-wide">{selectedTime}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-500/15 to-yellow-600/10 border border-yellow-600/40 rounded-2xl p-5">
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-3">Total</p>
                  {getPrice() === 0 ? (
                    <div>
                      <p className="text-2xl font-bold text-yellow-500 tracking-tight">Gratis</p>
                      <p className="text-xs text-yellow-600 mt-2 font-light">Incluido en tu membresía</p>
                    </div>
                  ) : (
                    <p className="text-3xl font-bold text-yellow-500 tracking-tight">${getPrice()}</p>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gradient-to-t from-[#0a0a0a] to-[#0a0a0a]/80 border-t border-white/10 p-4 flex gap-3">
          {step !== 'date' && (
            <button
              onClick={() => setStep(step === 'time' ? 'date' : 'time')}
              className="flex-1 bg-gray-700 text-white font-medium py-3 rounded-xl hover:bg-gray-600 transition-colors tracking-wide"
            >
              Atrás
            </button>
          )}
          {step === 'date' && (
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 text-white font-medium py-3 rounded-xl hover:bg-gray-600 transition-colors tracking-wide"
            >
              Cancelar
            </button>
          )}
          {step === 'confirm' && (
            <>
              <button
                onClick={() => setStep('time')}
                className="flex-1 bg-gray-700 text-white font-medium py-3 rounded-xl hover:bg-gray-600 transition-colors tracking-wide"
              >
                Cancelar
              </button>
              <button
                onClick={handleReserve}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-yellow-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 tracking-wide"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Reservando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Confirmar
                  </>
                )}
              </button>
            </>
          )}
          {(step === 'date' || step === 'time') && step !== 'date' && (
            <button
              onClick={() => setStep(step === 'time' ? 'date' : 'confirm')}
              disabled={step === 'time' && !selectedTime}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-yellow-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
            >
              Siguiente
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
