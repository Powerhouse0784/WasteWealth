import * as Speech from 'expo-speech';
import { Alert } from 'react-native';

class VoiceRecognitionService {
  private isSpeaking = false;
  private recognitionTimeout: NodeJS.Timeout | null = null;

  async startListening(
    onResult: (text: string) => void,
    onError?: (error: string) => void
  ): Promise<boolean> {
    try {
      // Expo Speech currently does not handle permissions, so manually check elsewhere if needed
      // This example assumes required permissions given

      // In demo, simulate voice recognition
      this.simulateVoiceRecognition(onResult);

      return true;
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      onError?.('Failed to start voice recognition');
      return false;
    }
  }

  private simulateVoiceRecognition(onResult: (text: string) => void) {
    this.recognitionTimeout = setTimeout(() => {
      const sampleCommands = [
        'I have 2 kilograms of plastic bottles',
        'Schedule pickup for tomorrow at 3 PM',
        'Five glass bottles and three metal cans',
        'Request instant pickup for mixed waste',
        'I want to sell paper and cardboard',
      ];

      const randomCommand = sampleCommands[Math.floor(Math.random() * sampleCommands.length)];
      onResult(randomCommand);
    }, 3000);
  }

  stopListening(): void {
    if (this.recognitionTimeout) {
      clearTimeout(this.recognitionTimeout);
      this.recognitionTimeout = null;
    }
  }

  async speak(text: string, language: string = 'en'): Promise<void> {
    if (this.isSpeaking) {
      Speech.stop();
    }

    this.isSpeaking = true;

    return new Promise((resolve) => {
      Speech.speak(text, {
        language,
        onDone: () => {
          this.isSpeaking = false;
          resolve();
        },
        onError: (error: any) => {
          console.error('Speech error:', error);
          this.isSpeaking = false;
          resolve();
        },
      });
    });
  }

  parseWasteFromVoice(text: string): Array<{ type: string; quantity: number; unit: string }> {
    const patterns = [
      /(\d+)\s*(kg|kilograms?)\s+of\s+(\w+)/gi,
      /(\d+)\s+(\w+)\s+(\w+)/gi,
      /(\d+)\s*(kg|kilograms?)\s+(\w+)/gi,
      /(\w+)\s+(\w+)\s+(\d+)\s*(pieces?|items?)/gi,
    ];

    const results: Array<{ type: string; quantity: number; unit: string }> = [];
    const lowerText = text.toLowerCase();

    const wasteTypes = ['plastic', 'paper', 'metal', 'glass', 'organic', 'ewaste', 'cardboard'];
    const units = ['kg', 'kilograms', 'pieces', 'items', 'bottles', 'cans'];

    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(lowerText)) !== null) {
        let quantity = parseInt(match[1]);
        let unit = 'kg';
        let type = '';

        if (match[2] && units.includes(match[2].toLowerCase())) {
          unit = match[2].toLowerCase();
          type = match[3];
        } else if (match[3] && wasteTypes.includes(match[3].toLowerCase())) {
          type = match[3].toLowerCase();
          unit = match[2].toLowerCase();
        }

        if (isNaN(quantity)) {
          quantity = this.wordToNumber(match[1]);
        }

        if (quantity > 0 && type && wasteTypes.includes(type)) {
          if (['bottles', 'cans', 'pieces', 'items'].includes(unit)) {
            unit = 'items';
          } else if (['kg', 'kilograms'].includes(unit)) {
            unit = 'kg';
          }

          results.push({ type, quantity, unit });
        }
      }
    });

    return results;
  }

  private wordToNumber(word: string): number {
    const numberWords: { [key: string]: number } = {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8,
      nine: 9,
      ten: 10,
      eleven: 11,
      twelve: 12,
      thirteen: 13,
      fourteen: 14,
      fifteen: 15,
      twenty: 20,
      thirty: 30,
      forty: 40,
      fifty: 50,
    };

    return numberWords[word.toLowerCase()] || 0;
  }

  extractDateTime(text: string): { date?: Date; time?: string } {
    const lowerText = text.toLowerCase();
    const now = new Date();
    const result: { date?: Date; time?: string } = {};

    const timePattern = /(\d{1,2}):?(\d{2})?\s*(am|pm)?/i;
    const timeMatch = timePattern.exec(lowerText);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const period = timeMatch[3]?.toLowerCase();

      if (period === 'pm' && hours < 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;

      result.time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    if (lowerText.includes('tomorrow')) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      result.date = tomorrow;
    } else if (lowerText.includes('today')) {
      result.date = now;
    }

    return result;
  }

  isStopCommand(text: string): boolean {
    const stopWords = ['stop', 'cancel', 'end', 'quit', 'exit'];
    return stopWords.some((word) => text.toLowerCase().includes(word));
  }

  isHelpCommand(text: string): boolean {
    const helpWords = ['help', 'what can i say', 'commands', 'options'];
    return helpWords.some((word) => text.toLowerCase().includes(word));
  }

  getHelpMessage(): string {
    return `You can say things like:
    - "I have 2 kilograms of plastic bottles"
    - "Schedule pickup for tomorrow at 3 PM"
    - "Five glass bottles and three metal cans"
    - "Request instant pickup"
    - "How much for paper waste?"`;
  }
}

export const voiceRecognitionService = new VoiceRecognitionService();
