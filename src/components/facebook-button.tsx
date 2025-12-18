'use client'

export function FacebookSignupButton() {
  const handleLogin = () => {
    // @ts-expect-error
    FB.login(
      (response: { authResponse: { accessToken: string } }) => {
        if (response.authResponse) {
          const { accessToken } = response.authResponse

          fetch('/api/auth/facebook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken })
          })
        }
      },
      {
        scope: 'public_profile,email,business_management'
      }
    )
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
