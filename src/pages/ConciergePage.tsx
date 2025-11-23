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
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-white/10 p-4">
        <h1 className="text-2xl font-bold text-white text-center tracking-tight">Concierge 24/7</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center text-gray-400 py-8">Cargando mensajes...</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`rounded-lg p-3 max-w-xs ${
                  msg.sender_type === 'user'
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black'
                    : 'bg-[#1a1a1a] text-white'
                }`}
              >
                <p className="text-sm font-normal leading-relaxed">{msg.message}</p>
                <span
                  className={`text-xs block text-right mt-2 font-light ${
                    msg.sender_type === 'user' ? 'text-black/70' : 'text-gray-500'
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

      <footer className="sticky bottom-[76px] z-10 p-4 bg-[#1a1a1a] border-t border-white/10">
        <form onSubmit={sendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escriba su mensaje..."
            className="flex-1 bg-gray-700 text-white border-none rounded-full px-4 py-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-yellow-600 placeholder-gray-400"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-full p-2"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </footer>
    </div>
  );
}
