import { APP_VERSION, BUILD_TIMESTAMP, getLocationSnapshot } from "../lib/buildInfo";

export function BuildInfoCard() {
  const location = getLocationSnapshot();
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 140) : "";

  return (
    <section className="rounded-[24px] border border-ocean/25 bg-white p-4 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ocean">Build Info</p>
      <ul className="mt-2 space-y-1 text-xs text-ink/75">
        <li>version: {APP_VERSION}</li>
        <li>build timestamp: {BUILD_TIMESTAMP}</li>
        <li>href: {location.href}</li>
        <li>pathname: {location.pathname}</li>
        <li>hash: {location.hash || "(empty)"}</li>
        <li>base url: {import.meta.env.BASE_URL}</li>
        <li>ua: {userAgent}</li>
      </ul>
    </section>
  );
}
