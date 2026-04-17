import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import MessageCenter from "@/components/messaging/MessageCenter";
import { createFadeUpItem, createStaggerContainer } from "@/lib/motion";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useToast } from "@/components/ui/use-toast";

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
  const { conversations, isLoading: chatLoading, sendMessage, refreshConversations } = useChat();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialConversationId = searchParams.get("user");

  // Convert chat conversations to the format expected by MessageCenter
  const [conversationsData, setConversationsData] = useState<Conversation[]>([]);

  useEffect(() => {
    if (chatLoading) {
      setIsLoading(true);
      return;
    }

    // Map chat conversations to the format expected by MessageCenter
    const mapped: Conversation[] = conversations.map((conv) => ({
      id: conv.id,
      user: conv.user,
      lastMessage: conv.lastMessage,
      messages: conv.messages.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        text: m.content,
        timestamp: m.timestamp,
      })),
    }));

    setConversationsData(mapped);
    setIsLoading(false);
  }, [conversations, chatLoading]);

  const loadConversations = useCallback(async (showLoader = true) => {
    if (!user?.id) {
      setConversationsData([]);
      setIsLoading(false);
      return;
    }

    if (showLoader) {
      setIsLoading(true);
    }

    try {
      // Use chat service data
      refreshConversations();
      setError(null);
    } catch (loadError: any) {
      setError(loadError.message || "Unable to load your conversations right now.");
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  }, [refreshConversations, user?.id]);

  useEffect(() => {
    if (user?.id) {
      void loadConversations();
    }
  }, [loadConversations, user?.id]);

  const handleSendMessage = async (recipientId: string, content: string) => {
    try {
      await sendMessage(recipientId, content);
      await loadConversations(false);
    } catch (sendError: any) {
      toast({
        title: "Message not sent",
        description: sendError.message || "Please try again in a moment.",
        variant: "destructive",
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
                Coordinate pickup windows, confirm return dates, and keep every exchange in one thread.
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              {isLoading ? (
                <div className="flex h-[420px] items-center justify-center rounded-lg border bg-white">
                  <p className="text-sm text-muted-foreground">Loading your conversations...</p>
                </div>
              ) : error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
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
