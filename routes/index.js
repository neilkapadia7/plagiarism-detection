const express = require('express');
const { body, validationResult } = require('express-validator');
const TextMatcher = require('../services/TextMatcher');
const responder = require('../services/responder');

const router = express.Router();
const matcher = new TextMatcher();

router.get('/health', (req, res) => {
  try {
    responder.success(res, { status: 'ok' });
  } catch (err) {
    responder.error(res, err.message || 'Internal server error', 500);
  }
});

const compareValidators = [
  body('source')
    .exists().withMessage('"source" is required.')
    .bail()
    .isString().withMessage('"source" must be a string.'),
  body('candidate')
    .exists().withMessage('"candidate" is required.')
    .bail()
    .isString().withMessage('"candidate" must be a string.'),
];

router.post('/compare', compareValidators, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responder.error(res, errors.array()[0].msg, 400);
    }

    const { source, candidate } = req.body;
    const result = matcher.compare(source, candidate);
    return responder.success(res, result);
  } catch (err) {
    return responder.error(res, err.message || 'Internal server error', 500);
  }
});

module.exports = router;
