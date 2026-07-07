const express = require('express');
const {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getSummary,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All expense routes require a valid JWT
router.use(protect);

router.get('/stats/summary', getSummary);

router.route('/').get(getExpenses).post(createExpense);

router.route('/:id').get(getExpenseById).put(updateExpense).delete(deleteExpense);

module.exports = router;
