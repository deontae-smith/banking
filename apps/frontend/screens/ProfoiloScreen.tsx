// NewScreen.tsx
// React Native screen inspired by the provided banking UI image

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { useClerkUser } from '@/hooks/useClerkUser';
import { GreetingHeader } from '@/components/headers/TopBar';

export function PortfolioOverviewScreen({ navigation }: any) {
  const { user, isLoading } = useClerkUser();

  if (isLoading || !user) return ActivityIndicator;
  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.rowCenter}>
            {/* <Image
            source={require('../assets/profile.png')}
            style={styles.profileImg}
          /> */}
            <View>
              <GreetingHeader />
            </View>
          </View>
          <TouchableOpacity>
            <Ionicons name='notifications-outline' size={26} color='#000' />
          </TouchableOpacity>
        </View>

        {/* Value */}
        <View style={styles.valueBox}>
          <View style={styles.rowBetween}>
            <Text style={styles.value}>$475,432.98</Text>
            <Ionicons name='eye-off-outline' size={22} color='#000' />
          </View>
          <View style={styles.rowCenter}>
            <Text style={styles.profitLabel}>Your profit is </Text>
            <Text style={styles.profitAmount}>$411,234.72</Text>
            <View style={styles.percentPill}>
              <Text style={styles.percentText}>8.2%</Text>
            </View>
          </View>
        </View>

        {/* Portfolio Cards */}
        <Text style={styles.sectionTitle}>Your Portfolio</Text>
        <View style={styles.rowBetween}>
          <View style={styles.card}>
            <Ionicons name='folder-outline' size={22} color='#000' />
            <Text style={styles.cardTitle}>Saving</Text>
            <Text style={styles.cardValue}>$4,342.71</Text>
            <Text style={styles.cardProfit}>↑ 8.2%</Text>
          </View>

          <View style={styles.card}>
            <Ionicons name='calendar-outline' size={22} color='#000' />
            <Text style={styles.cardTitle}>Daily</Text>
            <Text style={styles.cardValue}>$3,187.20</Text>
            <Text style={styles.cardProfit}>↑ 5.3%</Text>
          </View>
        </View>

        {/* Banner */}
        <TouchableOpacity style={styles.banner}>
          <Text style={styles.bannerTitle}>Introduce Vestgrow</Text>
          <Text style={styles.bannerSubtitle}>
            For you who want to explore Invest
          </Text>
        </TouchableOpacity>

        {/* Recommendation */}
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Recommendation</Text>
          <TouchableOpacity>
            <Text style={styles.seeMore}>See More</Text>
          </TouchableOpacity>
        </View>

        {/* Recommended Stocks */}
        <View style={styles.stockRow}>
          {/* <Image
          source={require('../assets/adidas.png')}
          style={styles.stockLogo}
        /> */}
          <View style={{ flex: 1 }}>
            <Text style={styles.stockName}>Adidas AG (ADS)</Text>
          </View>
          <View>
            <Text style={styles.stockPrice}>$200.49</Text>
            <Text style={styles.stockChange}>↑ 0.76%</Text>
          </View>
        </View>

        <View style={styles.stockRow}>
          {/* <Image
          source={require('../assets/apple.png')}
          style={styles.stockLogo}
        /> */}
          <View style={{ flex: 1 }}>
            <Text style={styles.stockName}>Apple Inc (AAPL)</Text>
          </View>
          <View>
            <Text style={styles.stockPrice}>$189.46</Text>
            <Text style={styles.stockChange}>↑ 0.85%</Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
    paddingTop: 60,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileImg: {
    height: 45,
    width: 45,
    borderRadius: 22,
    marginRight: 10,
  },
  welcome: {
    color: '#6b7280',
    fontSize: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
  },
  valueBox: {
    marginTop: 25,
  },
  value: {
    fontSize: 32,
    fontWeight: '700',
  },
  profitLabel: {
    color: '#475569',
  },
  profitAmount: {
    color: '#2563eb',
    fontWeight: '600',
  },
  percentPill: {
    backgroundColor: '#22c55e33',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  percentText: {
    color: '#16a34a',
    fontWeight: '600',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 25,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    width: '48%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    marginTop: 8,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  cardProfit: {
    marginTop: 4,
    color: '#16a34a',
    fontWeight: '600',
  },
  banner: {
    backgroundColor: '#2563eb',
    padding: 20,
    borderRadius: 16,
    marginTop: 25,
  },
  bannerTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  bannerSubtitle: {
    color: '#e0e7ff',
    marginTop: 4,
  },
  seeMore: {
    color: '#2563eb',
    fontWeight: '600',
  },
  stockRow: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  stockLogo: {
    height: 34,
    width: 34,
    marginRight: 12,
  },
  stockName: {
    fontSize: 15,
    fontWeight: '600',
  },
  stockPrice: {
    fontWeight: '700',
  },
  stockChange: {
    fontSize: 12,
    color: '#16a34a',
    textAlign: 'right',
  },
});
