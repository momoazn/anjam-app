import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
// import Resend from "@auth/core/providers/resend";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password,
    // Resend({
    //   apiKey: process.env.RESEND_API_KEY,
    //   from: process.env.AUTH_RESEND_FROM,
    // }),
  ],
});
