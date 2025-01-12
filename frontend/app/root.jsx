// Root Component
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import styles from "./styles/tailwind.css";

export const meta = () => {
  return {
    charset: "utf-8",
    title: "Contextual X(Twitter) Reply Creator",
    viewport: "width=device-width,initial-scale=1",
  };
};

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function Root() {
  return (
    <html lang="en" className="h-full bg-gray-100">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen flex flex-col">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
