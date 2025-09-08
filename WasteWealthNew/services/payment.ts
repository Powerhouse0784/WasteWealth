import { Alert } from 'react-native';
import { walletAPI } from './api';
import { formatCurrency } from '../utils/calculations';

export interface PaymentMethod {
  id: string;
  type: 'bank' | 'upi' | 'wallet';
  name: string;
  details: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  date: Date;
  referenceId?: string;
}

class PaymentService {
  private paymentMethods: PaymentMethod[] = [];
  private transactions: Transaction[] = [];

  async initializePayment() {
    console.log('Payment service initialized');
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await walletAPI.getPaymentMethods();
      this.paymentMethods = response.data.methods;
      return this.paymentMethods;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  }

  async addPaymentMethod(method: Omit<PaymentMethod, 'id'>): Promise<boolean> {
    try {
      const response = await walletAPI.addPaymentMethod(method);
      if (response.data.success) {
        this.paymentMethods.push({ ...method, id: response.data.methodId });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding payment method:', error);
      return false;
    }
  }

  async requestPayout(amount: number, methodId: string): Promise<boolean> {
    try {
      if (amount <= 0) {
        Alert.alert('Error', 'Invalid amount');
        return false;
      }

      // Pass empty details as third argument or real details object if needed
      const response = await walletAPI.requestPayout(amount, methodId, {});

      if (response.data.success) {
        Alert.alert('Success', `Payout of ${formatCurrency(amount)} requested successfully`);
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Error requesting payout:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to request payout');
      return false;
    }
  }

  async getTransactions(): Promise<Transaction[]> {
    try {
      const response = await walletAPI.getTransactions();
      this.transactions = response.data.transactions.map((t: any) => ({
        ...t,
        date: new Date(t.date),
      }));
      return this.transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  async processPayment(amount: number, method: PaymentMethod): Promise<boolean> {
    try {
      console.log(`Processing payment of ${formatCurrency(amount)} via ${method.type}`);

      await new Promise((resolve) => setTimeout(resolve, 2000));
      return Math.random() > 0.1;
    } catch (error) {
      console.error('Payment processing error:', error);
      return false;
    }
  }

  validateUPIId(upiId: string): boolean {
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    return upiRegex.test(upiId);
  }

  validateBankAccount(accountNumber: string, ifscCode: string): boolean {
    return (
      accountNumber.length >= 9 &&
      accountNumber.length <= 18 &&
      ifscCode.length === 11
    );
  }

  getPaymentMethodName(type: string): string {
    switch (type) {
      case 'bank':
        return 'Bank Transfer';
      case 'upi':
        return 'UPI';
      case 'wallet':
        return 'Wallet';
      default:
        return 'Unknown';
    }
  }
}

export const paymentService = new PaymentService();
