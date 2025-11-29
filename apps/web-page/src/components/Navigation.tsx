import { Home, Calendar, BookOpen, User, UserCircle } from 'lucide-react';

interface NavigationProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

export default function Navigation({ activePage, onPageChange }: NavigationProps) {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'reservas', icon: Calendar, label: 'Reservas' },
    { id: 'concierge', icon: User, label: 'Concierge', special: true },
    { id: 'cursos', icon: BookOpen, label: 'Cursos' },
    { id: 'perfil', icon: UserCircle, label: 'Perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-t border-white/5 p-4">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          if (item.special) {
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className="flex flex-col items-center -mt-8 group"
              >
                <div className={`rounded-full p-4 shadow-lg transition-all duration-500 group-active:scale-95 group-hover:scale-110 ${
                  isActive 
                    ? 'bg-black border border-white/40 shadow-white/50 shadow-xl' 
                    : 'bg-black border border-white/20 shadow-white/30 group-hover:shadow-white/50 group-hover:shadow-xl'
                }`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <span className={`text-[9px] font-light mt-2 tracking-widest uppercase transition-colors duration-300 ${
                  isActive ? 'text-white' : 'text-white/60'
                }`}>{item.label}</span>
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
