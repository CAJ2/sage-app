export default (): Record<string, unknown> => ({
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET,
    },
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  port: parseInt(process.env.PORT ?? '4444', 10),
  posthog: {
    apiKey: process.env.POSTHOG_API_KEY,
  },
  windmill: {
    baseUrl: process.env.WINDMILL_BASE_URL,
    token: process.env.WINDMILL_TOKEN,
    workspace: process.env.WINDMILL_WORKSPACE,
  },
})
