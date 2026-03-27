import { InfisicalSDK } from '@infisical/sdk'

let client = null

export const initInfisical = async () => {
  client = new InfisicalSDK()
  await client.auth().universalAuth.login({
    clientId: process.env.INFISICAL_CLIENT_ID,
    clientSecret: process.env.INFISICAL_CLIENT_SECRET,
  })
  console.log('✅ Infisical authenticated')
}

export const loadSecrets = async () => {
  const environment = process.env.NODE_ENV === 'production' ? 'prod' : 'dev'
  const { secrets } = await client.secrets().listSecrets({
    environment,
    projectId: process.env.INFISICAL_PROJECT_ID,
    secretPath: '/',
  })
  secrets.forEach((s) => {
    if (!process.env[s.secretKey]) {
      process.env[s.secretKey] = s.secretValue
    }
  })
  console.log(`✅ Loaded ${secrets.length} secrets from Infisical [${environment}]`)
}