import { db } from '@/lib/mockDb';

export type Message = Awaited<ReturnType<typeof db.getMessages>>[0];

export async function getConversations() {
  const session = await db.getSession();
  const user = session?.user;
  if (!user) throw new Error('User not authenticated');

  // Get all messages where the current user is either sender or recipient
  const allMessages = await db.getMessages();
  const messages = allMessages
    .filter((m) => m.sender_id === user.id || m.recipient_id === user.id)
    .sort((a, b) => (a.created_at && b.created_at && a.created_at < b.created_at ? 1 : -1));

  // Group messages by conversation (unique user pairs)
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
          timestamp: message.created_at,
          isRead: message.is_read || isCurrentUserSender,
        },
        messages: [],
      });
    }

    // Add message to conversation
    const conversation = conversations.get(otherUserId);
    conversation.messages.push({
      id: message.id,
      senderId: message.sender_id,
      text: message.content,
      timestamp: message.created_at,
    });
  });

  // Sort messages within each conversation by timestamp
  for (const conversation of conversations.values()) {
    conversation.messages.sort(
      (a: { timestamp: string }, b: { timestamp: string }) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  }

  return Array.from(conversations.values());
}

export async function getConversation(otherUserId: string) {
  const session = await db.getSession();
  const user = session?.user;
  if (!user) throw new Error('User not authenticated');

  // Get all messages between current user and other user
  const allMessages = await db.getMessages();
  const messages = allMessages
    .filter(
      (m) =>
        (m.sender_id === user.id && m.recipient_id === otherUserId) ||
        (m.sender_id === otherUserId && m.recipient_id === user.id),
    )
    .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());

  // Get other user details
  const users = await db.getUsers();
  const otherUserData = users.find((u) => u.id === otherUserId);

  if (!otherUserData) throw new Error('User not found');

  // Mark unread messages as read
  let updated = false;
  allMessages.forEach((m) => {
    if (m.recipient_id === user.id && m.sender_id === otherUserId && !m.is_read) {
      m.is_read = true;
      updated = true;
    }
  });

  if (updated) {
    await db.setMessages(allMessages);
  }

  // Format messages
  const formattedMessages = messages.map((message) => ({
    id: message.id,
    senderId: message.sender_id,
    text: message.content,
    timestamp: message.created_at,
  }));

  const latestMessage = formattedMessages[formattedMessages.length - 1];

  return {
    id: otherUserId,
    user: {
      id: otherUserId,
      name: otherUserData.display_name || otherUserData.username,
      avatar: otherUserData.avatar_url,
    },
    lastMessage: {
      text: latestMessage?.text || 'No messages yet',
      timestamp: latestMessage?.timestamp || new Date().toISOString(),
      isRead: true,
    },
    messages: formattedMessages,
  };
}

export async function sendMessage(recipientId: string, content: string) {
  const session = await db.getSession();
  const user = session?.user;
  if (!user) throw new Error('User not authenticated');

  const newMessage: Message = {
    id: db.generateId(),
    sender_id: user.id,
    recipient_id: recipientId,
    content: content,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  const allMessages = await db.getMessages();
  await db.setMessages([...allMessages, newMessage]);
  return newMessage;
}
