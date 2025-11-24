import { useEffect, useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, ConciergeMessage } from '../lib/supabase';

export default function ConciergePage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ConciergeMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('concierge_messages')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    } else {
      const welcomeMessage: ConciergeMessage = {
        id: 'welcome',
        user_id: user!.id,
        message: 'Bienvenido, Sr. Miembro. Soy su asistente personal. ¿Cómo puedo asistirle hoy?',
        sender_type: 'concierge',
        created_at: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    }
    setLoading(false);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMsg: ConciergeMessage = {
      id: Date.now().toString(),
      user_id: user!.id,
      message: newMessage,
      sender_type: 'user',
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setNewMessage('');

    const { error } = await supabase.from('concierge_messages').insert({
      user_id: user!.id,
      message: newMessage,
      sender_type: 'user',
    });

    if (error) {
      console.error('Error sending message:', error);
    }

    setTimeout(() => {
      const conciergeMsg: ConciergeMessage = {
        id: (Date.now() + 1).toString(),
        user_id: user!.id,
        message:
          'Gracias por su mensaje. Un miembro de nuestro equipo le responderá en breve.',
        sender_type: 'concierge',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, conciergeMsg]);
    }, 1000);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col pb-24">
      <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/5 p-6">
        <h1 className="text-2xl font-extralight text-gold-400/90 text-center tracking-wide">Concierge 24/7</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
          <div className="text-center text-white/40 py-12 font-light tracking-wide">Cargando mensajes...</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`rounded-2xl px-5 py-3 max-w-xs ${
                  msg.sender_type === 'user'
                    ? 'bg-gold-400 text-black'
                    : 'bg-white/5 border border-white/10 text-white'
                }`}
              >
                <p className="text-sm font-light leading-relaxed">{msg.message}</p>
                <span
                  className={`text-[9px] block text-right mt-2 font-light tracking-wider ${
                    msg.sender_type === 'user' ? 'text-black/50' : 'text-white/40'
                  }`}
                >
                  {formatTime(msg.created_at)}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="sticky bottom-[76px] z-10 p-4 bg-black/60 backdrop-blur-xl border-t border-white/5">
        <form onSubmit={sendMessage} className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escriba su mensaje..."
            className="flex-1 bg-white/5 border border-white/10 text-white rounded-full px-5 py-3 text-sm font-light focus:outline-none focus:border-gold-400 placeholder-white/30 transition-all duration-300"
          />
          <button
            type="submit"
            className="bg-gold-400 hover:bg-gold-300 text-black rounded-full p-3 transition-all duration-300"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </footer>
    </div>
  );
}
