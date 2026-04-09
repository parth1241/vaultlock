import NextAuth, { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'client' | 'freelancer';
      linkedWallet?: string;
      avatarColor?: string;
      rememberMe?: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: 'client' | 'freelancer';
    linkedWallet?: string;
    avatarColor?: string;
    rememberMe?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'client' | 'freelancer';
    linkedWallet?: string;
    avatarColor?: string;
    rememberMe?: boolean;
  }
}
