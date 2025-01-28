import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LeaderboardScreen from './LeaderBoard';
import LearningProgress from './StudentProgress';

const Tracker = () => {
  const [activeTab, setActiveTab] = useState('LeaderboardScreen'); 

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'LeaderboardScreen' && styles.activeTab]}
          onPress={() => setActiveTab('LeaderboardScreen')}
        >
          <Text style={[styles.tabText, activeTab === 'LeaderboardScreen' && styles.activeTabText]}>
            Leaderboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'LearningProgress' && styles.activeTab]}
          onPress={() => setActiveTab('LearningProgress')}
        >
          <Text style={[styles.tabText, activeTab === 'LearningProgress' && styles.activeTabText]}>
            Learning Progress
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'LeaderboardScreen' && <LeaderboardScreen />}
      {activeTab === 'LearningProgress' && <LearningProgress />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#151B54',
    paddingVertical: 10,
  },
  tab: {
    padding: 10,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: 'white',
  },
  tabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#FFD700', // Gold color for the active tab text
  },
});

export default Tracker;
