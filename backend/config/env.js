const requiredEnvVariables = ['MONGODB_URL', 'JWT_SECRET'];

export function validateEnv() {
  const missingVariables = requiredEnvVariables.filter(
    (variable) => !process.env[variable],
  );

  if (missingVariables.length > 0) {
    console.error(
      `Missing required environment variables: ${missingVariables.join(', ')}`,
    );

    process.exit(1);
  }
}
