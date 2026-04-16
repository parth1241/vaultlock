import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from './db';
import User from './models/User';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        walletAddress: { label: 'Wallet Address', type: 'text' },
        isWalletLogin: { label: 'Is Wallet Login', type: 'text' },
        rememberMe: { label: 'Remember Me', type: 'text' },
      },
      async authorize(credentials) {
        await dbConnect();

        if (!credentials) return null;

        // Wallet-based login
        if (credentials.isWalletLogin === 'true' && credentials.walletAddress) {
          const user = await User.findOne({ linkedWallet: credentials.walletAddress });
          if (!user) {
            throw new Error('No account linked to this wallet');
          }

          user.lastLogin = new Date();
          await user.save();

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            linkedWallet: user.linkedWallet,
            avatarColor: user.avatarColor,
            rememberMe: false,
          };
        }

        // Email/password login
        if (!credentials.email || !credentials.password) return null;

        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error('Invalid email or password');
        }

        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          const lockTime = new Date(user.lockedUntil);
          const hours = lockTime.getHours().toString().padStart(2, '0');
          const minutes = lockTime.getMinutes().toString().padStart(2, '0');
          throw new Error(`Account locked until ${hours}:${minutes}`);
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValid) {
          // Increment failed attempts
          user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

          if (user.failedLoginAttempts >= 5) {
            user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
            await user.save();
            const lockTime = new Date(user.lockedUntil);
            const hours = lockTime.getHours().toString().padStart(2, '0');
            const minutes = lockTime.getMinutes().toString().padStart(2, '0');
            throw new Error(`Account locked until ${hours}:${minutes}`);
          }

          await user.save();
          throw new Error('Invalid email or password');
        }

        // Success: reset failed attempts
        user.failedLoginAttempts = 0;
        user.lockedUntil = null;
        user.lastLogin = new Date();
        await user.save();

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          linkedWallet: user.linkedWallet || '',
          avatarColor: user.avatarColor || '#6366f1',
          rememberMe: credentials.rememberMe === 'true',
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.linkedWallet = user.linkedWallet;
        token.avatarColor = user.avatarColor;
        token.rememberMe = user.rememberMe;
      } else if (trigger === 'update') {
        // Refetch user data from DB to get latest profile changes
        await dbConnect();
        const dbUser = await User.findById(token.id).lean();
        if (dbUser) {
          token.name = dbUser.name;
          token.linkedWallet = dbUser.linkedWallet;
          token.avatarColor = dbUser.avatarColor;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.linkedWallet = token.linkedWallet;
        session.user.avatarColor = token.avatarColor;
        session.user.rememberMe = token.rememberMe;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
