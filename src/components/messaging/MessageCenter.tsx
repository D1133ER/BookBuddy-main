import { useEffect, useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Wifi, WifiOff } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createFadeUpItem, createHoverLift, createPageVariants, createStaggerContainer, pressScale } from "@/lib/motion";
import { useChat } from "@/contexts/ChatContext";

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

interface MessageCenterProps {
  conversations?: Conversation[];
  currentUserId?: string;
  initialConversationId?: string | null;
  onSendMessage?: (recipientId: string, content: string) => Promise<void> | void;
}

const MessageCenter = ({
  conversations = [],
  currentUserId,
  initialConversationId = null,
  onSendMessage,
}: MessageCenterProps) => {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [selectedConversation, setSelectedConversation] = useState<string | null>(initialConversationId);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { typingUsers, isConnected, sendTyping, onlineUsers } = useChat();

  const currentConversation = conversations.find((conv) => conv.id === selectedConversation);
  const listVariants = createStaggerContainer(shouldReduceMotion, 0.07, 0.02);
  const itemVariants = createFadeUpItem(shouldReduceMotion, 14);
  const threadVariants = createPageVariants(shouldReduceMotion);

  // Check if other user is typing
  const otherUserTyping = selectedConversation ? typingUsers.get(selectedConversation) : false;
  // Check if other user is online
  const otherUserOnline = selectedConversation ? onlineUsers.has(selectedConversation) : false;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentConversation?.messages]);

  useEffect(() => {
    if (initialConversationId && conversations.some((conversation) => conversation.id === initialConversationId)) {
      setSelectedConversation(initialConversationId);
      return;
    }

    if (selectedConversation && conversations.some((conversation) => conversation.id === selectedConversation)) {
      return;
    }

    setSelectedConversation(conversations[0]?.id || null);
  }, [conversations, initialConversationId, selectedConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !onSendMessage) return;

    setIsSending(true);
    setIsTyping(false);

    try {
      await onSendMessage(selectedConversation, newMessage.trim());
      setNewMessage("");
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Send typing indicator
    if (!isTyping && selectedConversation) {
      setIsTyping(true);
      sendTyping(selectedConversation, true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (selectedConversation) {
        sendTyping(selectedConversation, false);
      }
    }, 2000);
  };

  // Clean up typing on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (selectedConversation && isTyping) {
        sendTyping(selectedConversation, false);
      }
    };
  }, [selectedConversation, isTyping, sendTyping]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  if (conversations.length === 0) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-lg border bg-white p-8 text-center">
        <div>
          <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-slate-900">No conversations yet</h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Send a request from the catalog to start coordinating pickup, due dates, and returns with another reader.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[600px] border rounded-lg overflow-hidden">
      {/* Conversation List */}
      <div className="md:w-1/3 border-r">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages
          </h2>
          <div className="flex items-center" aria-label={isConnected ? "Connected" : "Reconnecting..."} title={isConnected ? "Connected" : "Reconnecting..."}>
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-muted-foreground animate-pulse" />
            )}
          </div>
        </div>
        <motion.div
          initial="hidden"
          animate="show"
          variants={listVariants}
          className="overflow-y-auto h-[calc(600px-57px)]"
        >
          {conversations.map((conversation) => (
            <motion.div
              key={conversation.id}
              variants={itemVariants}
              whileHover={createHoverLift(shouldReduceMotion, -2)}
              className={`p-3 border-b hover:bg-muted/50 cursor-pointer transition-colors ${selectedConversation === conversation.id ? "bg-muted" : ""}`}
              onClick={() => setSelectedConversation(conversation.id)}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={conversation.user.avatar || undefined} alt={conversation.user.name} />
                    <AvatarFallback>
                      {conversation.user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {!conversation.lastMessage.isRead && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary"></span>
                  )}
                  {onlineUsers.has(conversation.id) && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white" title="Online"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium truncate">
                      {conversation.user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(conversation.lastMessage.timestamp)}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage.text}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Message Thread */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence initial={false} mode="wait">
        {selectedConversation && currentConversation ? (
          <motion.div
            key={currentConversation.id}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={threadVariants}
            className="flex-1 flex flex-col"
          >
            <div className="p-4 border-b flex items-center space-x-3">
              <div className="relative">
                <Avatar>
                  <AvatarImage src={currentConversation.user.avatar || undefined} alt={currentConversation.user.name} />
                  <AvatarFallback>
                    {currentConversation.user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {otherUserOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white" title="Online"></span>
                )}
              </div>
              <div>
                <p className="font-medium">{currentConversation.user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {otherUserOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>

            <motion.div
              initial="hidden"
              animate="show"
              variants={listVariants}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {currentConversation.messages.map((message) => {
                const isCurrentUser = currentUserId ? message.senderId === currentUserId : false;
                return (
                  <motion.div
                    key={message.id}
                    variants={itemVariants}
                    className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  placeholder={otherUserTyping ? "对方正在输入..." : "Type a message..."}
                  value={newMessage}
                  onChange={handleInputChange}
                  className="flex-1"
                />
                <motion.div whileHover={createHoverLift(shouldReduceMotion, -2)} whileTap={pressScale}>
                  <Button type="submit" size="icon" aria-label="Send message" disabled={isSending || !newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </motion.div>
              </form>
              {otherUserTyping && (
                <p className="text-xs text-muted-foreground mt-1 animate-pulse">
                  {currentConversation?.user.name} is typing...
                </p>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={threadVariants}
            className="flex-1 flex items-center justify-center"
          >
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium">No conversation selected</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Select a conversation from the list to start messaging
              </p>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MessageCenter;
