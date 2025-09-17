import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Avatar, IconButton, useTheme, Searchbar } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

type User = {
  id: number;
  name: string;
  avatar: any;
  status: 'online' | 'away' | 'offline';
  lastSeen: string;
  lastMessage: string;
  unreadCount: number;
  timestamp: string;
  role?: string;
};

type MessageStatus = 'sent' | 'delivered' | 'read';

type Message = {
  id: number;
  text: string;
  sender: number | 'me';
  timestamp: Date;
  status: MessageStatus;
};

type MessagesByUser = Record<number, Message[]>;
type TypingStatus = Record<number, boolean>;

const GEMINI_API_KEY = ''; 
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const ChatScreen: React.FC = () => {
  const theme = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<MessagesByUser>({});
  const [isTyping, setIsTyping] = useState<TypingStatus>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showUserList, setShowUserList] = useState<boolean>(true);

  const users: User[] = [
    {
      id: 1,
      name: 'Vivek Kumar Jha',
      avatar: require('../../assets/images/vivek.jpg'),
      status: 'online',
      lastSeen: 'Active now',
      lastMessage: 'Hey, how are you doing?',
      unreadCount: 2,
      timestamp: '2:30 PM',
      role: 'Senior Developer',
    },
    {
      id: 2,
      name: 'Saqib Nadeem',
      avatar: require('../../assets/images/saqib.jpg'),
      status: 'online',
      lastSeen: 'Active now',
      lastMessage: "Let's schedule a meeting",
      unreadCount: 0,
      timestamp: '1:45 PM',
      role: 'Product Manager',
    },
    {
      id: 3,
      name: 'Sushant kumar',
      avatar: require('../../assets/images/sushant.jpg'),
      status: 'away',
      lastSeen: '5 min ago',
      lastMessage: 'Thanks for the update!',
      unreadCount: 0,
      timestamp: '12:20 PM',
      role: 'UI/UX Designer',
    },
    {
      id: 4,
      name: 'Swastika Jaiswal',
      avatar: require('../../assets/images/swastika.jpg'),
      status: 'offline',
      lastSeen: '1 hour ago',
      lastMessage: 'See you tomorrow',
      unreadCount: 1,
      timestamp: '11:30 AM',
      role: 'Business Analyst',
    },
    {
      id: 5,
      name: 'Priyani',
      avatar: require('../../assets/images/priyani.jpg'),
      status: 'online',
      lastSeen: 'Active now',
      lastMessage: "Perfect! Let me know when you're ready",
      unreadCount: 0,
      timestamp: '10:15 AM',
      role: 'QA Developer',
    },
    {
      id: 6,
      name: 'Komal',
      avatar: require('../../assets/images/icon.jpg'),
      status: 'offline',
      lastSeen: '3 hour ago',
      lastMessage: "Good Work !",
      unreadCount: 0,
      timestamp: '7:15 AM',
      role: 'Backend Developer',
    },
  ];

  useEffect(() => {
    const initialMessages: MessagesByUser = {};
    users.forEach((user) => {
      initialMessages[user.id] = [
        {
          id: 1,
          text: user.lastMessage,
          sender: user.id,
          timestamp: new Date(Date.now() - Math.random() * 3600000),
          status: 'read',
        },
      ];
    });
    setMessages(initialMessages);
  }, []);

  const getGeminiReply = async (inputText: string): Promise<string> => {
  try {
    const body = {
      contents: [
        {
          parts: [
            { text: inputText }
          ],
        },
      ],
    };

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    // Check new structure:
    if (
      data.candidates &&
      data.candidates.length > 0 &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts.length > 0
    ) {
      return data.candidates[0].content.parts[0].text;
    } else {
      return "Sorry, I couldn't generate a response.";
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    return 'Sorry, there was an error getting a response.';
  }
};

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedUser) return;

    const newMessage: Message = {
      id: Date.now(),
      text: message.trim(),
      sender: 'me',
      timestamp: new Date(),
      status: 'sent',
    };

    const messageToSend = message.trim();

    setMessages((prev) => ({
      ...prev,
      [selectedUser.id]: [...(prev[selectedUser.id] || []), newMessage],
    }));
    setMessage('');
    scrollToBottom();

    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [selectedUser.id]: prev[selectedUser.id].map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        ),
      }));
    }, 1000);

    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [selectedUser.id]: prev[selectedUser.id].map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
        ),
      }));
    }, 2000);

    setIsTyping((prev) => ({ ...prev, [selectedUser.id]: true }));

    const replyText = await getGeminiReply(messageToSend);

    setIsTyping((prev) => ({ ...prev, [selectedUser.id]: false }));

    const reply: Message = {
      id: Date.now() + 1,
      text: replyText,
      sender: selectedUser.id,
      timestamp: new Date(),
      status: 'read',
    };

    setMessages((prev) => ({
      ...prev,
      [selectedUser.id]: [...prev[selectedUser.id], reply],
    }));

    scrollToBottom();
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'online':
        return '#10B981';
      case 'away':
        return '#F59E0B';
      case 'offline':
      default:
        return '#6B7280';
    }
  };

  const getMessageStatusIcon = (status: MessageStatus) => {
    const iconColor = theme.dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)';
    switch (status) {
      case 'sent':
        return <MaterialCommunityIcons name="clock-outline" size={14} color={iconColor} />;
      case 'delivered':
        return <MaterialCommunityIcons name="check" size={14} color={iconColor} />;
      case 'read':
        return <MaterialCommunityIcons name="check-all" size={14} color={theme.colors.primary} />;
      default:
        return null;
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const isSelected = selectedUser?.id === item.id;
    const hasUnread = item.unreadCount > 0;

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedUser(item);
          setShowUserList(false);
        }}
        style={[
          styles.userItem,
          {
            backgroundColor: isSelected ? theme.colors.primary + '10' : 'transparent',
          },
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Avatar.Image size={50} source={item.avatar} />
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
        </View>

        <View style={styles.userContent}>
          <View style={styles.userHeader}>
            <Text
              numberOfLines={1}
              style={[
                styles.userName,
                {
                  color: theme.colors.onSurface,
                  fontWeight: hasUnread ? '700' : '600',
                },
              ]}
            >
              {item.name}
            </Text>
            <Text
              style={[
                styles.timestamp,
                {
                  color: hasUnread ? theme.colors.primary : theme.colors.onSurfaceVariant,
                  fontWeight: hasUnread ? '600' : '400',
                },
              ]}
            >
              {item.timestamp}
            </Text>
          </View>

          <Text style={[styles.userRole, { color: theme.colors.onSurfaceVariant }]}>{item.role}</Text>

          <Text
            numberOfLines={1}
            style={[
              styles.lastMessage,
              {
                color: hasUnread ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
                fontWeight: hasUnread ? '500' : '400',
              },
            ]}
          >
            {item.lastMessage}
          </Text>
        </View>

        <View style={styles.userMeta}>
          {hasUnread && (
            <View style={[styles.unreadBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={theme.colors.onSurfaceVariant}
            style={{ opacity: 0.5 }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isMe = item.sender === 'me';
    return (
      <View style={[styles.messageContainer, isMe && styles.messageContainerMe]}>
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isMe
                ? theme.colors.primary
                : theme.dark
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(0,0,0,0.05)',
            },
            isMe ? styles.messageBubbleMe : styles.messageBubbleOther,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              {
                color: isMe ? '#FFFFFF' : theme.colors.onSurface,
              },
            ]}
          >
            {item.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.messageTime,
                {
                  color: isMe ? 'rgba(255,255,255,0.8)' : theme.colors.onSurfaceVariant,
                },
              ]}
            >
              {formatTime(item.timestamp)}
            </Text>
            {isMe && <View style={styles.messageStatus}>{getMessageStatusIcon(item.status)}</View>}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.mainContainer}>
          {/* Sidebar */}
          {showUserList && (
            <View
              style={[
                styles.sidebar,
                {
                  backgroundColor: theme.colors.surface,
                  borderRightColor: theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                },
              ]}
            >
              {/* Header */}
              <View
                style={[
                  styles.sidebarHeader,
                  {
                    borderBottomColor: theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                  },
                ]}
              >
                <View style={styles.headerContent}>
                  <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>Messages</Text>
                  <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                    {users.length} contacts
                  </Text>
                </View>
                <IconButton
                  icon="plus"
                  size={24}
                  onPress={() => {}}
                  iconColor={theme.colors.primary}
                />
              </View>

              {/* Search */}
              <View style={styles.searchContainer}>
                <Searchbar
                  placeholder="Search conversations..."
                  onChangeText={setSearchQuery}
                  value={searchQuery}
                  style={[
                    styles.searchBar,
                    {
                      backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    },
                  ]}
                  inputStyle={{ color: theme.colors.onSurface }}
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  iconColor={theme.colors.onSurfaceVariant}
                />
              </View>

              {/* User List */}
              <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderUserItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.userList}
              />
            </View>
          )}

          {/* Chat Area */}
          <View style={styles.chatArea}>
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <View
                  style={[
                    styles.chatHeader,
                    {
                      backgroundColor: theme.colors.surface,
                      borderBottomColor: theme.dark
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(0,0,0,0.08)',
                    },
                  ]}
                >
                  <TouchableOpacity onPress={() => setShowUserList(true)} style={styles.backButton}>
                    <MaterialCommunityIcons
                      name="arrow-left"
                      size={24}
                      color={theme.colors.onSurface}
                    />
                  </TouchableOpacity>

                  <View style={styles.chatUserInfo}>
                    <View style={styles.chatAvatarContainer}>
                      <Avatar.Image size={40} source={selectedUser.avatar} />
                      <View
                        style={[
                          styles.chatStatusIndicator,
                          {
                            backgroundColor: getStatusColor(selectedUser.status),
                            borderColor: theme.colors.surface,
                          },
                        ]}
                      />
                    </View>
                    <View style={styles.chatUserDetails}>
                      <Text style={[styles.chatUserName, { color: theme.colors.onSurface }]}>
                        {selectedUser.name}
                      </Text>
                      <Text style={[styles.chatUserStatus, { color: theme.colors.onSurfaceVariant }]}>
                        {isTyping[selectedUser.id] ? 'Typing...' : selectedUser.lastSeen}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.chatActions}>
                    <IconButton
                      icon="phone"
                      size={20}
                      onPress={() => {}}
                      iconColor={theme.colors.onSurfaceVariant}
                    />
                    <IconButton
                      icon="video"
                      size={20}
                      onPress={() => {}}
                      iconColor={theme.colors.onSurfaceVariant}
                    />
                    <IconButton
                      icon="dots-vertical"
                      size={20}
                      onPress={() => {}}
                      iconColor={theme.colors.onSurfaceVariant}
                    />
                  </View>
                </View>

                {/* Messages */}
                <FlatList
                  ref={flatListRef}
                  data={messages[selectedUser.id] || []}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderMessageItem}
                  contentContainerStyle={styles.messagesContainer}
                  showsVerticalScrollIndicator={false}
                  onContentSizeChange={scrollToBottom}
                />

                {/* Message Input */}
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: theme.colors.surface,
                      borderTopColor: theme.dark
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(0,0,0,0.08)',
                    },
                  ]}
                >
                  <IconButton
                    icon="attachment"
                    size={20}
                    onPress={() => {}}
                    iconColor={theme.colors.onSurfaceVariant}
                  />
                  <TextInput
                    value={message}
                    onChangeText={setMessage}
                    onSubmitEditing={sendMessage}
                    placeholder="Type a message..."
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                    style={[
                      styles.textInput,
                      {
                        color: theme.colors.onSurface,
                        backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                      },
                    ]}
                    multiline
                    maxLength={1000}
                    returnKeyType="send"
                  />
                  <TouchableOpacity
                    onPress={sendMessage}
                    disabled={!message.trim()}
                    style={[
                      styles.sendButton,
                      {
                        backgroundColor: message.trim()
                          ? theme.colors.primary
                          : theme.colors.onSurfaceVariant + '30',
                      },
                    ]}
                  >
                    <MaterialCommunityIcons name="send" color="#FFFFFF" size={18} />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.emptyState}>
                <View style={[styles.emptyStateCard, { backgroundColor: theme.colors.surface }]}>
                  <MaterialCommunityIcons
                    name="chat-outline"
                    size={64}
                    color={theme.colors.primary}
                    style={{ opacity: 0.7 }}
                  />
                  <Text style={[styles.emptyStateTitle, { color: theme.colors.onSurface }]}>
                    Select a conversation
                  </Text>
                  <Text style={[styles.emptyStateSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                    Choose from your existing conversations or start a new one
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowUserList(true)}
                    style={[styles.startChatButton, { backgroundColor: theme.colors.primary }]}
                  >
                    <Text style={styles.startChatButtonText}>Start Chatting</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: width * 0.85,
    borderRightWidth: 1,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    elevation: 0,
    borderRadius: 12,
  },
  userList: {
    paddingBottom: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'white',
  },
  userContent: {
    flex: 1,
    marginLeft: 16,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
  },
  userRole: {
    fontSize: 12,
    marginTop: 2,
  },
  lastMessage: {
    fontSize: 14,
    marginTop: 4,
  },
  userMeta: {
    alignItems: 'center',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  chatArea: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  chatUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatAvatarContainer: {
    position: 'relative',
  },
  chatStatusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  chatUserDetails: {
    marginLeft: 12,
  },
  chatUserName: {
    fontSize: 16,
    fontWeight: '600',
  },
  chatUserStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  chatActions: {
    flexDirection: 'row',
  },
  messagesContainer: {
    padding: 16,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  messageContainerMe: {
    alignSelf: 'flex-end',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  messageBubbleMe: {
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  messageTime: {
    fontSize: 11,
  },
  messageStatus: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    fontSize: 15,
    marginHorizontal: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  startChatButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  startChatButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ChatScreen;
