// src/config/amplify.js
import { Amplify } from 'aws-amplify';

const amplifyConfig = {
  Auth: {
    Cognito: {
      region: import.meta.env.VITE_AWS_REGION,
      userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_AWS_USER_POOL_WEB_CLIENT_ID,
      identityPoolId: import.meta.env.VITE_AWS_IDENTITY_POOL_ID,
      signUpVerificationMethod: 'code',
      loginWith: {
        oauth: {
          domain: import.meta.env.VITE_AWS_COGNITO_DOMAIN,
          scopes: ['email', 'profile', 'openid'],
          redirectSignIn: import.meta.env.VITE_APP_URL || 'http://localhost:5174/',
          redirectSignOut: import.meta.env.VITE_APP_URL || 'http://localhost:5174/',
          responseType: 'code',
          providers: ['Google']
        }
      }
    }
  }
};

Amplify.configure(amplifyConfig);

export default amplifyConfig;