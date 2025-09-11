import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

const GEMINI_API_KEY = ''; 
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const faqs = [
  {
    id: 1,
    question: 'How do I start using Waste2Wealth?',
    answer:
      'Getting started is easy! Download our app, create an account, and complete your profile. You can then start logging your waste activities, find nearby recycling centers, and connect with our community. Our onboarding tutorial will guide you through all the features.',
    category: 'Getting Started',
    icon: 'rocket-launch',
  },
  {
    id: 2,
    question: 'What types of waste can I track?',
    answer:
      'You can track various types of waste including plastic, paper, glass, metal, electronic waste, organic waste, and textiles. Our app provides specific categories and subcategories to help you accurately log your waste activities and get personalized recommendations.',
    category: 'Features',
    icon: 'recycle',
  },
  {
    id: 3,
    question: 'How does the reward system work?',
    answer:
      'Earn points for logging waste activities, participating in challenges, and achieving milestones. Points can be redeemed for discounts at partner stores, eco-friendly products, or donated to environmental causes. The more you engage, the more rewards you unlock!',
    category: 'Rewards',
    icon: 'star',
  },
  {
    id: 4,
    question: 'Is my data secure and private?',
    answer:
      'Absolutely! We use enterprise-grade encryption to protect your data. Your personal information is never shared without consent, and you have full control over your privacy settings.',
    category: 'Privacy',
    icon: 'shield-check',
  },
  {
    id: 5,
    question: 'Can I use the app offline?',
    answer:
      'Yes, many core features work offline including waste logging and viewing your history. Data automatically syncs when you reconnect to the internet.',
    category: 'Technical',
    icon: 'wifi-off',
  },
  {
    id: 6,
    question: 'Does Waste2Wealth cost money to use?',
    answer:
      'No, the core app is free to use. We also offer premium features such as advanced analytics and exclusive challenges through a subscription plan.',
    category: 'Pricing',
    icon: 'currency-dollar',
  },
  {
    id: 7,
    question: 'Can I connect with other users?',
    answer:
      'Yes! You can join community groups, participate in challenges, and share your achievements with friends and family.',
    category: 'Community',
    icon: 'users',
  },
  {
    id: 8,
    question: 'How accurate is the waste tracking system?',
    answer:
      'Our waste tracking is powered by a combination of AI recognition, user inputs, and verified recycling center data to ensure accuracy.',
    category: 'Features',
    icon: 'scale',
  },
  {
    id: 9,
    question: 'Can organizations or schools use Waste2Wealth?',
    answer:
      'Yes, we support enterprise and educational accounts where organizations can track group progress, host competitions, and access impact reports.',
    category: 'Business',
    icon: 'office-building',
  },
  {
    id: 10,
    question: 'How often should I log my waste activities?',
    answer:
      'You can log waste anytime, but daily tracking helps you stay consistent, earn more rewards, and get better insights.',
    category: 'Getting Started',
    icon: 'calendar-check',
  },
  {
    id: 11,
    question: 'Do you partner with recycling centers?',
    answer:
      'Yes, we work with certified recycling centers and update our database regularly so you can find trusted drop-off points instantly.',
    category: 'Partnerships',
    icon: 'map-pin',
  },
  {
    id: 12,
    question: 'What happens if I forget my password?',
    answer:
      'Simply tap “Forgot Password” on the login screen, and we’ll send you a secure link to reset it.',
    category: 'Account',
    icon: 'lock-closed',
  },
  {
    id: 13,
    question: 'Can I use the app in different languages?',
    answer:
      'Yes, Waste2Wealth supports multiple languages, and you can change your preference anytime in Settings.',
    category: 'Technical',
    icon: 'globe-alt',
  },
  {
    id: 14,
    question: 'How are challenges created?',
    answer:
      'Challenges can be created by our team or community leaders. They often focus on themes like “Plastic-Free Week” or “Recycling Challenge.”',
    category: 'Rewards',
    icon: 'flag',
  },
  {
    id: 15,
    question: 'Does the app show environmental impact?',
    answer:
      'Yes, you can see how much CO₂, water, and energy you’ve saved through your waste activities on your personal dashboard.',
    category: 'Features',
    icon: 'chart-bar',
  },
  {
    id: 16,
    question: 'Are there age restrictions to use Waste2Wealth?',
    answer:
      'Users must be at least 13 years old. Parental consent may be required in some regions for younger users.',
    category: 'Account',
    icon: 'identification',
  },
  {
    id: 17,
    question: 'How do I contact support?',
    answer:
      'You can reach us through the in-app Help section, email, or our 24/7 live chat support.',
    category: 'Support',
    icon: 'chat-alt',
  },
  {
    id: 18,
    question: 'Can I connect my account with social media?',
    answer:
      'Yes, you can link your account with platforms like Google, Facebook, or Apple for quick login and sharing achievements.',
    category: 'Account',
    icon: 'share',
  },
  {
    id: 19,
    question: 'Is Waste2Wealth available outside India?',
    answer:
      'Waste2Wealth is gradually expanding globally. Many features work worldwide, but some rewards and recycling center integrations are region-specific.',
    category: 'Availability',
    icon: 'globe',
  },
  {
    id: 20,
    question: 'Can I suggest new features for the app?',
    answer:
      'Definitely! We welcome user feedback. Share your suggestions in the in-app feedback form, and our team reviews all submissions.',
    category: 'Community',
    icon: 'light-bulb',
  },
  {
    id: 21,
    question: 'How do I delete my account?',
    answer:
      'You can request account deletion under Settings > Privacy. This will permanently erase your data from our servers.',
    category: 'Account',
    icon: 'trash',
  },
];

