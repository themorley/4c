/**
 * Storage utilities for persisting bankroll and other data
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const BANKROLL_KEY = '@4c:bankroll';

export async function getBankroll(): Promise<number | null> {
  try {
    const value = await AsyncStorage.getItem(BANKROLL_KEY);
    return value ? parseFloat(value) : null;
  } catch (error) {
    console.error('Error getting bankroll:', error);
    return null;
  }
}

export async function saveBankroll(bankroll: number): Promise<void> {
  try {
    await AsyncStorage.setItem(BANKROLL_KEY, bankroll.toString());
  } catch (error) {
    console.error('Error saving bankroll:', error);
  }
}
