import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Star, Gift, Trophy, Coins, TrendingUp, Calendar, Award, Zap } from 'lucide-react-native';

// Define TypeScript interfaces for rewards and activities
interface Reward {
  id: number;
  name: string;
  points: number;
  image: string;
  category: string;
  available: boolean;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  earned: boolean;
  points: number;
}

interface Activity {
  date: string;
  action: string;
  points: number;
}

const RewardScreen = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'rewards' | 'history'>('overview');
  const [userPoints, setUserPoints] = useState(2450);
  const [weeklyStreak, setWeeklyStreak] = useState(7);

  const rewards: Reward[] = [
    { id: 1, name: 'Amazon Gift Card', points: 1000, image: '🎁', category: 'Gift Cards', available: true },
    { id: 2, name: 'Plant a Tree', points: 500, image: '🌳', category: 'Environment', available: true },
    { id: 3, name: 'Coffee Voucher', points: 200, image: '☕', category: 'Food & Drink', available: true },
    { id: 4, name: 'Premium Subscription', points: 1500, image: '⭐', category: 'Premium', available: true },
    { id: 5, name: 'Eco-Friendly Kit', points: 800, image: '♻️', category: 'Products', available: false },
    { id: 6, name: 'Donation to Charity', points: 300, image: '❤️', category: 'Charity', available: true },
  ];

  const achievements: Achievement[] = [
    { id: 1, title: 'Recycling Champion', description: 'Recycled 100 items', earned: true, points: 200 },
    { id: 2, title: 'Week Warrior', description: '7 day streak', earned: true, points: 150 },
    { id: 3, title: 'Eco Leader', description: 'Invite 5 friends', earned: false, points: 300 },
    { id: 4, title: 'Green Guru', description: '30 day streak', earned: false, points: 500 },
  ];

  const recentActivity: Activity[] = [
    { date: '2025-09-08', action: 'Recycled plastic bottle', points: 10 },
    { date: '2025-09-07', action: 'Completed daily challenge', points: 25 },
    { date: '2025-09-06', action: 'Shared eco-tip', points: 15 },
    { date: '2025-09-05', action: 'Recycled cardboard', points: 8 },
  ];

  const handleRewardClaim = (reward: Reward) => {
    if (userPoints >= reward.points && reward.available) {
      setUserPoints(userPoints - reward.points);
      Alert.alert('Success', `Successfully claimed ${reward.name}!`);
    }
  };

  // Theme styles (basic example, preferably use StyleSheet)
  const themeStyles = {
    backgroundColor: isDarkMode ? '#1a202c' : '#ebf8ff',
    color: isDarkMode ? '#fff' : '#1a202c',
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: themeStyles.backgroundColor, padding: 16 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: 48, height: 48, borderRadius: 12,
            backgroundColor: isDarkMode ? '#2f855a' : '#48bb78',
            justifyContent: 'center', alignItems: 'center'
          }}>
            <Trophy color="#fff" width={24} height={24} />
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={{ color: themeStyles.color, fontSize: 20, fontWeight: 'bold' }}>Rewards</Text>
            <Text style={{ color: isDarkMode ? '#a0aec0' : '#4a5568', fontSize: 14 }}>Earn & Redeem Points</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setIsDarkMode(!isDarkMode)}
          style={{
            padding: 8, backgroundColor: isDarkMode ? '#2d3748' : '#e2e8f0', borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 18 }}>{isDarkMode ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      {/* Points Overview Card */}
      <View style={{
        backgroundColor: isDarkMode ? '#2d3748' : '#fff',
        borderRadius: 20, padding: 20, marginBottom: 24,
        shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              width: 64, height: 64, borderRadius: 20,
              backgroundColor: isDarkMode ? 'linear-gradient(135deg, #2f855a, #2c5282)' : 'linear-gradient(135deg, #48bb78, #4299e1)',
              justifyContent: 'center', alignItems: 'center'
            }}>
              <Coins color="#f6e05e" width={32} height={32} />
            </View>
            <View style={{ marginLeft: 16 }}>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: themeStyles.color }}>{userPoints.toLocaleString()}</Text>
              <Text style={{ color: isDarkMode ? '#a0aec0' : '#4a5568', fontSize: 14 }}>Total Points</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Zap color="#ed8936" width={16} height={16} />
              <Text style={{ fontWeight: '600', marginLeft: 4, color: themeStyles.color }}>{weeklyStreak}</Text>
            </View>
            <Text style={{ color: isDarkMode ? '#a0aec0' : '#4a5568', fontSize: 14 }}>Day Streak</Text>
          </View>
        </View>
        {/* Today, Week, Month points (hardcoded) */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#48bb78', fontWeight: '700', fontSize: 18 }}>+45</Text>
            <Text style={{ color: isDarkMode ? '#a0aec0' : '#4a5568', fontSize: 12 }}>Today</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#4299e1', fontWeight: '700', fontSize: 18 }}>+180</Text>
            <Text style={{ color: isDarkMode ? '#a0aec0' : '#4a5568', fontSize: 12 }}>This Week</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#805ad5', fontWeight: '700', fontSize: 18 }}>+750</Text>
            <Text style={{ color: isDarkMode ? '#a0aec0' : '#4a5568', fontSize: 12 }}>This Month</Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: isDarkMode ? '#2d3748' : '#fff',
        borderRadius: 20,
        marginBottom: 24,
        padding: 8,
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 3
      }}>
        {['overview', 'rewards', 'history'].map((tab) => {
          const isSelected = selectedTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab as 'overview' | 'rewards' | 'history')}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: isSelected
                  ? (isDarkMode ? '#2f855a' : '#48bb78')
                  : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: isSelected ? '#fff' : (isDarkMode ? '#a0aec0' : '#4a5568'),
                fontWeight: '600',
                textTransform: 'capitalize',
                fontSize: 16,
              }}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <View>
          {/* Achievements */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Award color="#ecc94b" width={20} height={20} />
              <Text style={{ color: themeStyles.color, fontWeight: '700', fontSize: 18, marginLeft: 8 }}>Achievements</Text>
            </View>
            <View>
              {achievements.map(achievement => (
                <View
                  key={achievement.id}
                  style={{
                    backgroundColor: isDarkMode ? '#2d3748' : '#fff',
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 12,
                    borderWidth: achievement.earned ? 2 : 1,
                    borderColor: achievement.earned ? '#ecc94b' : (isDarkMode ? '#4a5568' : '#cbd5e0'),
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Trophy color={achievement.earned ? '#ecc94b' : (isDarkMode ? '#718096' : '#a0aec0')} width={24} height={24} />
                    <Text style={{
                      color: achievement.earned ? '#48bb78' : (isDarkMode ? '#718096' : '#4a5568'),
                      fontWeight: '600',
                      fontSize: 14,
                    }}>
                      +{achievement.points}
                    </Text>
                  </View>
                  <Text style={{ color: themeStyles.color, fontWeight: '700', fontSize: 16 }}>{achievement.title}</Text>
                  <Text style={{ color: isDarkMode ? '#a0aec0' : '#4a5568', fontSize: 12 }}>{achievement.description}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Recent Activity */}
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <TrendingUp color="#4299e1" width={20} height={20} />
              <Text style={{ color: themeStyles.color, fontWeight: '700', fontSize: 18, marginLeft: 8 }}>Recent Activity</Text>
            </View>
            <View>
              {recentActivity.map((activity, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: isDarkMode ? '#2d3748' : '#fff',
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 12,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: isDarkMode ? '#4a5568' : '#cbd5e0',
                  }}
                >
                  <View>
                    <Text style={{ color: themeStyles.color, fontWeight: '600', fontSize: 14 }}>{activity.action}</Text>
                    <Text style={{ color: isDarkMode ? '#a0aec0' : '#4a5568', fontSize: 12 }}>{activity.date}</Text>
                  </View>
                  <Text style={{ color: '#48bb78', fontWeight: '700', fontSize: 14 }}>+{activity.points}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {selectedTab === 'rewards' && (
        <View>
          {rewards.map(reward => (
            <View
              key={reward.id}
              style={{
                backgroundColor: isDarkMode ? '#2d3748' : '#fff',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: isDarkMode ? '#4a5568' : '#cbd5e0',
                opacity: reward.available ? 1 : 0.6,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ fontSize: 28 }}>{reward.image}</Text>
              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <Text style={{ color: themeStyles.color, fontWeight: '700', fontSize: 16 }}>{reward.name}</Text>
                <Text style={{ color: isDarkMode ? '#a0aec0' : '#4a5568', fontSize: 12 }}>{reward.category}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                  <Coins color="#ecc94b" width={16} height={16} />
                  <Text style={{ color: themeStyles.color, fontWeight: '600', marginLeft: 4 }}>{reward.points} points</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleRewardClaim(reward)}
                disabled={!reward.available || userPoints < reward.points}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor: reward.available && userPoints >= reward.points
                    ? (isDarkMode ? '#2f855a' : '#48bb78')
                    : (isDarkMode ? '#4a5568' : '#e2e8f0')
                }}
              >
                <Text style={{
                  color: reward.available && userPoints >= reward.points ? '#fff' : (isDarkMode ? '#718096' : '#a0aec0'),
                  fontWeight: '600',
                }}>
                  {userPoints >= reward.points ? 'Claim' : 'Not Enough'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {selectedTab === 'history' && (
        <View>
          {[...recentActivity, ...recentActivity].map((activity, index) => (
            <View
              key={index}
              style={{
                backgroundColor: isDarkMode ? '#2d3748' : '#fff',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: isDarkMode ? '#4a5568' : '#cbd5e0',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  backgroundColor: isDarkMode ? 'rgba(72, 187, 120, 0.2)' : '#c6f6d5',
                  width: 40, height: 40, borderRadius: 20,
                  justifyContent: 'center', alignItems: 'center',
                  marginRight: 12,
                }}>
                  <Star color="#48bb78" width={20} height={20} />
                </View>
                <View>
                  <Text style={{ color: themeStyles.color, fontWeight: '600', fontSize: 14 }}>{activity.action}</Text>
                  <Text style={{ color: isDarkMode ? '#a0aec0' : '#4a5568', fontSize: 12 }}>{activity.date}</Text>
                </View>
              </View>
              <Text style={{ color: '#48bb78', fontWeight: '700', fontSize: 14 }}>+{activity.points}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default RewardScreen;
