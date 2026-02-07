import { getQuestionsByLevel } from '@/data/questions';
import { addToReviewList } from '@/data/review-list';
import { QuestionAndResult } from '@/data/types';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const timerDuration = 10;

const getRank = (score: number): string => {
    if (score >= 500) return 'S';
    if (score >= 400) return 'A';
    if (score >= 300) return 'B';
    if (score >= 200) return 'C';
    if (score >= 100) return 'D';
    return 'F';
};

const getRankColor = (rank: string): string => {
    switch (rank) {
        case 'S': return '#FFD700';  // Gold
        case 'A': return '#00D4FF';  // Cyan/Blue
        case 'B': return '#00FF00';  // Green
        case 'C': return '#FFA500';  // Orange
        case 'D': return '#FF6B6B';  // Red
        case 'F': return '#999999';  // Gray
        default: return '#999999';
    }
};

interface AnswerChoiceProps {
    choices: string[];
    onSelectAnswer: (selectedChoice: string) => void;
}

function AnswerChoices({choices, onSelectAnswer}: AnswerChoiceProps) {
    return (
        <View style={quizStyles.choicesContainer}>
            {choices.map((choiceText, index) => (
                <TouchableOpacity
                    key={index}
                    style={quizStyles.choiceButton}
                    onPress={() => onSelectAnswer(choiceText)}
                >
                    <Text style={quizStyles.buttonText}>{choiceText}</Text>
                </TouchableOpacity>
            ))}
        </View>
    )
}

