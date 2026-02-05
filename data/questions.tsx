import { N1_QUESTIONS } from './n1-questions';
import { N2_QUESTIONS } from './n2-questions';
import { N3_QUESTIONS } from './n3-questions';
import { Question } from './types';

export const getQuestionsByLevel = (level: string): Question[] => {
    switch (level) {
        case 'N1': return N1_QUESTIONS;
        case 'N2': return N2_QUESTIONS;
        case 'N3': return N3_QUESTIONS;
        default: return N2_QUESTIONS;
    }
};

export { N1_QUESTIONS, N2_QUESTIONS, N3_QUESTIONS };
