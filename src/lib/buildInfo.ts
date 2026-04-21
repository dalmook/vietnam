export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "0.1.0";
export const BUILD_TIMESTAMP = import.meta.env.VITE_BUILD_TIMESTAMP ?? "unknown-build-time";

export const getLocationSnapshot = () => {
  if (typeof window === "undefined") {
    return {
      href: "",
      pathname: "",
      hash: ""
    };
  }

  return {
    href: window.location.href,
    pathname: window.location.pathname,
    hash: window.location.hash
  };
};
