import { router, publicProcedure } from "../trpc";

export const authRouter = router({
  getGoogleUrl: publicProcedure.query(() => {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

    const options = {
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`,
      client_id: process.env.GOOGLE_CLIENT_ID as string, // Agora pode ler direto do server
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/calendar",
      ].join(" "),
    };

    const qs = new URLSearchParams(options);

    // Retorna a URL prontinha
    return `${rootUrl}?${qs.toString()}`;
  }),
});
