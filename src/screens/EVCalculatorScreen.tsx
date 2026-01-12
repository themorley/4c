import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  americanToImpliedProb,
  calculateEV,
  calculateKelly,
  roundBetSize,
  roundWinAmount,
} from '../utils/oddsCalculations';
import { getBankroll, saveBankroll } from '../utils/storage';

export default function EVCalculatorScreen() {
  const [bankroll, setBankroll] = useState<string>('');
  const [sharpFavorite, setSharpFavorite] = useState<string>('');
  const [sharpUnderdog, setSharpUnderdog] = useState<string>('');
  const [betSide, setBetSide] = useState<'favorite' | 'underdog'>('favorite');
  const [recLine, setRecLine] = useState<string>('');
  const [impliedProbs, setImpliedProbs] = useState<{
    favorite: number | null;
    underdog: number | null;
  }>({ favorite: null, underdog: null });
  const [evResults, setEvResults] = useState<{
    ev: number;
    trueProb: number;
    kellyPercent: number;
    optimalWager: number;
    potentialWin: number;
  } | null>(null);

  // Load bankroll on mount
  useEffect(() => {
    loadBankroll();
  }, []);

  // Save bankroll when it changes
  useEffect(() => {
    if (bankroll) {
      const value = parseFloat(bankroll);
      if (!isNaN(value)) {
        saveBankroll(value);
      }
    }
  }, [bankroll]);

  const loadBankroll = async () => {
    const saved = await getBankroll();
    if (saved) {
      setBankroll(saved.toString());
    }
  };

  const calculateImpliedProbabilities = () => {
    const favLine = parseFloat(sharpFavorite);
    const dogLine = parseFloat(sharpUnderdog);

    if (!favLine || !dogLine) {
      Alert.alert('Error', 'Please enter both sharp book lines');
      return;
    }

    const favProb = americanToImpliedProb(favLine);
    const dogProb = americanToImpliedProb(dogLine);

    setImpliedProbs({
      favorite: favProb * 100,
      underdog: dogProb * 100,
    });
  };

  const calculateEVHandler = () => {
    const favLine = parseFloat(sharpFavorite);
    const dogLine = parseFloat(sharpUnderdog);
    const recLineValue = parseFloat(recLine);
    const bankrollValue = parseFloat(bankroll) || 0;

    if (!favLine || !dogLine || !recLineValue) {
      Alert.alert('Error', 'Please enter all required lines');
      return;
    }

    // Get true probability from sharp book
    const trueProb =
      betSide === 'favorite'
        ? americanToImpliedProb(favLine)
        : americanToImpliedProb(dogLine);

    // Calculate EV
    const evResult = calculateEV(trueProb, recLineValue, betSide);

    if (!evResult) {
      Alert.alert('Error', 'Error calculating EV');
      return;
    }

    // Calculate Kelly
    const isFavorite = betSide === 'favorite';
    const kelly = calculateKelly(trueProb, recLineValue, bankrollValue);
    const roundedWager = roundBetSize(kelly.amount, recLineValue, isFavorite);
    const winAmount = roundWinAmount(roundedWager, recLineValue, isFavorite);

    setEvResults({
      ev: evResult.ev,
      trueProb: trueProb * 100,
      kellyPercent: kelly.percent,
      optimalWager: roundedWager,
      potentialWin: winAmount,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bankroll</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter bankroll"
          value={bankroll}
          onChangeText={setBankroll}
          keyboardType="numeric"
          placeholderTextColor="#64748b"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sharp Book Lines (True Market)</Text>
        <TextInput
          style={styles.input}
          placeholder="Favorite Line (e.g., -110)"
          value={sharpFavorite}
          onChangeText={setSharpFavorite}
          keyboardType="numeric"
          placeholderTextColor="#64748b"
        />
        <TextInput
          style={styles.input}
          placeholder="Underdog Line (e.g., +110)"
          value={sharpUnderdog}
          onChangeText={setSharpUnderdog}
          keyboardType="numeric"
          placeholderTextColor="#64748b"
        />
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={calculateImpliedProbabilities}
        >
          <Text style={styles.secondaryButtonText}>
            Calculate Implied Probabilities
          </Text>
        </TouchableOpacity>

        {impliedProbs.favorite !== null && (
          <View style={styles.resultsBox}>
            <Text style={styles.resultsTitle}>Implied Probabilities:</Text>
            <Text style={styles.resultsText}>
              Favorite: {impliedProbs.favorite.toFixed(2)}%
            </Text>
            <Text style={styles.resultsText}>
              Underdog: {impliedProbs.underdog?.toFixed(2)}%
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recreational Book Line</Text>
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Which side are you betting?</Text>
          <View style={styles.pickerRow}>
            <TouchableOpacity
              style={[
                styles.pickerOption,
                betSide === 'favorite' && styles.pickerOptionActive,
              ]}
              onPress={() => setBetSide('favorite')}
            >
              <Text
                style={[
                  styles.pickerOptionText,
                  betSide === 'favorite' && styles.pickerOptionTextActive,
                ]}
              >
                Favorite
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.pickerOption,
                betSide === 'underdog' && styles.pickerOptionActive,
              ]}
              onPress={() => setBetSide('underdog')}
            >
              <Text
                style={[
                  styles.pickerOptionText,
                  betSide === 'underdog' && styles.pickerOptionTextActive,
                ]}
              >
                Underdog
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Recreational Book Line (e.g., -105)"
          value={recLine}
          onChangeText={setRecLine}
          keyboardType="numeric"
          placeholderTextColor="#64748b"
        />
        <TouchableOpacity style={styles.primaryButton} onPress={calculateEVHandler}>
          <Text style={styles.primaryButtonText}>Calculate EV</Text>
        </TouchableOpacity>
      </View>

      {evResults && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Results</Text>
          <View style={styles.resultCard}>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Expected Value (EV):</Text>
              <Text
                style={[
                  styles.resultValue,
                  evResults.ev >= 0 ? styles.positive : styles.negative,
                ]}
              >
                {evResults.ev.toFixed(2)}%
              </Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>True Probability:</Text>
              <Text style={styles.resultValue}>
                {evResults.trueProb.toFixed(2)}%
              </Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Kelly Bet Size (%):</Text>
              <Text style={styles.resultValue}>
                {evResults.kellyPercent.toFixed(2)}%
              </Text>
            </View>
            <View style={[styles.resultItem, styles.resultItemHighlight]}>
              <Text style={styles.resultLabel}>Optimal Wager:</Text>
              <Text style={[styles.resultValue, styles.resultValueHighlight]}>
                ${evResults.optimalWager.toLocaleString()}
              </Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Potential Win:</Text>
              <Text style={styles.resultValue}>
                ${evResults.potentialWin.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1e293b',
  },
  input: {
    width: '100%',
    padding: 12,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    color: '#1e293b',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 8,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pickerOption: {
    flex: 1,
    padding: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
  },
  pickerOptionActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  pickerOptionTextActive: {
    color: '#ffffff',
  },
  primaryButton: {
    width: '100%',
    padding: 14,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    padding: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#2563eb',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1e293b',
  },
  resultsText: {
    fontSize: 14,
    marginVertical: 4,
    color: '#1e293b',
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  resultItemHighlight: {
    backgroundColor: '#f8fafc',
    marginHorizontal: -20,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2563eb',
    borderBottomWidth: 2,
  },
  resultLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  resultValueHighlight: {
    fontSize: 20,
    color: '#2563eb',
  },
  positive: {
    color: '#10b981',
  },
  negative: {
    color: '#ef4444',
  },
});
