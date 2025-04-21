import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';

//google provider
import GoogleProvider from 'next-auth/providers/google';

export default NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // GoogleProvider clientId and clientSecret are obtained from https://console.cloud.google.com/apis/credentials

  ],
  callbacks: {
    async session(session, user) {
      session.userId = user.id;
      return session;
    },
  },
});