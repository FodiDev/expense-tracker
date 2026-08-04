import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose
      .connect(process.env.MONGODB_URL)
      .then(() => console.log('DB CONNECTED'));
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};
