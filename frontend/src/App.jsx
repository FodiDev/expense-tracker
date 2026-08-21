import { React, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Login from './components/Login';
import Signup from './components/Signup';
import Income from './pages/Income';
import Expense from './pages/Expense';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

const API_URL = 'https://expense-tracker-backend-sz4u.onrender.com/api';

// Get transactions from local storage
const getTransactionsFromStorage = () => {
  const saved = localStorage.getItem('transactions');
  return saved ? JSON.parse(saved) : [];
};

// Scroll to top when a new page is visited
const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto',
    });
  }, [location.pathname]);

  return null;
};

const App = () => {
  const { user, isLoading } = useAuth();

  // Keep transaction state here for now.
  // We will audit and improve this architecture separately.
  const [transactions, setTransactions] = useState([]);

  // Load transactions when the application starts
  useEffect(() => {
    try {
      setTransactions(getTransactionsFromStorage());
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  }, []);

  // Save transactions whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('transactions', JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  }, [transactions]);

  // Transaction helpers
  const addTransaction = (newTransaction) => {
    setTransactions((previousTransactions) => [
      newTransaction,
      ...previousTransactions,
    ]);
  };

  const editTransaction = (id, updatedTransaction) => {
    setTransactions((previousTransactions) =>
      previousTransactions.map((transaction) =>
        transaction.id === id ? { ...updatedTransaction, id } : transaction,
      ),
    );
  };

  const deleteTransaction = (id) => {
    setTransactions((previousTransactions) =>
      previousTransactions.filter((transaction) => transaction.id !== id),
    );
  };

  const refreshTransactions = () => {
    setTransactions(getTransactionsFromStorage());
  };

  // Wait until AuthContext has verified the stored token
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <Layout
                user={user}
                transactions={transactions}
                addTransaction={addTransaction}
                editTransaction={editTransaction}
                deleteTransaction={deleteTransaction}
                refreshTransactions={refreshTransactions}
              />
            }
          >
            <Route path="/" element={<Dashboard />} />

            <Route
              path="/income"
              element={
                <Income
                  transactions={transactions}
                  addTransaction={addTransaction}
                  editTransaction={editTransaction}
                  deleteTransaction={deleteTransaction}
                  refreshTransactions={refreshTransactions}
                />
              }
            />

            <Route
              path="/expense"
              element={
                <Expense
                  transactions={transactions}
                  addTransaction={addTransaction}
                  editTransaction={editTransaction}
                  deleteTransaction={deleteTransaction}
                  refreshTransactions={refreshTransactions}
                />
              }
            />

            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Fallback route */}
        <Route
          path="*"
          element={<Navigate to={user ? '/' : '/login'} replace />}
        />
      </Routes>
    </>
  );
};

export default App;
