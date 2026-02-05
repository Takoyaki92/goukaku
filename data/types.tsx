export interface Question {
    id: string;
    level: 'N1' | 'N2' | 'N3';
    questionText: string;
    choices: string[];
    correctAnswer: string;
}

