import { Alert } from 'react-native';
import api from './api';

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'image' | 'location';
  status: 'sent' | 'delivered' | 'read';
}

export interface ChatConversation {
  id: string;
  participant1: string;
  participant2: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: Date;
}

class ChatService {
  private conversations: ChatConversation[] = [];
  private messages: Map<string, ChatMessage[]> = new Map();

  async initializeChat() {
    // Initialize chat service (Socket.io or similar)
    console.log('Chat service initialized');
  }

  async getConversations(): Promise<ChatConversation[]> {
    try {
      const response = await api.get('/chat/conversations');
      this.conversations = response.data.conversations.map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        lastMessage: c.lastMessage ? {
          ...c.lastMessage,
          timestamp: new Date(c.lastMessage.timestamp),
        } : undefined,
      }));
      return this.conversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      const response = await api.get(`/chat/messages/${conversationId}`);
      const messages = response.data.messages.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));
      this.messages.set(conversationId, messages);
      return messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  async sendMessage(
    conversationId: string,
    message: string,
    receiverId: string,
    type: 'text' | 'image' | 'location' = 'text'
  ): Promise<boolean> {
    try {
      const response = await api.post('/chat/send', {
        conversationId,
        message,
        receiverId,
        type,
      });

      if (response.data.success) {
        const newMessage: ChatMessage = {
          id: response.data.messageId,
          senderId: response.data.senderId,
          receiverId,
          message,
          timestamp: new Date(),
          type,
          status: 'sent',
        };

        // Add to local cache
        const currentMessages = this.messages.get(conversationId) || [];
        this.messages.set(conversationId, [...currentMessages, newMessage]);

        // Update conversation last message
        const conversation = this.conversations.find(c => c.id === conversationId);
        if (conversation) {
          conversation.lastMessage = newMessage;
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  async createConversation(userId1: string, userId2: string): Promise<string | null> {
    try {
      const response = await api.post('/chat/conversation', {
        userId1,
        userId2,
      });

      if (response.data.success) {
        return response.data.conversationId;
      }
      return null;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }

  async markAsRead(conversationId: string, messageIds: string[]): Promise<boolean> {
    try {
      const response = await api.post('/chat/mark-read', {
        conversationId,
        messageIds,
      });

      if (response.data.success) {
        // Update local messages status
        const messages = this.messages.get(conversationId) || [];
        messages.forEach(msg => {
          if (messageIds.includes(msg.id)) {
            msg.status = 'read';
          }
        });
        this.messages.set(conversationId, messages);

        // Update unread count
        const conversation = this.conversations.find(c => c.id === conversationId);
        if (conversation) {
          conversation.unreadCount = Math.max(0, conversation.unreadCount - messageIds.length);
        }
      }

      return response.data.success;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  }

  // WebSocket/Socket.io integration would go here
  setupSocketListeners() {
    // Example socket event listeners
    /*
    socket.on('message', (message: ChatMessage) => {
      this.handleIncomingMessage(message);
    });

    socket.on('message-status', (data: { messageId: string; status: string }) => {
      this.updateMessageStatus(data.messageId, data.status);
    });
    */
  }

  private handleIncomingMessage(message: ChatMessage) {
    const conversationId = this.getConversationId(message.senderId, message.receiverId);
    const currentMessages = this.messages.get(conversationId) || [];
    this.messages.set(conversationId, [...currentMessages, message]);

    // Update conversation
    const conversation = this.conversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.lastMessage = message;
      conversation.unreadCount += 1;
    } else {
      // Create new conversation if it doesn't exist
      this.conversations.push({
        id: conversationId,
        participant1: message.senderId,
        participant2: message.receiverId,
        lastMessage: message,
        unreadCount: 1,
        createdAt: new Date(),
      });
    }
  }

  private getConversationId(userId1: string, userId2: string): string {
    const sortedIds = [userId1, userId2].sort();
    return `conv_${sortedIds[0]}_${sortedIds[1]}`;
  }
}

export const chatService = new ChatService();