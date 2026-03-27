import { InfisicalSDK } from '@infisical/sdk'

let client = null

/**
 * Initialize Infisical SDK using Machine Identity credentials.
 * Called ONCE at server startup before anything else.
 */
export const initInfisical = async () => {
  client = new InfisicalSDK()

  await client.auth().universalAuth.login({
    clientId: process.env.INFISICAL_CLIENT_ID,
    clientSecret: process.env.INFISICAL_CLIENT_SECRET,
  })

  console.log('✅ Infisical authenticated successfully')
}

/**
 * Fetch ALL secrets from Infisical and inject them into process.env.
 * After this runs, all process.env.ANYTHING calls work normally.
 * Environment is determined by NODE_ENV:
 *   development → Infisical "dev" environment
 *   production  → Infisical "prod" environment
 */
export const loadSecrets = async () => {
  const environment = process.env.NODE_ENV === 'production' ? 'prod' : 'dev'

  const { secrets } = await client.secrets().listSecrets({
    environment,
    projectId: process.env.INFISICAL_PROJECT_ID,
    secretPath: '/',
  })

  secrets.forEach((secret) => {
    // Only inject if not already set (so local overrides work in dev if needed)
    if (!process.env[secret.secretKey]) {
      process.env[secret.secretKey] = secret.secretValue
    }
  })

  console.log(`✅ Loaded ${secrets.length} secrets from Infisical [${environment}]`)
}

/**
 * Get a single secret by name (use for one-off lookups).
 * Prefer loadSecrets() at startup for bulk injection.
 */
export const getSecret = async (name) => {
  const environment = process.env.NODE_ENV === 'production' ? 'prod' : 'dev'

  const secret = await client.secrets().getSecretByName(name, {
    environment,
    projectId: process.env.INFISICAL_PROJECT_ID,
    secretPath: '/',
  })

  return secret.secretValue
}
