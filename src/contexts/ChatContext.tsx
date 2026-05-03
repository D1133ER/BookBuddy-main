import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { chatService, type ChatMessage, type ChatConversation } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_DB_CHANGE_EVENT } from '@/lib/mockDb';

interface ChatContextType {
  conversations: ChatConversation[];
  activeConversation: ChatConversation | null;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  typingUsers: Map<string, boolean>;
  onlineUsers: Set<string>;
  setActiveConversation: (conversation: ChatConversation | null) => void;
  sendMessage: (recipientId: string, content: string) => Promise<void>;
  sendTyping: (recipientId: string, isTyping: boolean) => void;
  markAsRead: (conversationId: string) => void;
  refreshConversations: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoggedIn } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!isLoggedIn) {
      setConversations([]);
      setIsLoading(false);
      return;
    }

    try {
      const convs = await chatService.getConversations();
      setConversations(convs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  // Initialize chat connection
  useEffect(() => {
    if (!user?.id) {
      chatService.disconnect();
      setIsConnected(false);
      setConversations([]);
      return;
    }

    // Connect to chat
    chatService.connect(user.id);
    setIsConnected(chatService.getConnectionStatus());

    // Load initial conversations
    void loadConversations();

    // Subscribe to chat events
    const unsubscribe = chatService.subscribe(async (event) => {
      switch (event.type) {
        case 'message': {
          const message = event.payload as ChatMessage;
          // Reload conversations when new message arrives
          await loadConversations();
          // Also update active conversation if it matches
          if (
            activeConversation &&
            (activeConversation.id === message.senderId ||
              activeConversation.id === message.recipientId)
          ) {
            const updated = await chatService.getConversation(activeConversation.id);
            setActiveConversation(updated);
          }
          break;
        }

        case 'typing': {
          const { userId, isTyping } = event.payload as {
            userId: string;
            isTyping: boolean;
          };
          if (userId !== user.id) {
            setTypingUsers((prev) => {
              const next = new Map(prev);
              if (isTyping) {
                next.set(userId, true);
              } else {
                next.delete(userId);
              }
              return next;
            });

            // Clear typing indicator after 3 seconds
            if (isTyping) {
              setTimeout(() => {
                setTypingUsers((prev) => {
                  const next = new Map(prev);
                  next.delete(userId);
                  return next;
                });
              }, 3000);
            }
          }
          break;
        }

        case 'read':
        case 'userStatus':
        case 'usersOnline': {
          if (event.type === 'usersOnline' && Array.isArray(event.payload)) {
            setOnlineUsers(new Set(event.payload as unknown as string[]));
          }
          await loadConversations();
          break;
        }

        case 'connected':
        case 'disconnected': {
          setIsConnected(chatService.getConnectionStatus());
          break;
        }
      }
    });

    // Listen for DB changes
    const handleDbChange = () => {
      void loadConversations();
    };
    window.addEventListener(MOCK_DB_CHANGE_EVENT, handleDbChange);

    return () => {
      unsubscribe();
      chatService.disconnect();
      window.removeEventListener(MOCK_DB_CHANGE_EVENT, handleDbChange);
    };
  }, [user?.id, isLoggedIn, loadConversations]);

  // Update active conversation when conversations list changes
  useEffect(() => {
    const updateActiveConv = async () => {
      if (activeConversation) {
        const updated = await chatService.getConversation(activeConversation.id);
        setActiveConversation(updated);
      }
    };
    void updateActiveConv();
  }, [conversations]);

  const handleSendMessage = useCallback(
    async (recipientId: string, content: string) => {
      try {
        await chatService.sendMessage(recipientId, content);
        await loadConversations();
      } catch (err) {
        throw err;
      }
    },
    [loadConversations],
  );

  const handleSendTyping = useCallback((recipientId: string, isTyping: boolean) => {
    chatService.sendTypingIndicator(recipientId, isTyping);
  }, []);

  const handleMarkAsRead = useCallback(
    async (conversationId: string) => {
      chatService.markAsRead(conversationId);
      await loadConversations();
    },
    [loadConversations],
  );

  const refreshConversations = useCallback(() => {
    void loadConversations();
  }, [loadConversations]);

  const handleSetActiveConversation = useCallback((conversation: ChatConversation | null) => {
    setActiveConversation(conversation);
  }, []);

  const value: ChatContextType = {
    conversations,
    activeConversation,
    isLoading,
    error,
    isConnected,
    typingUsers,
    onlineUsers,
    setActiveConversation: handleSetActiveConversation,
    sendMessage: handleSendMessage,
    sendTyping: handleSendTyping,
    markAsRead: handleMarkAsRead,
    refreshConversations,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
