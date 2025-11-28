import { useState, useEffect } from 'react';
import { X, Play, Pause, SkipForward, Volume2, BookOpen, CheckCircle2, Lock, ChevronRight } from 'lucide-react';
import { Course } from '../lib/supabase';

interface CoursePlayerModalProps {
  course: Course;
  onClose: () => void;
}

export default function CoursePlayerModal({ course, onClose }: CoursePlayerModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeModule, setActiveModule] = useState(0);
  const [progress, setProgress] = useState(0);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Mock modules data
  const modules = [
    { id: 1, title: 'Introducción al Curso', duration: '5:20', isCompleted: true },
    { id: 2, title: 'Fundamentos Esenciales', duration: '12:45', isCompleted: false },
    { id: 3, title: 'Estrategias Avanzadas', duration: '18:30', isCompleted: false },
    { id: 4, title: 'Casos de Estudio', duration: '15:10', isCompleted: false },
    { id: 5, title: 'Conclusiones y Próximos Pasos', duration: '8:50', isCompleted: false },
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-5xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-gold-900/20 flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main Content - Video Player */}
        <div className="flex-1 flex flex-col bg-black relative">
          {/* Header Overlay */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20 bg-gradient-to-b from-black/80 to-transparent">
            <div>
              <h2 className="text-white font-light tracking-wide text-lg">{course.title}</h2>
              <p className="text-white/60 text-xs font-light tracking-widest uppercase mt-1">
                Mentor: {course.mentor}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full backdrop-blur-sm"
            >
              <X size={20} />
            </button>
          </div>

          {/* Video Area Placeholder */}
          <div className="flex-1 relative group cursor-pointer" onClick={() => setIsPlaying(!isPlaying)}>
            <img 
              src={course.image_url} 
              alt={course.title}
              className={`w-full h-full object-cover transition-opacity duration-700 ${isPlaying ? 'opacity-40' : 'opacity-60'}`}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-20 h-20 rounded-full bg-gold-400/20 backdrop-blur-sm border border-gold-400/40 flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-gold-400 fill-gold-400" />
                ) : (
                  <Play className="w-8 h-8 text-gold-400 fill-gold-400 ml-1" />
                )}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
              <div 
                className="h-full bg-gold-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]" 
                style={{ width: '35%' }}
              />
            </div>
          </div>

          {/* Controls Bar */}
          <div className="bg-[#111] border-t border-white/5 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-white hover:text-gold-400 transition-colors"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button className="text-white/60 hover:text-white transition-colors">
                <SkipForward size={20} />
              </button>
              <div className="flex items-center gap-2 group">
                <Volume2 size={18} className="text-white/60 group-hover:text-white transition-colors" />
                <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-2/3 h-full bg-white/60 rounded-full" />
                </div>
              </div>
              <span className="text-xs text-white/40 font-mono">05:20 / 12:45</span>
            </div>
            
            <div className="flex items-center gap-3">
               <span className="text-xs text-gold-400 font-light tracking-widest uppercase border border-gold-400/20 px-3 py-1 rounded-full bg-gold-400/5">
                 HD 4K
               </span>
            </div>
          </div>
        </div>

        {/* Sidebar - Modules & Info */}
        <div className="w-full md:w-80 bg-[#0a0a0a] border-l border-white/5 flex flex-col">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-white font-light tracking-widest uppercase text-xs mb-4 flex items-center gap-2">
              <BookOpen size={14} className="text-gold-400" />
              Contenido del Curso
            </h3>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-white/40 mb-2">
                <span>Progreso General</span>
                <span>20%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-gold-600 to-gold-400 w-1/5 rounded-full" />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {modules.map((module, index) => (
              <button
                key={module.id}
                onClick={() => setActiveModule(index)}
                className={`w-full p-4 rounded-xl border transition-all duration-300 text-left group ${
                  activeModule === index 
                    ? 'bg-white/5 border-gold-400/30' 
                    : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-xs font-medium tracking-widest uppercase ${
                    activeModule === index ? 'text-gold-400' : 'text-white/40'
                  }`}>
                    Módulo {index + 1}
                  </span>
                  {module.isCompleted ? (
                    <CheckCircle2 size={14} className="text-gold-400" />
                  ) : index > activeModule ? (
                    <Lock size={14} className="text-white/20" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-white/20" />
                  )}
                </div>
                <h4 className={`text-sm font-light transition-colors ${
                  activeModule === index ? 'text-white' : 'text-white/70 group-hover:text-white'
                }`}>
                  {module.title}
                </h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-white/30 font-mono">{module.duration}</span>
                  {activeModule === index && (
                    <span className="text-[10px] text-gold-400/60 animate-pulse">Reproduciendo...</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-white/5 bg-[#0f0f0f]">
            <button className="w-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5 rounded-xl py-3 text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 group">
              Ver Recursos
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
