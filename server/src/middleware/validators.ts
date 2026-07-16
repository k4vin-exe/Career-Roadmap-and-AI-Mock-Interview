import { body, param } from 'express-validator';

export const validateStartInterview = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .escape(),
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Job role is required')
    .isIn([
      'Frontend Developer',
      'Backend Developer',
      'Cloud Engineer',
      'Java Developer',
      'Python Developer',
      'Data Analyst',
      'Machine Learning Engineer',
    ])
    .withMessage('Invalid job role'),
  body('experience')
    .trim()
    .notEmpty()
    .withMessage('Experience level is required')
    .isIn(['Beginner', 'Intermediate', 'Experienced'])
    .withMessage('Invalid experience level'),
];

export const validateSubmitAnswer = [
  param('sessionId')
    .isMongoId()
    .withMessage('Invalid session ID'),
  body('questionIndex')
    .isInt({ min: 1, max: 5 })
    .withMessage('Question index must be between 1 and 5'),
  body('transcript')
    .trim()
    .notEmpty()
    .withMessage('Transcript is required'),
  body('editedTranscript')
    .optional()
    .trim(),
  body('totalWords')
    .isInt({ min: 0 })
    .withMessage('Total words must be a non-negative integer'),
  body('fillerWords')
    .isArray()
    .withMessage('Filler words must be an array'),
  body('fillerWordCount')
    .isInt({ min: 0 })
    .withMessage('Filler word count must be a non-negative integer'),
  body('repeatedWords')
    .isArray()
    .withMessage('Repeated words must be an array'),
  body('repeatedWordCount')
    .isInt({ min: 0 })
    .withMessage('Repeated word count must be a non-negative integer'),
  body('fluencyScore')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Fluency score must be between 0 and 100'),
  body('questionDuration')
    .isFloat({ min: 0 })
    .withMessage('Question duration must be a non-negative number'),
];

export const validateSessionId = [
  param('sessionId')
    .isMongoId()
    .withMessage('Invalid session ID'),
];
