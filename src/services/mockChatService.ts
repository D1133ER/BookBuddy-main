/**
 * Real-time chat service using Socket.IO
 * Enables real-time messaging with the server
 */

import { io, Socket } from 'socket.io-client';
import { db } from '@/lib/mockDb';
import { MOCK_DB_CHANGE_EVENT } from '@/lib/mockDb';

export interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatConversation {
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
  messages: ChatMessage[];
  unreadCount: number;
}

export type ChatEventType =
  | 'message'
  | 'typing'
  | 'read'
  | 'connected'
  | 'disconnected'
  | 'userStatus'
  | 'usersOnline';

interface ChatEvent {
  type: ChatEventType;
  payload: unknown;
  senderId?: string;
  timestamp: string;
}

interface TypingPayload {
  userId: string;
  isTyping: boolean;
}

type ChatEventHandler = (event: ChatEvent) => void;

class ChatService {
  private socket: Socket | null = null;
  private handlers: Set<ChatEventHandler> = new Set();
  private userId: string | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageQueue: Array<{ recipientId: string; content: string }> = [];

  constructor() {
    this.initSocket();
  }

  private initSocket() {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

    try {
      this.socket = io(socketUrl, {
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        transports: ['websocket', 'polling'],
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('[ChatService] Failed to initialize socket:', error);
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // Rejoin if we have a user ID
      if (this.userId) {
        this.socket?.emit('user:join', this.userId);
      }

      // Flush queued messages
      this.flushMessageQueue();

      if (this.socket) {
        this.emitEvent('connected', { socketId: this.socket.id });
      }
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      this.emitEvent('disconnected', { reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('[ChatService] Connection error:', error);
      this.reconnectAttempts++;
    });

    // Handle incoming private messages
    this.socket.on('message:new', async (message: ChatMessage) => {
      // Save to local DB for persistence
      await this.saveMessageToLocal(message);

      // Emit to handlers
      this.emitEvent('message', message);

      // Dispatch change event
      window.dispatchEvent(
        new CustomEvent(MOCK_DB_CHANGE_EVENT, {
          detail: { key: 'messages', message },
        }),
      );
    });

    // Handle message sent confirmation
    this.socket.on('message:sent', async (message: ChatMessage) => {
      await this.saveMessageToLocal(message);
      // Dispatch change event to refresh UI
      window.dispatchEvent(
        new CustomEvent(MOCK_DB_CHANGE_EVENT, {
          detail: { key: 'messages', message },
        }),
      );
    });

    // Handle typing indicators
    this.socket.on('typing:update', ({ userId, isTyping }: TypingPayload) => {
      this.emitEvent('typing', { userId, isTyping });
    });

    // Handle read receipts
    this.socket.on(
      'message:read',
      ({ conversationId, readBy }: { conversationId: string; readBy: string }) => {
        this.emitEvent('read', { conversationId, readBy });

        window.dispatchEvent(
          new CustomEvent(MOCK_DB_CHANGE_EVENT, {
            detail: { key: 'messages', readBy },
          }),
        );
      },
    );

    // Handle user status updates
    this.socket.on('user:status', ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
      this.emitEvent('userStatus', { userId, isOnline });
    });

    // Handle online users list
    this.socket.on('users:online', (userIds: string[]) => {
      this.emitEvent('usersOnline', userIds);
    });
  }

  private async saveMessageToLocal(message: ChatMessage) {
    // Check if message already exists
    const messages = await db.getMessages();
    const exists = messages.some((m) => m.id === message.id);
    if (!exists) {
      const messageRecord: Awaited<ReturnType<typeof db.getMessages>>[0] = {
        id: message.id,
        sender_id: message.senderId,
        recipient_id: message.recipientId,
        content: message.content,
        is_read: message.isRead,
        created_at: message.timestamp,
      };
      await db.setMessages([...messages, messageRecord]);
    }
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const { recipientId, content } = this.messageQueue.shift()!;
      this.sendMessageToServer(recipientId, content);
    }
  }

  private sendMessageToServer(recipientId: string, content: string) {
    if (!this.socket || !this.userId) return;

    const messageId = db.generateId();
    const timestamp = new Date().toISOString();

    this.socket.emit('message:private', {
      recipientId,
      senderId: this.userId,
      content,
      timestamp,
      messageId,
    });
  }

  private emitEvent(type: ChatEventType, payload: unknown) {
    const event: ChatEvent = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    this.handlers.forEach((handler) => {
      try {
        handler(event);
      } catch (e) {
        console.error('[ChatService] Handler error:', e);
      }
    });
  }

  connect(userId: string) {
    this.userId = userId;

    if (!this.socket) {
      this.initSocket();
    }

    if (this.socket) {
      this.socket.connect();

      // Join with user ID after connection
      this.socket.once('connect', () => {
        this.socket?.emit('user:join', userId);
      });
    }
  }

  disconnect() {
    if (this.userId && this.socket) {
      this.socket.emit('user:leave', this.userId);
    }

    this.userId = null;
    this.socket?.disconnect();
    this.socket = null;
    this.isConnected = false;
  }

  subscribe(handler: ChatEventHandler): () => void {
    this.handlers.add(handler);

    return () => {
      this.handlers.delete(handler);
    };
  }

  isSupported(): boolean {
    return true;
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  async sendMessage(recipientId: string, content: string): Promise<ChatMessage> {
    if (!this.userId) {
      throw new Error('User not authenticated');
    }

    const messageId = db.generateId();
    const timestamp = new Date().toISOString();

    const message: ChatMessage = {
      id: messageId,
      senderId: this.userId,
      recipientId,
      content,
      timestamp,
      isRead: false,
    };

    if (this.socket && this.isConnected) {
      this.sendMessageToServer(recipientId, content);
    } else {
      this.messageQueue.push({ recipientId, content });
      await this.saveMessageToLocal(message);
    }

    return message;
  }

  sendTypingIndicator(recipientId: string, isTyping: boolean) {
    if (!this.socket || !this.userId || !this.isConnected) return;

    this.socket.emit(isTyping ? 'typing:start' : 'typing:stop', {
      senderId: this.userId,
      recipientId,
    });
  }

  markAsRead(conversationId: string) {
    if (!this.socket || !this.userId || !this.isConnected) return;

    this.socket.emit('message:read', {
      conversationId,
      readerId: this.userId,
      readBy: this.userId,
    });
  }

  async getMessageHistory(otherUserId: string): Promise<ChatMessage[]> {
    // No socket — fall back to local DB immediately
    if (!this.socket || !this.userId) {
      return this.getLocalMessages(otherUserId);
    }

    return new Promise<ChatMessage[]>((resolve) => {
      let settled = false;

      // Fallback: use local DB if the server doesn't reply within 2 s
      const fallbackTimer = setTimeout(() => {
        if (!settled) {
          settled = true;
          void this.getLocalMessages(otherUserId).then(resolve);
        }
      }, 2000);

      this.socket!.emit(
        'message:history',
        { userId: this.userId, otherUserId },
        (history: ChatMessage[]) => {
          if (!settled) {
            settled = true;
            clearTimeout(fallbackTimer);
            resolve(history);
          }
        },
      );
    });
  }

  private async getLocalMessages(otherUserId: string): Promise<ChatMessage[]> {
    const session = await db.getSession();
    const user = session?.user;
    if (!user) return [];

    const messages = (await db.getMessages())
      .filter(
        (m) =>
          (m.sender_id === user.id && m.recipient_id === otherUserId) ||
          (m.sender_id === otherUserId && m.recipient_id === user.id),
      )
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateA - dateB;
      });

    return messages.map((m) => ({
      id: m.id,
      senderId: m.sender_id,
      recipientId: m.recipient_id,
      content: m.content,
      timestamp: m.created_at || '',
      isRead: m.is_read,
    }));
  }

