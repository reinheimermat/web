'use client'

import { env } from '@/env'

interface FbLoginCallbackResponse {
  authResponse: {
    code: string
  }
}

export function FacebookSignupButton() {
  const fbLoginCallback = (response: FbLoginCallbackResponse) => {
    if (response.authResponse) {
      const code = response.authResponse.code
      // The returned code must be transmitted to your backend first and then
      // perform a server-to-server call from there to our servers for an access token.
    }
  }

  const handleLogin = () => {
    // @ts-expect-error
    FB.login(fbLoginCallback, {
      config_id: env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID,
      response_type: 'code',
      override_default_response_type: true,
      extras: { version: 'v3' }
    })
  }

  return (
    <button
      type="button"
      onClick={handleLogin}
      className="rounded bg-blue-600 px-4 py-2 text-white"
    >
      Conectar com Facebook
    </button>
  )
}
