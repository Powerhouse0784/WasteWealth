import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Animated } from 'react-native';
import { Text, Button, useTheme, Card, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { voiceRecognitionService } from '../../services/voiceRecognition';

interface VoiceInputProps {
  onVoiceResult: (text: string, wasteItems?: Array<{ type: string; quantity: number; unit: string }>) => void;
  onStatusChange?: (isListening: boolean) => void;
  disabled?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  onVoiceResult,
  onStatusChange,
  disabled = false,
}) => {
  const { colors } = useTheme();
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    onStatusChange?.(isListening);
  }, [isListening, onStatusChange]);

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      animation.setValue(0);
    }
  }, [isListening, animation]);

  const startListening = async () => {
    if (disabled) return;

    setIsListening(true);
    setRecognizedText('Listening...');

    const success = await voiceRecognitionService.startListening(
      (text) => {
        setRecognizedText(text);
        setIsListening(false);

        const wasteItems = voiceRecognitionService.parseWasteFromVoice(text);
        onVoiceResult(text, wasteItems.length > 0 ? wasteItems : undefined);
      },
      (error) => {
        Alert.alert('Voice Recognition Error', error);
        setIsListening(false);
        setRecognizedText('');
      }
    );

    if (!success) {
      setIsListening(false);
      setRecognizedText('');
    }
  };

  const stopListening = () => {
    voiceRecognitionService.stopListening();
    setIsListening(false);
    setRecognizedText('');
  };

  const speakHelp = async () => {
    await voiceRecognitionService.speak(voiceRecognitionService.getHelpMessage());
  };

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  // Custom amber/yellow for warning
  const warningColor = '#FFC107';

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          {/* Voice Input Button */}
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                transform: [{ scale }],
                opacity,
                backgroundColor: isListening ? colors.error : colors.primary,
              },
            ]}
          >
            <Button
              mode="contained"
              onPress={isListening ? stopListening : startListening}
              disabled={disabled}
              style={styles.voiceButton}
              contentStyle={styles.buttonContent}
              icon={isListening ? 'microphone-off' : 'microphone'}
            >
              {isListening ? 'Stop Listening' : 'Start Voice Input'}
            </Button>
          </Animated.View>

          {/* Recognition Status */}
          {recognizedText && (
            <View style={styles.resultContainer}>
              <Text variant="bodyMedium" style={styles.statusText}>
                Status: {isListening ? 'Listening...' : 'Recognized'}
              </Text>

              <View style={styles.textContainer}>
                <Ionicons name="chatbubble" size={16} color={colors.primary} />
                <Text variant="bodyMedium" style={[styles.recognizedText, { color: colors.onSurface }]}>
                  "{recognizedText}"
                </Text>
              </View>

              {isListening && (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={styles.activityIndicator}
                />
              )}
            </View>
          )}

          {/* Help Button */}
          <Button
            mode="text"
            onPress={speakHelp}
            disabled={disabled}
            icon="help-circle"
            style={styles.helpButton}
          >
            What can I say?
          </Button>
        </Card.Content>
      </Card>

      {/* Tips */}
      <Card style={styles.tipsCard}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.tipsTitle}>
            Voice Command Tips
          </Text>
          <View style={styles.tipItem}>
            <Ionicons name="bulb" size={16} color={warningColor} />
            <Text variant="bodySmall" style={styles.tipText}>
              Be specific about quantities and waste types
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="bulb" size={16} color={warningColor} />
            <Text variant="bodySmall" style={styles.tipText}>
              Example: "2 kilograms of plastic bottles"
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="bulb" size={16} color={warningColor} />
            <Text variant="bodySmall" style={styles.tipText}>
              You can mention multiple items in one sentence
            </Text>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 12,
  },
  content: {
    alignItems: 'center',
  },
  buttonContainer: {
    borderRadius: 25,
    marginBottom: 16,
  },
  voiceButton: {
    borderRadius: 25,
  },
  buttonContent: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  recognizedText: {
    marginLeft: 8,
    fontStyle: 'italic',
  },
  activityIndicator: {
    marginTop: 8,
  },
  helpButton: {
    marginTop: 8,
  },
  tipsCard: {
    marginBottom: 12,
  },
  tipsTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    marginLeft: 8,
    flex: 1,
  },
});

export default VoiceInput;
