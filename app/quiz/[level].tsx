import { getQuestionsByLevel } from '@/data/questions';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';


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

    // These are the pieces of data that the user will interact with. and what they start as.
    const [quizQuestions, setQuizQuestions] = useState(getQuestionsByLevel(level as string))
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

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

    // Game ends if all questions answered, or time runs out
    if (currentQuestionIndex >= quizQuestions.length || timeLeft <= 0) {
        return (
            <View style={quizStyles.container}>
                <Text style={quizStyles.questionText}>
                    Quiz Finished! 🎉
                </Text>
                <Text>Final Score: {score * 15}</Text>
                
            </View>
        )
    }

    const handleAnswerPress = (selectedChoice: string) => {
        // Check for correctness
        const isCorrect = selectedChoice === currentQuestion.correctAnswer;
        console.log(`User selected: ${selectedChoice}`);

        // Store result in setIsCorrect
        setIsCorrect(isCorrect);

        // show feedback
        setShowFeedback(true);

        // Update score
        if (isCorrect) {
            setScore(score + 1)
        }

        // Wait, then advance question index
        setTimeout(() => {
            setShowFeedback(false);
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }, 1500); // wait 1.5 seconds
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
                    <Text style={quizStyles.scoreText}>{score * 15}</Text>
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

})