import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  findUserByEmail,
  getSafeAttributes,
  verifyPassword,
} from "../../../models/user";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { username, password } = credentials;
        console.log("Credentials received: ", credentials); // Log the credentials for debugging

        const user = await findUserByEmail(username);
        if (!user) {
          console.log("No user found with email: ", username); // Log if user is not found
          throw new Error("Invalid email or password");
        }

        const passwordVerified = await verifyPassword(
          user.hashedPassword,
          password,
        );
        if (!passwordVerified) {
          console.log("Invalid password for user: ", username); // Log if password is incorrect
          throw new Error("Invalid email or password");
        }

        console.log("User authenticated: ", user); // Log the authenticated user
        return getSafeAttributes(user);
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
});
