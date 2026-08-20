export function validateTransaction({ description, amount, category, date }) {
  const errors = [];

  // Description validation
  if (typeof description !== 'string' || description.trim().length === 0) {
    errors.push('Description is required.');
  }

  // Amount validation
  const numericAmount = Number(amount);

  if (
    amount === undefined ||
    amount === null ||
    amount === '' ||
    !Number.isFinite(numericAmount) ||
    numericAmount <= 0
  ) {
    errors.push('Amount must be a number greater than 0.');
  }

  // Category validation
  if (typeof category !== 'string' || category.trim().length === 0) {
    errors.push('Category is required.');
  }

  // Date validation
  if (!date || Number.isNaN(new Date(date).getTime())) {
    errors.push('A valid date is required.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
