import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { chatService } from '@/services';

const LOUNGES = ['Sci-Fi', 'Non-Fiction', 'Classics', 'Thriller'];

export default function CommunityLounges() {
  const { user } = useAuth();
  const [activeLounge, setActiveLounge] = useState(LOUNGES[0]);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const socket = chatService.getSocket();
    if (!socket) return;

    socket.emit('room:join', activeLounge);

    socket.on('message:new', (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.emit('room:leave', activeLounge);
      socket.off('message:new');
    };
  }, [activeLounge]);

  const handleSend = () => {
    const socket = chatService.getSocket();
    if (!input.trim() || !socket || !user) return;
    socket.emit('message:room', {
      roomName: activeLounge,
      senderId: user.id,
      content: input,
      messageId: Math.random().toString(),
    });
    setInput('');
  };

  return (
    <div className="flex h-screen pt-20 p-4 gap-4">
      <div className="w-64 flex flex-col gap-2">
        {LOUNGES.map((lounge) => (
          <Button
            key={lounge}
            variant={activeLounge === lounge ? 'default' : 'outline'}
            onClick={() => setActiveLounge(lounge)}
          >
            {lounge} Lounge
          </Button>
        ))}
      </div>
      <Card className="flex-1 flex flex-col p-4">
        <h2 className="text-xl font-bold mb-4">{activeLounge} Lounge</h2>
        <div className="flex-1 overflow-y-auto mb-4 border p-2 rounded">
          {messages.map((m, i) => (
            <div key={i} className="mb-2">
              <span className="font-bold text-sm text-primary">{m.senderId}: </span>
              {m.content}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} />
          <Button onClick={handleSend}>Send</Button>
        </div>
      </Card>
    </div>
  );
}
