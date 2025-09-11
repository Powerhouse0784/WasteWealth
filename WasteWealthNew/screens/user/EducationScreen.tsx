import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import {
  Recycle,
  Leaf,
  Globe,
  TrendingUp,
  Users,
  Award,
  ChevronRight,
  PlayCircle,
  BookOpen,
  Lightbulb,
  Target,
  BarChart3,
  Sun,
  Moon,
  ArrowRight,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

type TabKey = 'overview' | 'practices' | 'statistics';

interface ContentItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string;
  color: string;
}

interface EducationData {
  [key: string]: {
    title: string;
    subtitle: string;
    content: ContentItem[];
  };
}

const educationData: EducationData = {
  overview: {
    title: 'Understanding Waste to Wealth',
    subtitle: 'Learn the fundamentals of sustainable waste management',
    content: [
      {
        icon: <Recycle width={24} height={24} color="#FFFFFF" />,
        title: 'What is Waste to Wealth?',
        description: 'Transform waste materials into valuable resources through innovative recycling and sustainable practices.',
        details: 'The waste-to-wealth concept involves converting waste materials that would typically end up in landfills into valuable products, energy, or raw materials. This circular economy approach reduces environmental impact while creating economic opportunities.',
        color: '#10B981',
      },
      {
        icon: <Globe width={24} height={24} color="#FFFFFF" />,
        title: 'Environmental Impact',
        description: 'Reduce landfill waste by 80% and decrease carbon emissions through sustainable management.',
        details: 'Every ton of waste diverted from landfills prevents approximately 1.8 tons of CO2 emissions. Proper waste management can reduce methane emissions by up to 70% and conserve natural resources.',
        color: '#3B82F6',
      },
      {
        icon: <TrendingUp width={24} height={24} color="#FFFFFF" />,
        title: 'Economic Benefits',
        description: 'Create jobs, generate revenue, and build sustainable businesses from waste materials.',
        details: 'The global waste-to-energy market is valued at $40+ billion and growing. Local communities can generate significant income through waste collection, processing, and selling recycled materials.',
        color: '#8B5CF6',
      },
    ],
  },
  practices: {
    title: 'Best Practices',
    subtitle: 'Proven methods for effective waste management',
    content: [
      {
        icon: <Target width={24} height={24} color="#FFFFFF" />,
        title: 'Waste Segregation',
        description: 'Properly separate organic, recyclable, and hazardous waste at source for maximum efficiency.',
        details: 'Effective segregation increases recycling efficiency by 60%. Use separate bins for paper, plastic, glass, metal, organic waste, and e-waste. Label bins clearly and educate all users.',
        color: '#EF4444',
      },
      {
        icon: <Leaf width={24} height={24} color="#FFFFFF" />,
        title: 'Composting',
        description: 'Turn organic waste into nutrient-rich compost for agriculture and gardening.',
        details: 'Composting reduces organic waste by 90% and creates valuable soil amendment. Maintain proper carbon-nitrogen ratio (30:1), ensure adequate moisture, and turn regularly for best results.',
        color: '#10B981',
      },
      {
        icon: <Award width={24} height={24} color="#FFFFFF" />,
        title: 'Upcycling',
        description: 'Transform waste materials into higher-value products through creative reuse.',
        details: 'Upcycling can increase material value by 300-500%. Popular examples include turning plastic bottles into planters, old furniture into art pieces, and textile waste into new clothing.',
        color: '#F59E0B',
      },
    ],
  },
  statistics: {
    title: 'Impact Statistics',
    subtitle: 'Data-driven insights on waste management effectiveness',
    content: [
      {
        icon: <BarChart3 width={24} height={24} color="#FFFFFF" />,
        title: 'Global Waste Generation',
        description: '2.01 billion tons of municipal solid waste generated annually worldwide.',
        details: 'By 2050, global waste generation is expected to increase by 70%. Currently, only 16% of waste is recycled globally, with huge potential for improvement through better practices.',
        color: '#DC2626',
      },
      {
        icon: <Users width={24} height={24} color="#FFFFFF" />,
        title: 'Job Creation Potential',
        description: '1 million tons of waste can create 1,000+ jobs in the recycling industry.',
        details: 'The recycling industry employs over 1.1 million people in the US alone. For every job in waste disposal, recycling creates 10 jobs in processing and manufacturing.',
        color: '#059669',
      },
      {
        icon: <Lightbulb width={24} height={24} color="#FFFFFF" />,
        title: 'Energy Recovery',
        description: '1 ton of waste can generate 550-700 kWh of electricity through waste-to-energy.',
        details: 'Modern waste-to-energy facilities can achieve 85% efficiency in energy recovery. This can power homes while reducing landfill volume by 90%.',
        color: '#7C3AED',
      },
    ],
  },
};

const quickTips = [
  'Start small with daily waste reduction practices',
  'Educate your community about sustainable habits',
  'Support eco-friendly businesses and products',
  'Find creative ways to reuse before discarding',
  'Track your progress and celebrate milestones',
];

