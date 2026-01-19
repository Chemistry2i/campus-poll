// backend/validators/candidateValidator.js

const { body } = require('express-validator');

// Validation rules for creating a candidate
const createCandidateValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('position')
    .trim()
    .notEmpty().withMessage('Position is required'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
  body('manifesto')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Manifesto must be at most 2000 characters'),
  body('email')
    .optional()
    .isEmail().withMessage('Invalid email address'),
  body('phone')
    .optional()
    .isMobilePhone().withMessage('Invalid phone number'),
  // Add more fields as needed
];

module.exports = {
  createCandidateValidation
};
