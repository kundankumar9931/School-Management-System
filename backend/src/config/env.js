import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'production',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://kundankumar182004blue_db_user:Kundan9931@cluster0.z5djftk.mongodb.net/school_management',
  JWT_SECRET: process.env.JWT_SECRET || 'sgzxcygdaedgdtawdatwydfawdawdvstfczsgcvghsvcsgcvsgh',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'https://school-management-system-9ztq.onrender.com',
};
