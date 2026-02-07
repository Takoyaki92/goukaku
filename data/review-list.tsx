import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuestionAndResult } from './types';

const REVIEW_LIST_KEY = '@review_list';

export const addToReviewList = async (question: QuestionAndResult) => {
    const existingData = await AsyncStorage.getItem(REVIEW_LIST_KEY);
    const reviewList = existingData ? JSON.parse(existingData) : [];

    // Check for duplicates
    const isDuplicate = reviewList.some((q: QuestionAndResult) => q.questionText === question.questionText);
    if (isDuplicate) {
        return false;
    }

    reviewList.push(question)
    await AsyncStorage.setItem(REVIEW_LIST_KEY, JSON.stringify(reviewList));
    return true;
};

export const getReviewList = async (): Promise<QuestionAndResult[]> => {
    const existingData = await AsyncStorage.getItem(REVIEW_LIST_KEY);
    return existingData ? JSON.parse(existingData) : [];
}

export const removeFromReviewList = async (questionText: string) => {
  const reviewList = await getReviewList();
  const updatedList = reviewList.filter(q => q.questionText !== questionText);
  await AsyncStorage.setItem(REVIEW_LIST_KEY, JSON.stringify(updatedList));
};