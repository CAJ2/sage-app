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
})