// Animated typing dots component
const TypingIndicator = () => {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (animatedValue: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 500,
            easing: Easing.linear,
            useNativeDriver: true,
            delay,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
      );

    const anim1 = createAnimation(dot1Anim, 0);
    const anim2 = createAnimation(dot2Anim, 200);
    const anim3 = createAnimation(dot3Anim, 400);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1Anim, dot2Anim, dot3Anim]);

  const dotStyle = (animatedValue: Animated.Value) => ({
    opacity: animatedValue,
    marginHorizontal: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#888',
  });

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
      <Animated.View style={dotStyle(dot1Anim)} />
      <Animated.View style={dotStyle(dot2Anim)} />
      <Animated.View style={dotStyle(dot3Anim)} />
    </View>
  );
};

const SupportScreen = () => {
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState<'faq' | 'chat' | 'contact'>('faq');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [userMessage, setUserMessage] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    { id: number; type: 'bot' | 'user'; message: string; timestamp: string }[]
  >([
    {
      id: 1,
      type: 'bot',
      message: "👋 Hello! I'm your Waste2Wealth support assistant. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const flatListRef = useRef<FlatList>(null);

  const theme = {
    colors: isDark
      ? {
          primary: '#10B981',
          secondary: '#3B82F6',
          background: '#0F172A',
          surface: '#1E293B',
          card: '#334155',
          text: '#F1F5F9',
          textSecondary: '#94A3B8',
          border: '#475569',
          accent: '#8B5CF6',
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
        }
      : {
          primary: '#059669',
          secondary: '#2563EB',
          background: '#FFFFFF',
          surface: '#F8FAFC',
          card: '#FFFFFF',
          text: '#1E293B',
          textSecondary: '#64748B',
          border: '#E2E8F0',
          accent: '#7C3AED',
          success: '#16A34A',
          warning: '#D97706',
          error: '#DC2626',
        },
  };

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getGeminiReply = async (inputText: string): Promise<string> => {
    try {
      const body = {
        contents: [
          {
            parts: [{ text: inputText }],
          },
        ],
      };

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

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

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    const newUserMessage = {
      id: Date.now(),
      type: 'user' as const,
      message: userMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newUserMessage]);
    setUserMessage('');
    setIsBotTyping(true); // Start typing indicator

    const responseText = await getGeminiReply(newUserMessage.message);

    const botResponse = {
      id: Date.now() + 1,
      type: 'bot' as const,
      message: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, botResponse]);
    setIsBotTyping(false); // Stop typing indicator
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatMessages.length > 0 || isBotTyping) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages, isBotTyping]);

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={isDark ? ['#602ae9ff', '#2d0a74ff'] : ['#1b0c6aff', '#0f248fff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Support Center</Text>
              <Text style={styles.headerSubtitle}>We're here to help you succeed</Text>
            </View>
            <TouchableOpacity onPress={() => setIsDark(!isDark)} style={styles.themeToggle}>
              <MaterialCommunityIcons
                name={isDark ? 'white-balance-sunny' : 'moon-waning-crescent'}
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderTabs = () => (
    <View style={[styles.tabsContainer, { backgroundColor: theme.colors.surface }]}>
      {[
        { key: 'faq', label: 'FAQ', icon: 'frequently-asked-questions' },
        { key: 'chat', label: 'Chat', icon: 'chat' },
        { key: 'contact', label: 'Contact', icon: 'phone' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => setActiveTab(tab.key as 'faq' | 'chat' | 'contact')}
          style={[
            styles.tabButton,
            activeTab === tab.key && { backgroundColor: theme.colors.primary },
          ]}
        >
          <MaterialCommunityIcons
            name={tab.icon}
            size={20}
            color={activeTab === tab.key ? '#FFFFFF' : theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === tab.key ? '#FFFFFF' : theme.colors.textSecondary },
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFAQTab = () => (
    <View style={styles.tabContent}>
      <View
        style={[styles.searchContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
      >
        <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textSecondary} />
        <TextInput
          placeholder="Search frequently asked questions..."
          placeholderTextColor={theme.colors.textSecondary}
          style={[styles.searchInput, { color: theme.colors.text }]}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {searchTerm ? (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <MaterialCommunityIcons name="close" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={filteredFAQs}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setExpandedFAQ(expandedFAQ === item.id ? null : item.id)}
            style={[styles.faqCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          >
            <View style={styles.faqHeader}>
              <View style={[styles.faqIconContainer, { backgroundColor: `${theme.colors.primary}20` }]}>
                <MaterialCommunityIcons name={item.icon} size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.faqContent}>
                <View style={[styles.categoryBadge, { backgroundColor: `${theme.colors.secondary}15` }]}>
                  <Text style={[styles.categoryText, { color: theme.colors.secondary }]}>{item.category}</Text>
                </View>
                <Text style={[styles.faqQuestion, { color: theme.colors.text }]}>{item.question}</Text>
              </View>
              <MaterialCommunityIcons
                name={expandedFAQ === item.id ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={theme.colors.textSecondary}
              />
            </View>
            {expandedFAQ === item.id && (
              <View style={styles.faqAnswer}>
                <Text style={[styles.faqAnswerText, { color: theme.colors.textSecondary }]}>
                  {item.answer}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="help-circle-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>No results found</Text>
            <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
              Try adjusting your search terms or browse all categories
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );

  const renderChatTab = () => (
    <View style={[styles.chatContainer, { backgroundColor: theme.colors.card }]}>
      <View style={styles.chatHeader}>
        <View style={styles.botInfo}>
          <View style={[styles.botAvatar, { backgroundColor: theme.colors.primary }]}>
            <MaterialCommunityIcons name="robot" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.botDetails}>
            <Text style={[styles.botName, { color: theme.colors.text }]}>Waste2Wealth Assistant</Text>
            <View style={styles.onlineStatus}>
              <View style={[styles.onlineDot, { backgroundColor: theme.colors.success }]} />
              <Text style={[styles.onlineText, { color: theme.colors.textSecondary }]}>Online now</Text>
            </View>
          </View>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={chatMessages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.messageRow, item.type === 'user' && styles.userMessageRow]}>
            <View
              style={[
                styles.messageBubble,
                item.type === 'user'
                  ? [styles.userBubble, { backgroundColor: theme.colors.primary }]
                  : [styles.botBubble, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }],
              ]}
            >
              <Text style={[styles.messageText, { color: item.type === 'user' ? '#FFFFFF' : theme.colors.text }]}>
                {item.message}
              </Text>
              <Text
                style={[
                  styles.messageTime,
                  { color: item.type === 'user' ? '#FFFFFF80' : theme.colors.textSecondary },
                ]}
              >
                {item.timestamp}
              </Text>
            </View>
          </View>
        )}
        ListFooterComponent={isBotTyping ? <TypingIndicator /> : null}
        showsVerticalScrollIndicator={false}
        style={styles.messagesList}
        contentContainerStyle={{ paddingVertical: 10 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={[styles.chatInputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <TextInput
          value={userMessage}
          onChangeText={setUserMessage}
          placeholder="Type your message..."
          placeholderTextColor={theme.colors.textSecondary}
          style={[styles.chatInput, { color: theme.colors.text }]}
          onSubmitEditing={handleSendMessage}
          returnKeyType="send"
          multiline
        />
        <TouchableOpacity
          onPress={handleSendMessage}
          style={[
            styles.sendButton,
            { backgroundColor: userMessage.trim() ? theme.colors.primary : theme.colors.textSecondary },
          ]}
          disabled={!userMessage.trim()}
        >
          <MaterialCommunityIcons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContactTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Get in Touch</Text>
      <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
        Choose your preferred way to reach our support team
      </Text>

      <View style={styles.contactGrid}>
        {[
          {
            title: 'Email Support',
            subtitle: 'Get detailed help via email',
            icon: 'email',
            color: theme.colors.secondary,
            contact: 'saquibnadeem15@gmail.com',
            availability: 'Response within 24 hours',
            buttonText: 'Send Email',
          },
          {
            title: 'Phone Support',
            subtitle: 'Speak directly with our team',
            icon: 'phone',
            color: theme.colors.success,
            contact: '+91 98104 93309',
            availability: 'Mon-Fri: 9AM-6PM EST',
            buttonText: 'Call Now',
          },
          {
            title: 'Live Chat',
            subtitle: 'Instant messaging support',
            icon: 'chat',
            color: theme.colors.accent,
            contact: 'Available 24/7',
            availability: 'Average response: 2 minutes',
            buttonText: 'Start Chat',
          },
        ].map((contact, index) => (
          <View
            key={index}
            style={[styles.contactCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          >
            <View style={[styles.contactIconBg, { backgroundColor: `${contact.color}15` }]}>
              <MaterialCommunityIcons name={contact.icon} size={32} color={contact.color} />
            </View>
            <Text style={[styles.contactTitle, { color: theme.colors.text }]}>{contact.title}</Text>
            <Text style={[styles.contactSubtitle, { color: theme.colors.textSecondary }]}>{contact.subtitle}</Text>

            <View style={[styles.contactInfoCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.contactInfo, { color: theme.colors.text }]}>{contact.contact}</Text>
              <Text style={[styles.contactAvailability, { color: theme.colors.textSecondary }]}>
                {contact.availability}
              </Text>
            </View>

            <TouchableOpacity style={[styles.contactButton, { backgroundColor: contact.color }]}>
              <Text style={styles.contactButtonText}>{contact.buttonText}</Text>
              <MaterialCommunityIcons name="arrow-right" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View
        style={[styles.helpSection, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      >
        <MaterialCommunityIcons name="lightbulb" size={32} color={theme.colors.warning} />
        <Text style={[styles.helpTitle, { color: theme.colors.text }]}>Quick Tips</Text>
        <Text style={[styles.helpText, { color: theme.colors.textSecondary }]}>
          Before contacting support, try checking our FAQ section or restarting the app. For account issues, have your email ready.
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#10B981' : '#059669'}
      />

      {renderHeader()}
      {renderTabs()}

      {activeTab === 'faq' && renderFAQTab()}
      {activeTab === 'chat' && renderChatTab()}
      {activeTab === 'contact' && renderContactTab()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
  },
  headerGradient: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    padding: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF90',
    marginTop: 4,
  },
  themeToggle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  faqCard: {
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  faqIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  faqContent: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  chatContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  chatHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F020',
  },
  botInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  botDetails: {
    flex: 1,
  },
  botName: {
    fontSize: 18,
    fontWeight: '600',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  onlineText: {
    fontSize: 14,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageRow: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  userMessageRow: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  botBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  chatInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  contactGrid: {
    gap: 16,
  },
  contactCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  contactIconBg: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  contactInfoCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  contactInfo: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactAvailability: {
    fontSize: 14,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  helpSection: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SupportScreen;
