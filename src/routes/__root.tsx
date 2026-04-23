import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Arabify — Adaptive HLR Learning" },
      { name: "description", content: "Master Arabic vocabulary with a personalized Memory Engine. Powered by Half-Life Regression (HLR) to optimize your recall and stability tiers." },
      { name: "author", content: "Memory Engine" },
      { property: "og:title", content: "Arabify — Adaptive HLR Learning" },
      { property: "og:description", content: "Master Arabic vocabulary with a personalized Memory Engine. Powered by Half-Life Regression (HLR) to optimize your recall and stability tiers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Arabify — Adaptive HLR Learning" },
      { name: "twitter:description", content: "Master Arabic vocabulary with a personalized Memory Engine. Powered by Half-Life Regression (HLR) to optimize your recall and stability tiers." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/8a4c6356-8aa1-4dba-8d31-7be6a51d31ce/id-preview-965ae31d--a97f1949-244c-4215-ab78-ae8b88e3af37.lovable.app-1776924646987.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/8a4c6356-8aa1-4dba-8d31-7be6a51d31ce/id-preview-965ae31d--a97f1949-244c-4215-ab78-ae8b88e3af37.lovable.app-1776924646987.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@500;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
