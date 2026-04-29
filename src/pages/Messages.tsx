import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/layout/PageTransition';
import MessageCenter from '@/components/messaging/MessageCenter';
import { createFadeUpItem, createStaggerContainer } from '@/lib/motion';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/helpers';

// Internal interfaces for MessageCenter compatibility
interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  lastMessage: {
    text: string;
    timestamp: string;
    isRead: boolean;
  };
  messages: Message[];
}

const Messages = () => {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const containerVariants = createStaggerContainer(shouldReduceMotion, 0.08, 0.04);
  const itemVariants = createFadeUpItem(shouldReduceMotion, 18);

  const { user } = useAuth();
  const { conversations, isLoading: chatLoading, error: chatError, sendMessage } = useChat();

  const [searchParams] = useSearchParams();
  const initialConversationId = searchParams.get('user');

  // Map the chat service conversations to the format expected by MessageCenter
  const conversationsData = useMemo<Conversation[]>(() => {
    return conversations.map((conv) => ({
      id: conv.id,
      user: conv.user,
      lastMessage: conv.lastMessage, // already has 'text' in ChatConversation
      messages: conv.messages.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        text: m.content, // Map 'content' to 'text'
        timestamp: m.timestamp,
      })),
    }));
  }, [conversations]);

  const handleSendMessage = async (recipientId: string, content: string) => {
    try {
      await sendMessage(recipientId, content);
    } catch (sendError: unknown) {
      toast.error('Message not sent', {
        description: getErrorMessage(sendError, 'Please try again in a moment.'),
      });
    }
  };

  return (
    <PageTransition className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow pt-[70px] px-4 py-8">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="space-y-6"
          >
            <motion.div variants={itemVariants}>
              <h1 className="text-3xl font-bold mb-2">Messages</h1>
              <p className="text-muted-foreground">
                Coordinate pickup windows, confirm return dates, and keep every exchange in one
                thread.
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              {chatLoading && conversationsData.length === 0 ? (
                <div className="flex h-[420px] items-center justify-center rounded-lg border bg-white">
                  <p className="text-sm text-muted-foreground font-medium animate-pulse">
                    Loading your conversations...
                  </p>
                </div>
              ) : chatError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
                  <p className="font-semibold mb-1">Could not load chat</p>
                  <p>{chatError}</p>
                </div>
              ) : (
                <MessageCenter
                  conversations={conversationsData}
                  currentUserId={user?.id}
                  initialConversationId={initialConversationId}
                  onSendMessage={handleSendMessage}
                />
              )}
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </PageTransition>
  );
};

export default Messages;
