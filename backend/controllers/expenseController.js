import expenseModel from '../models/expenseModel.js';
import getDateRange from '../utils/datafilter.js';
import XLSX from 'xlsx';
import { validateTransaction } from '../utils/validateTransaction.js';

// Add Expense
export async function addExpense(req, res) {
  try {
    const { description, amount, category, date } = req.body;

    const validation = validateTransaction({
      description,
      amount,
      category,
      date,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors,
      });
    }

    const expense = await expenseModel.create({
      userId: req.user._id,
      description: description.trim(),
      amount: Number(amount),
      category: category.trim(),
      date,
    });

    return res.status(201).json({
      success: true,
      message: 'Expense added successfully.',
      expense,
    });
  } catch (error) {
    console.error('Add expense error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while adding expense.',
    });
  }
}

// To get expense(All)
export async function getAllExpense(req, res) {
  const userId = req.user._id;
  try {
    const expense = await expenseModel.find({ userId }).sort({ date: -1 });
    res.json(expense);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
}

// To update the expense
export async function updateExpense(req, res) {
  try {
    const { description, amount, category, date } = req.body;

    const validation = validateTransaction({
      description,
      amount,
      category,
      date,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors,
      });
    }

    const expense = await expenseModel.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
      },
      {
        description: description.trim(),
        amount: Number(amount),
        category: category.trim(),
        date,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Expense updated successfully.',
      expense,
    });
  } catch (error) {
    console.error('Update expense error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while updating expense.',
    });
  }
}

// Delete an expense
export async function deleteExpense(req, res) {
  try {
    const expense = await expenseModel.findByIdAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Expense deleted successfully.',
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting expense.',
    });
  }
}

// Download excel for expense
export async function downloadExpenseExcel(req, res) {
  const userId = req.user._id;
  try {
    const expense = await expenseModel.find({ userId }).sort({ date: -1 });
    const plainData = expense.map((exp) => ({
      Description: exp.description,
      Amount: exp.amount,
      Category: exp.category,
      Date: new Date(exp.date).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(plainData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'expenseModel');
    XLSX.writeFile(workbook, 'expense_details.xlsx');
    res.download('expense_details.xlsx');
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
}

// Get Overview of Expense
export async function getExpenseOverview(req, res) {
  try {
    const userId = req.user._id;
    const { range = 'monthly' } = req.query;
    const { start, end } = getDateRange(range);

    const expense = await expenseModel
      .find({
        userId,
        date: { $gte: start, $lte: end },
      })
      .sort({ date: -1 });

    const totalExpense = expense.reduce((acc, cur) => acc + cur.amount, 0);
    const averageExpense =
      expense.length > 0 ? totalExpense / expense.length : 0;
    const numberOfTransactions = expense.length;
    const recentTransactions = expense.slice(0, 9);

    res.json({
      success: true,
      data: {
        totalExpense,
        averageExpense,
        numberOfTransactions,
        recentTransactions,
        range,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
}
