"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: {
      init: (params: {
        appId: string;
        autoLogAppEvents: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      // Add other FB methods as needed
      login: (callback: (response: any) => void, options?: any) => void;
    };
  }
}

const FacebookSDKLoader = () => {
  useEffect(() => {
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: "1707142250734460",
        autoLogAppEvents: true,
        xfbml: true,
        version: "v24.0",
      });
    };

    ((d, s, id) => {
      const fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      const js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode?.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  }, []);

  return null;
};

export default function MetaPage() {
  const onLoginClick = () => {
    window.FB.login((response) => {
      if (response.status === "connected") {
        console.log("Logged in:", response);
      } else {
        console.log("Login failed:", response);
      }
    });
  };

  return (
    <div>
      <FacebookSDKLoader />
      <button type="button" onClick={onLoginClick}>
        Login with Facebook
      </button>
    </div>
  );
}
