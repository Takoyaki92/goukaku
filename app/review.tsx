import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
// Adjust this import path to where your function is located
import { getReviewList } from '@/data/review-list';
import { QuestionAndResult } from '@/data/types';

export default function ReviewScreen() {
  const [reviews, setReviews] = useState<QuestionAndResult[]>([]);

  useEffect(() => {
    getReviewList().then(setReviews);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Review Your Answers</Text>
      
      <FlatList
        data={reviews}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.card, item.isCorrect ? styles.correctBorder : styles.wrongBorder]}>
            <Text style={styles.question}>{item.questionText}</Text>
            
            <View style={styles.resultRow}>
              <Text style={styles.label}>Your Answer: </Text>
              <Text style={item.isCorrect ? styles.correctText : styles.wrongText}>
                {item.userAnswer}
              </Text>
            </View>

            {!item.isCorrect && (
              <View style={styles.resultRow}>
                <Text style={styles.label}>Correct: </Text>
                <Text style={styles.correctText}>{item.correctAnswer}</Text>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 40,
    textAlign: 'center',
  },
  card: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
    borderLeftWidth: 5,
    elevation: 2, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  correctBorder: { borderLeftColor: '#4CAF50' },
  wrongBorder: { borderLeftColor: '#F44336' },
  question: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  resultRow: {
    flexDirection: 'row',
    marginTop: 5,
  },
  label: {
    fontWeight: 'bold',
    color: '#666',
  },
  correctText: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  wrongText: {
    color: '#C62828',
    fontWeight: 'bold',
  },
});