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

// Displays the quiz question
export default function QuizScreen() {
    const { level } = useLocalSearchParams(); // retrieves N3 or N2 or N1, based on what the user chose in the main menu

    // These are the pieces of data that the user will interact with. and what they start as.
    const [quizQuestions, setQuizQuestions] = useState(getQuestionsByLevel(level as string))
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
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

    // Display the current question
    return (
        <View style={quizStyles.container}>

            {/* This displays the score. You can change the style later */}
            <Text style={quizStyles.scoreText}>
                {score * 15}
            </Text>

            <Text style={quizStyles.timerText}>
                ⏱ {timeLeft}
            </Text>
        
            <Text style={quizStyles.questionText}>
                {currentQuestion.questionText}
            </Text>

            {/* Render the component with answer choices */}
            <AnswerChoices
                choices={currentQuestion.choices}
                onSelectAnswer={handleAnswerPress}
           />
            
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
    questionText: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 40,
    },
    choicesContainer: {
        width: '100%',
        marginTop: 20,
    },
    choiceButton: {
        backgroundColor: '#f0f0f0',
        padding: 15,
        borderRadius: 8,
        marginVertical: 5,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    scoreText: {
        position: 'absolute',  // ← Key: removes it from normal flow
        top: 30,               // ← Distance from top (accounts for status bar)
        right: 20,             // ← Distance from right edge
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
        timerText: {
        position: 'absolute',  // Add this
        top: 30,              // Add this
        left: 20,             // Add this (opposite of score's "right")
        fontSize: 24,
        fontWeight: 'bold',
        color: '#e74c3c', 
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
})