// Displays all UI elements!
export default function QuizScreen() {
    const { level } = useLocalSearchParams(); // retrieves N3 or N2 or N1, based on what the user chose in the main menu
    const router = useRouter();

    // These are the pieces of data that the user will interact with. and what they start as.
    const [quizQuestions, setQuizQuestions] = useState(getQuestionsByLevel(level as string))
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(timerDuration);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    // Stored answered questions & results in an array
    const [questionList, setQuestionList] = useState<Array<QuestionAndResult>>([]);

    // Timer logic
    useEffect(() => {
        if (currentQuestionIndex >= quizQuestions.length || timeLeft <=0) {
            return;
        }

        // set up interval to run every 1s
        const timer = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);

        // Stop timer when component unmounts or dependencies change
        return () => clearInterval(timer);
     }, [currentQuestionIndex, quizQuestions.length, timeLeft]);


    // Get the current question!
    const currentQuestion = quizQuestions[currentQuestionIndex];

    // Results screen: Game ends if all questions answered, or time runs out
    if (currentQuestionIndex >= quizQuestions.length || timeLeft <= 0) {
        const finalScore = score * 30;
        const rank = getRank(finalScore);
        const rankColor = getRankColor(rank);

        return (
            <View style={quizStyles.resultsContainer}>
                {/* Rank and Score Display */}
                <View style={quizStyles.rankSection}>
                    <Text style={quizStyles.rankLabel}>Rank</Text>
                    <Text style={[quizStyles.rankLetter, { color: rankColor }]}>
                        {rank}
                    </Text>
                    <Text style={quizStyles.scoreDisplay}>Score: {finalScore}</Text>
                </View>

                {/* Question Results List (SCROLLABLE!) */}
                <ScrollView 
                    style={quizStyles.questionListContainer}
                    contentContainerStyle={quizStyles.questionListContent}
                >
                    {questionList.map((result, index) => (
                        <View key={index} style={quizStyles.questionListItem}>
                            {/* Icon */}
                            <Text style={quizStyles.resultIcon}>
                                {result.isCorrect ? '✅' : '❌'}
                            </Text>
                            
                            {/* Question Info */}
                            <View style={quizStyles.resultContent}>
                                <Text style={quizStyles.questionNumber}>
                                    Question {index + 1}:
                                </Text>
                                <Text style={quizStyles.questionPreview} numberOfLines={1}>
                                    {result.questionText}
                                </Text>
                            </View>
                            
                            {/* Save Button */}
                            <TouchableOpacity 
                                style={quizStyles.saveButton}
                                onPress={async () => {
                                    // TODO: Save to review list
                                    const success = await addToReviewList(result);
                                    if (success) {
                                        alert('Saved to review list! 📚');
                                    } else {
                                        alert('Already in review list! ❗');
                                    }
                                }}
                            >
                                <Text style={quizStyles.saveIcon}>💾</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>

                {/* Action Buttons */}
                <View style={quizStyles.buttonContainer}>
                    <TouchableOpacity 
                        style={[quizStyles.actionButton, quizStyles.mainMenuButton]}
                        onPress={() => router.push('/')}
                    >
                        <Text style={quizStyles.buttonTextWhite}>Main Menu</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[quizStyles.actionButton, quizStyles.playAgainButton]}
                        onPress={() => {
                            // Reset the quiz
                            setScore(0);
                            setTimeLeft(timerDuration);
                            setCurrentQuestionIndex(0);
                            setShowFeedback(false);
                            setQuestionList([]);
                        }}
                    >
                        <Text style={quizStyles.buttonTextWhite}>Play Again</Text>
                    </TouchableOpacity>
                </View>

                {/* Leaderboard Button (placeholder for later) */}
                <TouchableOpacity 
                    style={[quizStyles.actionButton, quizStyles.leaderboardButton]}
                    onPress={() => {
                        // TODO: Navigate to leaderboard
                        alert('Leaderboard coming soon! 🏆');
                    }}
                >
                    <Text style={quizStyles.buttonTextDark}>View Leaderboards</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const handleAnswerPress = (selectedChoice: string) => {
        // Check for correctness
        const isCorrect = selectedChoice === currentQuestion.correctAnswer;
        console.log(`User selected: ${selectedChoice}`);

        // Save question & result to questionList
        const result = {
            questionText: currentQuestion.questionText,
            userAnswer: selectedChoice,
            correctAnswer: currentQuestion.correctAnswer,
            isCorrect: isCorrect,
            choices: currentQuestion.choices,
        };
        setQuestionList([...questionList, result]);

        if (isCorrect) {
            setScore(score + 1);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setIsCorrect(true);
            setShowFeedback(true);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setIsCorrect(false);
            setShowFeedback(true);
        }

        // Wait, then advance question index
        setTimeout(() => {
            setShowFeedback(false);
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }, 1200); // wait 1.2 seconds
    }

    // Displays the UI elements
    return (
        <View style={quizStyles.container}>

            {/* Header with timer and score */}
            <View style={quizStyles.header}>
                {/* Timer - capsule shaped */}
                <View style={quizStyles.capsule}>
                    <Text style={quizStyles.timerIcon}>⏱</Text>
                    <Text style={quizStyles.timerText}>{timeLeft}</Text>
                </View>

                {/* Score - capsule shaped */}
                <View style={quizStyles.capsule}>
                    <Text style={quizStyles.coinIcon}>🪙</Text>
                    <Text style={quizStyles.scoreText}>{score * 30}</Text>
                </View>
            </View>
            
            {/* Question - top half center */}
            <View style={quizStyles.questionContainer}>
                <Text style={quizStyles.questionText}>
                    {currentQuestion.questionText}
                </Text>
                
                {/* Combo indicator (if you want to add it) */}
                {/* <Text style={quizStyles.comboText}>3x COMBO! 🔥</Text> */}
            </View>

            {/* Answer choices - bottom half */}
            <View style={quizStyles.answersContainer}>
                <AnswerChoices
                    choices={currentQuestion.choices}
                    onSelectAnswer={handleAnswerPress}
                />
            </View>
            
            {/* FEEDBACK - shows after answer selected */}
            {showFeedback && (
                <View style={quizStyles.feedbackContainer}>
                    {isCorrect ? (
                        <Text style={quizStyles.correctText}>✅ 正解！</Text>
                    ) : (
                        <Text style={quizStyles.wrongText}>❌ 不正解</Text>
                    )}
                </View>
            )}
        </View>
    );
}

const quizStyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'flex-start', // start content at top
        alignItems: 'center',
        backgroundColor: '#fff',
    },
        // Question container - top half, centered
        questionContainer: {
        flex: 1,  // Takes up available space in top half
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
        questionText: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#1a1a1a',
        lineHeight: 40,
    },
        // Combo text (optional - for later)
    comboText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#e74c3c',
        marginTop: 20,
    },
    // Answer choices - bottom half
    answersContainer: {
        flex: 1,  // Takes up bottom half
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    
    choicesContainer: {
        width: '100%',
    },
    
    choiceButton: {
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 12,
        marginVertical: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
        feedbackContainer: {
        position: 'absolute',
        top: '50%',
        alignSelf: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 30,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,  // for Android shadow
    },
        correctText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#27ae60',  // Green
        textAlign: 'center',
    },
        wrongText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#e74c3c',  // Red
        textAlign: 'center',
    },
        // Header with timer and score
        header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,  // Account for status bar
        paddingBottom: 10,
    },
        // Capsule style for timer and score
        capsule: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 25,  // Makes it capsule/pill shaped
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
        timerIcon: {
        fontSize: 20,
        marginRight: 6,
    },
    
        timerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    
        coinIcon: {
        fontSize: 20,
        marginRight: 6,
    },
    
        scoreText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
        // Results Screen Styles
    resultsContainer: {
        flex: 1,
        backgroundColor: '#87CEEB',  // Sky blue like your image
        padding: 20,
        paddingTop: 60,
    },

    // Rank Section
    rankSection: {
        alignItems: 'center',
        marginBottom: 20,
    },

    rankLabel: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },

    rankLetter: {
        fontSize: 120,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 3, height: 3 },
        textShadowRadius: 6,
        marginVertical: 10,
    },

    scoreDisplay: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },

    placeholderText: {
        fontSize: 18,
        color: '#999',
    },

    // Buttons
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        gap: 10,
    },

    actionButton: {
        flex: 1,
        padding: 16,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },

    mainMenuButton: {
        backgroundColor: '#4A90E2',  // Blue
        borderWidth: 3,
        borderColor: '#fff',
    },

    playAgainButton: {
        backgroundColor: '#5CB85C',  // Green
        borderWidth: 3,
        borderColor: '#fff',
    },

    leaderboardButton: {
        backgroundColor: '#FFD700',  // Yellow/Gold
        borderWidth: 3,
        borderColor: '#fff',
        width: '100%',
    },

    buttonTextWhite: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },

    buttonTextDark: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textShadowColor: 'rgba(255, 255, 255, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    questionListContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },

    questionListContent: {
        padding: 15,
    },

    questionListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },

    resultIcon: {
        fontSize: 24,
        marginRight: 12,
    },

    resultContent: {
        flex: 1,
    },

    questionNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },

    questionPreview: {
        fontSize: 13,
        color: '#666',
    },

    saveButton: {
        padding: 8,
    },

    saveIcon: {
        fontSize: 20,
    },

})