const EducationScreen: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const theme = {
    background: isDark ? '#0F172A' : '#FFFFFF',
    cardBackground: isDark ? '#1E293B' : '#FFFFFF',
    headerBackground: isDark ? '#1E293B' : '#FFFFFF',
    text: isDark ? '#F8FAFC' : '#1E293B',
    textSecondary: isDark ? '#CBD5E1' : '#64748B',
    border: isDark ? '#334155' : '#E2E8F0',
    tabBackground: isDark ? '#334155' : '#F1F5F9',
    activeTab: isDark ? '#475569' : '#FFFFFF',
    tipBackground: isDark ? '#334155' : '#F8FAFC',
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.headerBackground}
      />
      
      {/* Professional Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              WasteWealth Education
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Transform waste into valuable resources
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsDark(!isDark)}
            style={[styles.themeButton, { backgroundColor: theme.tipBackground }]}
          >
            {isDark ? (
              <Sun width={20} height={20} color="#F59E0B" />
            ) : (
              <Moon width={20} height={20} color="#6366F1" />
            )}
          </TouchableOpacity>
        </View>

        {/* Modern Tab Navigation */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScrollView}>
          <View style={[styles.tabContainer, { backgroundColor: theme.tabBackground }]}>
            {(Object.keys(educationData) as TabKey[]).map((tab, index) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tabButton,
                  activeTab === tab && { backgroundColor: theme.activeTab },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: activeTab === tab ? theme.text : theme.textSecondary,
                      fontWeight: activeTab === tab ? '600' : '500',
                    },
                  ]}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
                {activeTab === tab && (
                  <View style={[styles.activeIndicator, { backgroundColor: '#10B981' }]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {educationData[activeTab].title}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            {educationData[activeTab].subtitle}
          </Text>
        </View>

        {/* Content Cards */}
        <View style={styles.cardsContainer}>
          {educationData[activeTab].content.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.card,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                  shadowColor: isDark ? '#000000' : '#64748B',
                },
              ]}
              onPress={() => setExpandedCard(expandedCard === index ? null : index)}
              activeOpacity={0.7}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconWrapper, { backgroundColor: item.color }]}>
                    {item.icon}
                  </View>
                  <View style={styles.cardTitleContainer}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
                      {item.description}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.expandButton}>
                  <Text style={[styles.expandButtonText, { color: item.color }]}>
                    {expandedCard === index ? 'Show Less' : 'Learn More'}
                  </Text>
                  <ChevronRight
                    width={16}
                    height={16}
                    color={item.color}
                    style={[
                      styles.expandIcon,
                      expandedCard === index && { transform: [{ rotate: '90deg' }] },
                    ]}
                  />
                </TouchableOpacity>

                {expandedCard === index && (
                  <View style={[styles.expandedContent, { backgroundColor: theme.tipBackground }]}>
                    <Text style={[styles.expandedText, { color: theme.textSecondary }]}>
                      {item.details}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Tips Section */}
        <View style={[styles.tipsSection, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.tipsSectionHeader}>
            <View style={[styles.tipsIconWrapper, { backgroundColor: '#F59E0B' }]}>
              <Lightbulb width={20} height={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.tipsSectionTitle, { color: theme.text }]}>
              Quick Tips for Success
            </Text>
          </View>
          
          <View style={styles.tipsContainer}>
            {quickTips.map((tip, index) => (
              <View key={index} style={[styles.tipItem, { backgroundColor: theme.tipBackground }]}>
                <View style={styles.tipNumber}>
                  <Text style={styles.tipNumberText}>{index + 1}</Text>
                </View>
                <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                  {tip}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.primaryAction, { backgroundColor: '#10B981' }]}>
            <PlayCircle width={20} height={20} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>Watch Tutorial Videos</Text>
            <ArrowRight width={16} height={16} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity style={[styles.secondaryAction, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <BookOpen width={18} height={18} color="#3B82F6" />
              <Text style={[styles.secondaryActionText, { color: theme.text }]}>Download Guide</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.secondaryAction, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <Users width={18} height={18} color="#8B5CF6" />
              <Text style={[styles.secondaryActionText, { color: theme.text }]}>Join Community</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    marginTop: 4,
    lineHeight: 22,
  },
  themeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  tabScrollView: {
    marginHorizontal: -20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 4,
    position: 'relative',
  },
  tabText: {
    fontSize: 15,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 4,
    left: 8,
    right: 8,
    height: 2,
    borderRadius: 1,
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    padding: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 16,
    marginTop: 4,
    lineHeight: 22,
  },
  cardsContainer: {
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  expandButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  expandIcon: {
    marginLeft: 4,
  },
  expandedContent: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  expandedText: {
    fontSize: 14,
    lineHeight: 20,
  },
  tipsSection: {
    margin: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tipsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  tipsIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  tipsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tipNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 6,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 40,
  },
});
export default EducationScreen;