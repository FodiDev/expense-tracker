import incomeModel from '../models/incomeModel.js';
import XLSX from 'xlsx';
import getDateRange from '../utils/datafilter.js';
import { validateTransaction } from '../utils/validateTransaction.js';

//add income
export async function addIncome(req, res) {
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

    const income = await incomeModel.create({
      userId: req.user._id,
      description: description.trim(),
      amount: Number(amount),
      category: category.trim(),
      date,
    });

    return res.status(201).json({
      success: true,
      message: 'Income added successfully.',
      income,
    });
  } catch (error) {
    console.error('Add income error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while adding income.',
    });
  }
}

//To get income(all)
export async function getAllIncome(req, res) {
  const userId = req.user._id;
  try {
    const income = await incomeModel.find({ userId }).sort({ date: -1 });
    res.json(income);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
}

//update an income
export async function updateIncome(req, res) {
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

    const income = await incomeModel.findOneAndUpdate(
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

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Income updated successfully.',
      income,
    });
  } catch (error) {
    console.error('Update income error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while updating income.',
    });
  }
}

//To delete an income
export async function deleteIncome(req, res) {
  try {
    const income = await incomeModel.findByIdAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income not found',
      });
    }
    return res.json({
      success: true,
      message: 'Income deleted successfully.',
    });
  } catch (error) {
    console.error('Delete income error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting income',
    });
  }
}

//To download the data in an excel sheet
export async function downloadIncomeExcel(req, res) {
  const userId = req.user._id;
  try {
    const income = await incomeModel.find({ userId }).sort({ date: -1 });
    const plainData = income.map((inc) => ({
      Description: inc.description,
      Amount: inc.amount,
      Category: inc.category,
      Date: new Date(inc.date).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(plainData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'incomeModel');
    XLSX.writeFile(workbook, 'income_details.xlsx');
    res.download('income_details.xlsx');
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
}

//To get income overview
export async function getIncomeOverview(req, res) {
  try {
    const userId = req.user._id;
    const { range = 'monthly' } = req.query;
    const { start, end } = getDateRange(range);

    const incomes = await incomeModel
      .find({
        userId,
        date: { $gte: start, $lte: end },
      })
      .sort({ date: -1 });

    const totalIncome = incomes.reduce((acc, cur) => acc + cur.amount, 0);
    const averageIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;
    const numberOfTransactions = incomes.length;

    const recentTransactions = incomes.slice(0, 9);

    res.json({
      success: true,
      data: {
        totalIncome,
        averageIncome,
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
