import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Dialog, Portal, List, Button, RadioButton, useTheme } from 'react-native-paper';
import { useLanguage } from '../../context/LanguageContext';

interface LanguageSelectorProps {
  visible: boolean;
  onDismiss: () => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ visible, onDismiss }) => {
  const { colors } = useTheme();
  const { currentLanguage, availableLanguages, changeLanguage, t } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  const handleSave = async () => {
    if (selectedLanguage !== currentLanguage) {
      await changeLanguage(selectedLanguage);
    }
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{t('profile.language')}</Dialog.Title>
        <Dialog.Content>
          <RadioButton.Group
            onValueChange={setSelectedLanguage}
            value={selectedLanguage}
          >
            {availableLanguages.map((language) => (
              <View key={language.code} style={styles.languageItem}>
                <List.Item
                  title={language.nativeName}
                  description={language.name}
                  left={() => (
                    <RadioButton
                      value={language.code}
                      color={colors.primary}
                    />
                  )}
                  onPress={() => setSelectedLanguage(language.code)}
                />
              </View>
            ))}
          </RadioButton.Group>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>{t('common.cancel')}</Button>
          <Button onPress={handleSave}>{t('common.save')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  languageItem: {
    marginVertical: 4,
  },
});

export default LanguageSelector;