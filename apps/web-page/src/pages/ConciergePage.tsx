import { useEffect, useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, ConciergeMessage } from '../lib/supabase';

export default function ConciergePage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ConciergeMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

    if (data && data.length > 0) {
      setMessages(data);
    } else {
      const welcomeMessage: ConciergeMessage = {
        id: 'welcome',
        user_id: user!.id,
        message: 'Bienvenido a Duke Life Concierge. Estoy aquí para asistirle con cualquier solicitud las 24 horas del día. ¿En qué puedo ayudarle hoy?',
        sender_type: 'concierge',
        created_at: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    }
    setLoading(false);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const messageToSend = newMessage;
    setNewMessage('');

    const userMsg: ConciergeMessage = {
      id: `user-${Date.now()}`,
      user_id: user!.id,
      message: messageToSend,
      sender_type: 'user',
      created_at: new Date().toISOString(),
    };

    // Add message to UI
    setMessages((prev) => [...prev, userMsg]);

    // Simulate database insert without actually calling it to avoid glitch
    // In production, you would do the insert in the background without awaiting
    setTimeout(() => {
      // Optional: Insert to database in background without blocking UI
      supabase.from('concierge_messages').insert({
        user_id: user!.id,
        message: messageToSend,
        sender_type: 'user',
      }).then(({ error }) => {
        if (error) console.error('Error saving message:', error);
      });
    }, 0);

    // Show concierge response after a delay
    setTimeout(() => {
      const conciergeMsg: ConciergeMessage = {
        id: `concierge-${Date.now()}`,
        user_id: user!.id,
        message:
          'Gracias por su mensaje. Un miembro de nuestro equipo de concierge le responderá en breve para asistirle con su solicitud.',
        sender_type: 'concierge',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, conciergeMsg]);
      setIsSending(false);
    }, 1500);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 py-5 transition-all duration-300">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300 text-center tracking-[0.15em] uppercase">
          Smart Concierge
        </h1>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-6 pb-44 space-y-6 bg-gradient-to-b from-transparent to-black/20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-gold-400/30 border-t-gold-400 animate-spin" />
            <p className="text-white/40 font-light tracking-wide text-sm">Cargando conversación...</p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-3xl px-6 py-4 max-w-[85%] shadow-xl transition-all duration-300 ${
                    msg.sender_type === 'user'
                      ? 'bg-gold-400/20 backdrop-blur-md text-white shadow-gold-400/10'
                      : 'bg-white/10 backdrop-blur-md text-white shadow-black/20'
                  }`}
                >
                  <p className={`text-sm font-light leading-relaxed ${
                    msg.sender_type === 'user' ? 'text-white/95' : 'text-white/90'
                  }`}>
                    {msg.message}
                  </p>
                  <span
                    className={`text-[9px] block text-right mt-2 font-light tracking-wider ${
                      msg.sender_type === 'user' ? 'text-white/50' : 'text-white/40'
                    }`}
                  >
                    {formatTime(msg.created_at)}
                  </span>
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-2xl px-6 py-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-[10px] text-white/40 font-light tracking-wide">Escribiendo...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </main>

      {/* Fixed Footer Input - Above Navigation */}
      <footer className="fixed bottom-20 left-0 right-0 z-50 bg-gradient-to-t from-black via-black/98 to-black/80 backdrop-blur-xl border-t border-gold-400/20 p-4 pb-6 safe-area-inset-bottom">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escriba su mensaje..."
                disabled={isSending}
                className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-6 py-4 text-sm font-light focus:outline-none focus:border-gold-400/60 focus:bg-white/15 placeholder-white/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="bg-gradient-to-br from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 disabled:from-white/10 disabled:to-white/5 disabled:border disabled:border-white/10 text-black disabled:text-white/30 rounded-2xl p-4 transition-all duration-300 shadow-lg shadow-gold-400/20 hover:shadow-gold-400/40 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </footer>

      <style>{`
        .safe-area-inset-bottom {
          padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
        }
      `}</style>
    </div>
  );
}
