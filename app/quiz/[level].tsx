import { getQuestionsByLevel } from '@/data/questions';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
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

    // These are 3 pieces of data that the user will interact with. and what they start as.
    const [quizQuestions, setQuizQuestions] = useState(getQuestionsByLevel(level as string))
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Get the current question!
    const currentQuestion = quizQuestions[currentQuestionIndex];

    if (currentQuestionIndex >= quizQuestions.length) {
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
        // 1. Check for correctness
        const isCorrect = selectedChoice === currentQuestion.correctAnswer;
        console.log(`User selected: ${selectedChoice}`);

        // 2. Update score
        if (isCorrect) {
            setScore(score + 1)
        }

        // 3. Advance question index
        setCurrentQuestionIndex(currentQuestionIndex + 1); 
    }

    // Display the current question
    return (
        <View style={quizStyles.container}>

            {/* This displays the score. You can change the style later */}
            <Text style={quizStyles.scoreText}>
                {score * 15}
            </Text>
        
            <Text style={quizStyles.questionText}>
                {currentQuestion.questionText}
            </Text>

            {/* Render the component with answer choices */}
            <AnswerChoices
                choices={currentQuestion.choices}
                onSelectAnswer={handleAnswerPress}
           />

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
})