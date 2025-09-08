import { Alert } from 'react-native';
import api from './api';
import { formatCurrency } from '../utils/calculations';

export interface Referral {
  id: string;
  referrerId: string;
  refereeId: string;
  refereeName: string;
  refereeEmail: string;
  status: 'pending' | 'completed' | 'cancelled';
  rewardAmount: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalEarnings: number;
  availableBalance: number;
}

class ReferralSystem {
  private referrals: Referral[] = [];
  private stats: ReferralStats = {
    totalReferrals: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
    totalEarnings: 0,
    availableBalance: 0,
  };

  async initialize() {
    await this.loadReferrals();
    await this.loadStats();
  }

  async loadReferrals(): Promise<Referral[]> {
    try {
      const response = await api.get('/referrals');
      this.referrals = response.data.referrals.map((r: any) => ({
        ...r,
        createdAt: new Date(r.createdAt),
        completedAt: r.completedAt ? new Date(r.completedAt) : undefined,
      }));
      return this.referrals;
    } catch (error) {
      console.error('Error loading referrals:', error);
      return [];
    }
  }

  async loadStats(): Promise<ReferralStats> {
    try {
      const response = await api.get('/referrals/stats');
      this.stats = response.data;
      return this.stats;
    } catch (error) {
      console.error('Error loading referral stats:', error);
      return this.stats;
    }
  }

  async generateReferralCode(): Promise<string> {
    try {
      const response = await api.post('/referrals/generate-code');
      return response.data.referralCode;
    } catch (error) {
      console.error('Error generating referral code:', error);
      throw new Error('Failed to generate referral code');
    }
  }

  async shareReferral(code: string, contacts: string[]): Promise<boolean> {
    try {
      const response = await api.post('/referrals/share', {
        code,
        contacts,
      });
      
      if (response.data.success) {
        Alert.alert('Success', 'Referral invites sent successfully!');
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error sharing referral:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to share referral');
      return false;
    }
  }

  async applyReferralCode(code: string): Promise<boolean> {
    try {
      const response = await api.post('/referrals/apply', { code });
      
      if (response.data.success) {
        Alert.alert('Success', 'Referral code applied successfully! You both earn rewards.');
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error applying referral code:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to apply referral code');
      return false;
    }
  }

  async claimReward(referralId: string): Promise<boolean> {
    try {
      const response = await api.post(`/referrals/${referralId}/claim`);
      
      if (response.data.success) {
        Alert.alert('Success', 'Reward claimed successfully!');
        await this.loadStats();
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error claiming reward:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to claim reward');
      return false;
    }
  }

  getShareMessage(code: string): string {
    return `Join EcoWaste and get ₹100 bonus! Use my referral code: ${code}\n\nDownload the app: https://ecowaste.app/download`;
  }

  getShareOptions() {
    return {
      title: 'Share Referral',
      message: this.getShareMessage('YOUR_CODE'), // Code will be replaced
      url: 'https://ecowaste.app/download',
    };
  }

  calculatePotentialEarnings(referralsCount: number): number {
    const baseReward = 100;
    const bonusTiers = [
      { threshold: 5, bonus: 50 },
      { threshold: 10, bonus: 100 },
      { threshold: 20, bonus: 200 },
      { threshold: 50, bonus: 500 },
    ];

    let total = referralsCount * baseReward;
    
    for (const tier of bonusTiers) {
      if (referralsCount >= tier.threshold) {
        total += tier.bonus;
      }
    }

    return total;
  }

  getRewardTiers() {
    return [
      { referrals: 1, reward: 100, description: 'Per successful referral' },
      { referrals: 5, reward: 50, description: 'Bonus for 5+ referrals' },
      { referrals: 10, reward: 100, description: 'Bonus for 10+ referrals' },
      { referrals: 20, reward: 200, description: 'Bonus for 20+ referrals' },
      { referrals: 50, reward: 500, description: 'Bonus for 50+ referrals' },
    ];
  }
}

export const referralSystem = new ReferralSystem();