  async getConversations(): Promise<ChatConversation[]> {
    const session = await db.getSession();
    const user = session?.user;
    if (!user) return [];

    const messages = (await db.getMessages())
      .filter((m) => m.sender_id === user.id || m.recipient_id === user.id)
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });

    const conversations = new Map();
    const users = await db.getUsers();

    messages.forEach((message) => {
      const isCurrentUserSender = message.sender_id === user.id;
      const otherUserId = isCurrentUserSender ? message.recipient_id : message.sender_id;

      const otherUser = users.find((u) => u.id === otherUserId);
      if (!otherUser) return;

      if (!conversations.has(otherUserId)) {
        conversations.set(otherUserId, {
          id: otherUserId,
          user: {
            id: otherUserId,
            name: otherUser.display_name || otherUser.username,
            avatar: otherUser.avatar_url,
          },
          lastMessage: {
            text: message.content,
            timestamp: message.created_at || '',
            isRead: message.is_read || isCurrentUserSender,
          },
          messages: [],
          unreadCount: 0,
        });
      }

      const conversation = conversations.get(otherUserId);

      if (!isCurrentUserSender && !message.is_read) {
        conversation.unreadCount++;
      }

      conversation.messages.push({
        id: message.id,
        senderId: message.sender_id,
        recipientId: message.recipient_id,
        content: message.content,
        timestamp: message.created_at || '',
        isRead: message.is_read || isCurrentUserSender,
      });
    });

    for (const conversation of conversations.values()) {
      conversation.messages.sort(
        (a: ChatMessage, b: ChatMessage) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
    }

    return Array.from(conversations.values());
  }

  async getConversation(otherUserId: string): Promise<ChatConversation | null> {
    const session = await db.getSession();
    const user = session?.user;
    if (!user) return null;

    const allMessages = await db.getMessages();
    const messages = allMessages
      .filter(
        (m) =>
          (m.sender_id === user.id && m.recipient_id === otherUserId) ||
          (m.sender_id === otherUserId && m.recipient_id === user.id),
      )
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateA - dateB;
      });

    const users = await db.getUsers();
    const otherUser = users.find((u) => u.id === otherUserId);
    if (!otherUser) return null;

    let updated = false;
    allMessages.forEach((m) => {
      if (m.recipient_id === user.id && m.sender_id === otherUserId && !m.is_read) {
        m.is_read = true;
        updated = true;
      }
    });

    if (updated) {
      await db.setMessages([...allMessages]);
    }

    const formattedMessages: ChatMessage[] = messages.map((m) => ({
      id: m.id,
      senderId: m.sender_id,
      recipientId: m.recipient_id,
      content: m.content,
      timestamp: m.created_at || '',
      isRead: m.is_read,
    }));

    const latestMessage = formattedMessages[formattedMessages.length - 1];

    return {
      id: otherUserId,
      user: {
        id: otherUserId,
        name: otherUser.display_name || otherUser.username,
        avatar: otherUser.avatar_url,
      },
      lastMessage: {
        text: latestMessage?.content || 'No messages yet',
        timestamp: latestMessage?.timestamp || new Date().toISOString(),
        isRead: true,
      },
      messages: formattedMessages,
      unreadCount: 0,
    };
  }
}

export const chatService = new ChatService();
