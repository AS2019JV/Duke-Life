import { useState, useEffect } from 'react';
import { 
  X, User, Globe, Bell, Shield, ChevronDown, ChevronRight, 
  Smartphone, Mail, MessageCircle, Clock, MapPin, Lock, LogOut,
  Check, AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface SettingsModalProps {
  onClose: () => void;
}

type Section = 'profile' | 'preferences' | 'notifications' | 'concierge' | 'security';

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { user, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<Section | null>('profile');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form states (mock data for now, would be connected to Supabase profile)
  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    language: 'es',
    timezone: 'America/New_York',
    defaultDestination: 'dubai',
    notifications: {
      push: true,
      email: true,
      frequency: 'daily'
    },
    concierge: {
      language: 'es',
      style: 'luxury',
      restrictions: ''
    }
  });

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const toggleSection = (section: Section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setSuccessMessage('Cambios guardados correctamente');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSignOutAll = async () => {
    if (confirm('¿Cerrar sesión en todos los dispositivos?')) {
      await supabase.auth.signOut({ scope: 'global' });
      onClose();
    }
  };

  const SectionHeader = ({ id, icon: Icon, title, subtitle }: { id: Section, icon: any, title: string, subtitle: string }) => (
    <button
      onClick={() => toggleSection(id)}
      className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
        activeSection === id 
          ? 'bg-white/10 border border-gold-400/30 shadow-lg shadow-gold-900/10' 
          : 'bg-white/5 border border-white/5 hover:bg-white/10'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          activeSection === id ? 'bg-gold-400 text-black' : 'bg-white/10 text-white/60'
        }`}>
          <Icon size={20} />
        </div>
        <div className="text-left">
          <h3 className={`font-medium tracking-wide ${activeSection === id ? 'text-white' : 'text-white/80'}`}>
            {title}
          </h3>
          <p className="text-xs text-white/40 font-light">{subtitle}</p>
        </div>
      </div>
      <ChevronDown 
        size={20} 
        className={`text-white/40 transition-transform duration-300 ${activeSection === id ? 'rotate-180 text-gold-400' : ''}`} 
      />
    </button>
  );

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 pb-20"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl flex flex-col max-h-[90vh] shadow-2xl animate-in zoom-in-95 fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-b from-white/5 to-transparent rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-light text-white tracking-wide">Configuración</h2>
            <p className="text-xs text-gold-400 font-light tracking-widest uppercase mt-1">Control Center</p>
          </div>
          <button 
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          
          {/* Profile Section */}
          <div className="space-y-2">
            <SectionHeader 
              id="profile" 
              icon={User} 
              title="Perfil & Contacto" 
              subtitle="Información personal y métodos de contacto" 
            />
            
            {activeSection === 'profile' && (
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-white/40 uppercase tracking-wider">Nombre Completo</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-3 text-white/40" />
                      <input 
                        type="text" 
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-gold-400/50 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-white/40 uppercase tracking-wider">Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-3 text-white/40" />
                      <input 
                        type="email" 
                        value={formData.email}
                        disabled
                        className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white/50 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-white/40 uppercase tracking-wider">Teléfono</label>
                    <div className="relative">
                      <Smartphone size={16} className="absolute left-3 top-3 text-white/40" />
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-gold-400/50 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  </div>
                </div>
            )}
          </div>

          {/* Preferences Section */}
          <div className="space-y-2">
            <SectionHeader 
              id="preferences" 
              icon={Globe} 
              title="Preferencias Regionales" 
              subtitle="Idioma, zona horaria y destino principal" 
            />
            
            {activeSection === 'preferences' && (
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-white/40 uppercase tracking-wider">Idioma</label>
                    <div className="relative">
                      <Globe size={16} className="absolute left-3 top-3 text-white/40" />
                      <select 
                        value={formData.language}
                        onChange={(e) => setFormData({...formData, language: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-gold-400/50 focus:outline-none appearance-none"
                      >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-3.5 text-white/40 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-white/40 uppercase tracking-wider">Zona Horaria</label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3 top-3 text-white/40" />
                      <select 
                        value={formData.timezone}
                        onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-gold-400/50 focus:outline-none appearance-none"
                      >
                        <option value="America/New_York">New York (EST)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Asia/Dubai">Dubai (GST)</option>
                        <option value="Europe/Madrid">Madrid (CET)</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-3.5 text-white/40 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs text-white/40 uppercase tracking-wider">Destino Predeterminado</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-3 text-white/40" />
                      <select 
                        value={formData.defaultDestination}
                        onChange={(e) => setFormData({...formData, defaultDestination: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-gold-400/50 focus:outline-none appearance-none"
                      >
                        <option value="dubai">Dubai, UAE</option>
                        <option value="paris">Paris, France</option>
                        <option value="ny">New York, USA</option>
                        <option value="tokyo">Tokyo, Japan</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-3.5 text-white/40 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Section */}
          <div className="space-y-2">
            <SectionHeader 
              id="notifications" 
              icon={Bell} 
              title="Notificaciones" 
              subtitle="Gestiona cómo y cuándo te contactamos" 
            />
            
            {activeSection === 'notifications' && (
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-6 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <Smartphone size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">Push Notifications</p>
                        <p className="text-xs text-white/40">Alertas en tiempo real</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.notifications.push}
                        onChange={(e) => setFormData({...formData, notifications: {...formData.notifications, push: e.target.checked}})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-400"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <Mail size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">Email Digest</p>
                        <p className="text-xs text-white/40">Resumen de actividades</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.notifications.email}
                        onChange={(e) => setFormData({...formData, notifications: {...formData.notifications, email: e.target.checked}})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-400"></div>
                    </label>
                  </div>

                  </div>

                <div className="pt-4 border-t border-white/5">
                  <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">Frecuencia</label>
                  <div className="flex gap-2">
                    {['realtime', 'daily', 'weekly'].map((freq) => (
                      <button
                        key={freq}
                        onClick={() => setFormData({...formData, notifications: {...formData.notifications, frequency: freq}})}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                          formData.notifications.frequency === freq
                            ? 'bg-gold-400/10 border-gold-400 text-gold-400'
                            : 'bg-black/20 border-white/10 text-white/60 hover:bg-white/5'
                        }`}
                      >
                        {freq === 'realtime' ? 'Inmediata' : freq === 'daily' ? 'Diaria' : 'Semanal'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Concierge Section */}
          <div className="space-y-2">
            <SectionHeader 
              id="concierge" 
              icon={User} 
              title="Preferencias de Concierge" 
              subtitle="Personaliza tu experiencia de servicio" 
            />
            
            {activeSection === 'concierge' && (
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <label className="text-xs text-white/40 uppercase tracking-wider">Estilo de Viaje</label>
                  <select 
                    value={formData.concierge.style}
                    onChange={(e) => setFormData({...formData, concierge: {...formData.concierge, style: e.target.value}})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white focus:border-gold-400/50 focus:outline-none appearance-none"
                  >
                    <option value="luxury">Lujo & Relax</option>
                    <option value="adventure">Aventura & Exploración</option>
                    <option value="business">Negocios & Eficiencia</option>
                    <option value="family">Familiar & Privado</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-white/40 uppercase tracking-wider">Restricciones o Preferencias Especiales</label>
                  <textarea 
                    value={formData.concierge.restrictions}
                    onChange={(e) => setFormData({...formData, concierge: {...formData.concierge, restrictions: e.target.value}})}
                    placeholder="Ej. Alergias alimentarias, preferencias de asiento, etc."
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white focus:border-gold-400/50 focus:outline-none h-24 resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Security Section */}
          <div className="space-y-2">
            <SectionHeader 
              id="security" 
              icon={Shield} 
              title="Seguridad" 
              subtitle="Contraseña y gestión de dispositivos" 
            />
            
            {activeSection === 'security' && (
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <button className="w-full flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5 hover:border-white/20 transition-colors group">
                  <div className="flex items-center gap-3">
                    <Lock size={16} className="text-white/60 group-hover:text-white" />
                    <span className="text-sm text-white/80 group-hover:text-white">Cambiar Contraseña</span>
                  </div>
                  <ChevronRight size={16} className="text-white/40" />
                </button>
                
                <button className="w-full flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5 hover:border-white/20 transition-colors group">
                  <div className="flex items-center gap-3">
                    <Smartphone size={16} className="text-white/60 group-hover:text-white" />
                    <span className="text-sm text-white/80 group-hover:text-white">Gestionar Dispositivos</span>
                  </div>
                  <ChevronRight size={16} className="text-white/40" />
                </button>

                <div className="pt-2">
                  <button 
                    onClick={handleSignOutAll}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all text-red-400 text-sm font-medium"
                  >
                    <LogOut size={16} />
                    Cerrar sesión en todos los dispositivos
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-[#0f0f0f] rounded-b-3xl">
          <div className="flex items-center justify-between gap-4">
            {successMessage ? (
              <div className="flex-1 flex items-center gap-2 text-green-400 text-sm animate-in fade-in slide-in-from-bottom-2">
                <CheckCircle2 size={16} />
                {successMessage}
              </div>
            ) : (
              <p className="text-xs text-white/30 font-light hidden md:block">
                Última sincronización: {new Date().toLocaleTimeString()}
              </p>
            )}
            
            <div className="flex gap-3 w-full md:w-auto">
              <button 
                onClick={onClose}
                className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-black font-semibold hover:shadow-lg hover:shadow-gold-500/20 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Check size={16} />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckCircle2({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
