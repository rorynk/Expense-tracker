const Expense = require('../models/Expense');

// @desc    Get all expenses for logged in user (supports filtering + pagination)
// @route   GET /api/expenses?category=&from=&to=&page=&limit=&sort=
// @access  Private
const getExpenses = async (req, res, next) => {
  try {
    const { category, from, to, page = 1, limit = 20, sort = '-date' } = req.query;

    const query = { user: req.user._id };

    if (category) query.category = category;

    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Expense.countDocuments(query),
    ]);

    res.json({
      expenses,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single expense by id
// @route   GET /api/expenses/:id
// @access  Private
const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res, next) => {
  try {
    const { title, amount, category, notes, date } = req.body;

    if (!title || amount === undefined) {
      return res.status(400).json({ message: 'Title and amount are required' });
    }

    const expense = await Expense.create({
      user: req.user._id,
      title,
      amount,
      category,
      notes,
      date: date || Date.now(),
    });

    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const { title, amount, category, notes, date } = req.body;

    if (title !== undefined) expense.title = title;
    if (amount !== undefined) expense.amount = amount;
    if (category !== undefined) expense.category = category;
    if (notes !== undefined) expense.notes = notes;
    if (date !== undefined) expense.date = date;

    await expense.save();

    res.json(expense);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted', id: req.params.id });
  } catch (err) {
    next(err);
  }
};

// @desc    Get summary stats: total spend, by category, by month
// @route   GET /api/expenses/stats/summary
// @access  Private
const getSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [totalAgg, byCategory, byMonth] = await Promise.all([
      Expense.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Expense.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
      Expense.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' } },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),
    ]);

    res.json({
      total: totalAgg[0]?.total || 0,
      count: totalAgg[0]?.count || 0,
      byCategory: byCategory.map((c) => ({ category: c._id, total: c.total, count: c.count })),
      byMonth: byMonth.map((m) => ({
        year: m._id.year,
        month: m._id.month,
        total: m.total,
      })),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getSummary,
};
