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
    <nav className="absolute bottom-0 left-0 right-0 z-40 bg-[#1a1a1a]/90 backdrop-blur-lg border-t border-white/10 p-4">
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
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-full p-4 shadow-lg shadow-yellow-500/40 animate-pulse">
                  <Icon className="w-8 h-8" />
                </div>
                <span className="text-xs text-gray-300 font-medium mt-2 tracking-wide">{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`flex flex-col items-center transition-colors ${
                isActive ? 'text-yellow-600' : 'text-gray-400 hover:text-yellow-600'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium tracking-wide mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
