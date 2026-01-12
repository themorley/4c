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
} from '../utils/oddsCalculations';
import { getBankroll, saveBankroll } from '../utils/storage';

interface TeaserLeg {
  location: 'home' | 'away';
  line: number;
  odds: number;
  impliedProb: number;
  pushProb: number;
}

export default function WongTeaserScreen() {
  const [bankroll, setBankroll] = useState<string>('');
  const [numLegs, setNumLegs] = useState<number>(2);
  const [teaserOdds, setTeaserOdds] = useState<string>('');
  const [pushHandling, setPushHandling] = useState<'loss' | 'void' | 'push'>('void');
  const [legs, setLegs] = useState<Array<{
    location: 'home' | 'away';
    line: string;
    odds: string;
  }>>([]);
  const [teaserResults, setTeaserResults] = useState<{
    ev: number;
    prob: number;
    kellyPercent: number;
    wager: number;
  } | null>(null);

  // Load bankroll on mount
  useEffect(() => {
    loadBankroll();
  }, []);

  // Initialize legs when numLegs changes
  useEffect(() => {
    const newLegs = Array.from({ length: numLegs }, () => ({
      location: 'home' as 'home' | 'away',
      line: '',
      odds: '',
    }));
    setLegs(newLegs);
    setTeaserResults(null);
  }, [numLegs]);

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

  const updateLeg = (index: number, field: 'location' | 'line' | 'odds', value: string | 'home' | 'away') => {
    const newLegs = [...legs];
    if (field === 'location') {
      newLegs[index].location = value as 'home' | 'away';
    } else {
      newLegs[index][field] = value as string;
    }
    setLegs(newLegs);
  };

  const calculateTeaser = () => {
    const teaserOddsValue = parseFloat(teaserOdds);
    const bankrollValue = parseFloat(bankroll) || 0;

    if (!teaserOddsValue || isNaN(teaserOddsValue)) {
      Alert.alert('Error', 'Please enter the teaser odds');
      return;
    }

    const processedLegs: TeaserLeg[] = [];

    for (let i = 0; i < legs.length; i++) {
      const leg = legs[i];
      const line = parseFloat(leg.line);
      const odds = parseFloat(leg.odds);

      if (isNaN(line) || isNaN(odds)) {
        Alert.alert('Error', `Please fill in all fields for Leg ${i + 1}`);
        return;
      }

      // Calculate implied probability from odds
      const impliedProb = americanToImpliedProb(odds);

      // Estimate push probability based on line
      let pushProb = 0;
      const absLine = Math.abs(line);

      // Very rough push probability estimation
      if (absLine % 1 === 0) {
        // Whole number line has push possibility
        pushProb = 0.01; // ~1% push probability for whole numbers
      } else if (absLine % 0.5 === 0) {
        // Half point line, very low push probability
        pushProb = 0.001; // ~0.1% for half points
      }

      processedLegs.push({
        location: leg.location,
        line,
        odds,
        impliedProb,
        pushProb,
      });
    }

    // Calculate combined probability based on push handling
    let combinedProb = 1;

    if (pushHandling === 'loss') {
      // Push = loss means we only win if all legs win (no pushes)
      processedLegs.forEach((leg) => {
        combinedProb *= leg.impliedProb;
      });
    } else if (pushHandling === 'void') {
      // Push = void means push cancels that leg, probability is conditional
      processedLegs.forEach((leg) => {
        const noPushProb = 1 - leg.pushProb;
        // Adjusted win probability given no push
        const adjustedWinProb = leg.impliedProb / noPushProb;
        combinedProb *= adjustedWinProb * noPushProb;
      });
    } else if (pushHandling === 'push') {
      // Push = leg push means we need all non-push legs to win
      processedLegs.forEach((leg) => {
        // Win probability excluding pushes
        const noPushProb = 1 - leg.pushProb;
        const winGivenNoPush = leg.impliedProb / (noPushProb + 1e-10); // Avoid division by zero
        combinedProb *= winGivenNoPush * noPushProb;
      });
    }

    // Ensure probability is valid
    combinedProb = Math.max(0, Math.min(1, combinedProb));

    // Calculate EV
    const evResult = calculateEV(combinedProb, teaserOddsValue, 'favorite');

    if (!evResult) {
      Alert.alert('Error', 'Error calculating teaser EV');
      return;
    }

    // Calculate Kelly
    const kelly = calculateKelly(combinedProb, teaserOddsValue, bankrollValue);
    const roundedWager = Math.round(kelly.amount / 50) * 50; // Round to nearest $50 for teasers

    setTeaserResults({
      ev: evResult.ev,
      prob: combinedProb * 100,
      kellyPercent: kelly.percent,
      wager: roundedWager,
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
        <Text style={styles.sectionTitle}>Teaser Configuration</Text>
        <Text style={styles.label}>Number of Legs</Text>
        <View style={styles.pickerRow}>
          {[2, 3, 4].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.pickerOption,
                numLegs === num && styles.pickerOptionActive,
              ]}
              onPress={() => setNumLegs(num)}
            >
              <Text
                style={[
                  styles.pickerOptionText,
                  numLegs === num && styles.pickerOptionTextActive,
                ]}
              >
                {num} Legs
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.input}
          placeholder="Teaser Odds (e.g., -110, -120, -130)"
          value={teaserOdds}
          onChangeText={setTeaserOdds}
          keyboardType="numeric"
          placeholderTextColor="#64748b"
        />
        <Text style={styles.helpText}>
          Enter the odds the book is offering for this teaser
        </Text>
        <Text style={styles.label}>Push Handling</Text>
        <View style={styles.pickerRow}>
          <TouchableOpacity
            style={[
              styles.pickerOption,
              pushHandling === 'loss' && styles.pickerOptionActive,
            ]}
            onPress={() => setPushHandling('loss')}
          >
            <Text
              style={[
                styles.pickerOptionText,
                pushHandling === 'loss' && styles.pickerOptionTextActive,
              ]}
            >
              Push = Loss
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.pickerOption,
              pushHandling === 'void' && styles.pickerOptionActive,
            ]}
            onPress={() => setPushHandling('void')}
          >
            <Text
              style={[
                styles.pickerOptionText,
                pushHandling === 'void' && styles.pickerOptionTextActive,
              ]}
            >
              Push = Void
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.pickerOption,
              pushHandling === 'push' && styles.pickerOptionActive,
            ]}
            onPress={() => setPushHandling('push')}
          >
            <Text
              style={[
                styles.pickerOptionText,
                pushHandling === 'push' && styles.pickerOptionTextActive,
              ]}
            >
              Push = Leg Push
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legs</Text>
        {legs.map((leg, index) => (
          <View key={index} style={styles.legContainer}>
            <Text style={styles.legTitle}>Leg {index + 1}</Text>
            <Text style={styles.label}>Home or Away?</Text>
            <View style={styles.pickerRow}>
              <TouchableOpacity
                style={[
                  styles.pickerOption,
                  leg.location === 'home' && styles.pickerOptionActive,
                ]}
                onPress={() => updateLeg(index, 'location', 'home')}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    leg.location === 'home' && styles.pickerOptionTextActive,
                  ]}
                >
                  Home
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.pickerOption,
                  leg.location === 'away' && styles.pickerOptionActive,
                ]}
                onPress={() => updateLeg(index, 'location', 'away')}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    leg.location === 'away' && styles.pickerOptionTextActive,
                  ]}
                >
                  Away
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Teaser Line (e.g., 2.5 or -8.5)"
              value={leg.line}
              onChangeText={(value) => updateLeg(index, 'line', value)}
              keyboardType="numeric"
              placeholderTextColor="#64748b"
            />
            <Text style={styles.helpText}>
              Line after teaser points added
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Book Odds on Teaser Line (e.g., -110, -120, -130)"
              value={leg.odds}
              onChangeText={(value) => updateLeg(index, 'odds', value)}
              keyboardType="numeric"
              placeholderTextColor="#64748b"
            />
          </View>
        ))}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={calculateTeaser}
        >
          <Text style={styles.primaryButtonText}>Calculate Teaser EV</Text>
        </TouchableOpacity>
      </View>

      {teaserResults && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teaser Results</Text>
          <View style={styles.resultCard}>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Teaser EV:</Text>
              <Text
                style={[
                  styles.resultValue,
                  teaserResults.ev >= 0 ? styles.positive : styles.negative,
                ]}
              >
                {teaserResults.ev.toFixed(2)}%
              </Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Combined True Probability:</Text>
              <Text style={styles.resultValue}>
                {teaserResults.prob.toFixed(2)}%
              </Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Kelly Bet Size (%):</Text>
              <Text style={styles.resultValue}>
                {teaserResults.kellyPercent.toFixed(2)}%
              </Text>
            </View>
            <View style={[styles.resultItem, styles.resultItemHighlight]}>
              <Text style={styles.resultLabel}>Optimal Wager:</Text>
              <Text style={[styles.resultValue, styles.resultValueHighlight]}>
                ${teaserResults.wager.toLocaleString()}
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
    marginTop: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: -12,
    marginBottom: 8,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
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
    fontSize: 14,
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
  legContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  legTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
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
    flex: 1,
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
