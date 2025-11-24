import { Home, Calendar, MessageCircle, BookOpen, User } from 'lucide-react';

interface NavigationProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

export default function Navigation({ activePage, onPageChange }: NavigationProps) {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'reservas', icon: Calendar, label: 'Reservas' },
    { id: 'concierge', icon: MessageCircle, label: 'Concierge', special: true },
    { id: 'cursos', icon: BookOpen, label: 'Cursos' },
    { id: 'perfil', icon: User, label: 'Perfil' },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 z-40 bg-black/60 backdrop-blur-xl border-t border-white/5 p-4">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          if (item.special) {
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className="flex flex-col items-center -mt-8"
              >
                <div className="bg-gold-400 hover:bg-gold-300 text-black rounded-full p-4 shadow-lg shadow-gold-900/20 transition-all duration-500">
                  <Icon className="w-7 h-7" />
                </div>
                <span className="text-[9px] text-white/60 font-light mt-2 tracking-widest uppercase">{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`flex flex-col items-center transition-all duration-300 ${
                isActive ? 'text-gold-400' : 'text-white/40 hover:text-gold-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-light tracking-widest uppercase mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
