import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { db } from '../../FirebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const LeaderboardScreen = () => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Fetch all quiz scores
        const leaderboardRef = collection(db, 'quizScores');
        const snapshot = await getDocs(leaderboardRef);

        // Calculate total scores and quiz counts for each user
        const studentScores = {};
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const { userId, userName, scorePercentage } = data;

          if (!studentScores[userId]) {
            studentScores[userId] = { totalScore: 0, quizCount: 0, userName };
          }

          studentScores[userId].totalScore += scorePercentage;
          studentScores[userId].quizCount += 1;
        });

        // Compute average scores and sort the leaderboard
        const leaderboardData = Object.keys(studentScores).map((userId) => {
          const { totalScore, quizCount, userName } = studentScores[userId];
          const averageScore = totalScore / quizCount;

          return { userId, userName, averageScore };
        });

        leaderboardData.sort((a, b) => b.averageScore - a.averageScore);
        const top5Leaderboard = leaderboardData.slice(0, 5);

        setLeaderboard(top5Leaderboard);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        Alert.alert('Error', 'Failed to load leaderboard.');
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      {leaderboard.length > 0 ? (
        <FlatList
          data={leaderboard}
          renderItem={({ item, index }) => (
            <View style={styles.row}>
              <Text style={styles.rankText}>{index + 1}</Text>
              <Text style={styles.nameText}>{item.userName}</Text>
              <Text style={styles.scoreText}>{item.averageScore.toFixed(2)}%</Text>
            </View>
          )}
          keyExtractor={(item) => item.userId}
        />
      ) : (
        <Text style={styles.noDataText}>No leaderboard data available.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  nameText: {
    fontSize: 18,
    color: '#333',
  },
  scoreText: {
    fontSize: 18,
    color: '#4CAF50', 
    fontWeight: 'bold',
  },
  noDataText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginTop: 50,
  },
});
export default LeaderboardScreen;