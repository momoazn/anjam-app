import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconBell,
  IconBolt,
  IconBrandGithub,
  IconChartBar,
  IconFilter,
  IconLayoutKanban,
  IconMessages,
  IconMoon,
  IconShieldCheck,
  IconSun,
  IconUsersGroup,
} from "@tabler/icons-react";
import type { ComponentType } from "react";
import { Link } from "react-router-dom";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { app, landing } from "@/constants";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { useAuthIsAuthenticated } from "@/store/app-context-store";

const featureIcons: Record<
  (typeof landing.features)[number]["id"],
  ComponentType<{ className?: string }>
> = {
  realtime: IconBolt,
  organizations: IconUsersGroup,
  roles: IconShieldCheck,
  views: IconLayoutKanban,
  comments: IconMessages,
  inbox: IconBell,
  filters: IconFilter,
  insights: IconChartBar,
};

// Static illustration only. Titles and IDs are sample text, not real data.
type MockCard = { id: string; title: string; tag?: string; urgent?: boolean };
type MockColumn = {
  key: string;
  title: string;
  dot: string;
  cards: MockCard[];
};

const mockColumns: MockColumn[] = [
  {
    key: "todo",
    title: landing.mockUi.columns.todo,
    dot: "bg-muted-foreground/50",
    cards: [
      { id: "ANJ-14", title: "نوشتن مستندات راه‌اندازی", tag: "مستندات" },
      { id: "ANJ-15", title: "بازبینی طراحی صفحه ورود" },
    ],
  },
  {
    key: "progress",
    title: landing.mockUi.columns.inProgress,
    dot: "bg-amber-500",
    cards: [
      {
        id: "ANJ-11",
        title: "اتصال اعلان‌ها به صندوق ورودی",
        tag: "فوری",
        urgent: true,
      },
      { id: "ANJ-12", title: "نمایش مهلت‌ها در تقویم شمسی" },
    ],
  },
  {
    key: "done",
    title: landing.mockUi.columns.done,
    dot: "bg-emerald-500",
    cards: [
      { id: "ANJ-9", title: "ساخت لینک دعوت اعضا" },
      { id: "ANJ-8", title: "جدا کردن داده‌های سازمان‌ها" },
    ],
  },
];

function BoardMockup() {
  return (
    <div
      role="img"
      aria-label="نمونه‌ای از بورد تسک‌ها با سه ستون"
      className="bg-card w-full overflow-hidden rounded-2xl border shadow-2xl"
    >
      <div
        aria-hidden="true"
        className="border-border/40 bg-muted/30 flex h-11 items-center justify-between border-b px-4 sm:px-6"
      >
        <div className="flex gap-1.5" dir="ltr">
          <span className="size-2.5 rounded-full bg-rose-500/40" />
          <span className="size-2.5 rounded-full bg-amber-500/40" />
          <span className="size-2.5 rounded-full bg-emerald-500/40" />
        </div>
        <span className="text-muted-foreground text-xs font-bold">
          {landing.shortBrandName}
        </span>
      </div>

      <div
        aria-hidden="true"
        className="bg-muted/10 grid grid-cols-3 gap-2 p-3 text-start sm:gap-4 sm:p-6"
      >
        {mockColumns.map((column) => (
          <div key={column.key} className="min-w-0 space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className={cn("size-2 rounded-full", column.dot)} />
              <span className="truncate text-[11px] font-bold sm:text-xs">
                {column.title}
              </span>
            </div>
            {column.cards.map((card) => (
              <div
                key={card.id}
                className="bg-card space-y-2 rounded-lg border p-2 shadow-xs sm:space-y-3 sm:p-3"
              >
                <p className="text-[11px] leading-5 font-medium sm:text-sm">
                  {card.title}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span
                    dir="ltr"
                    className="text-muted-foreground font-mono text-[10px]"
                  >
                    {card.id}
                  </span>
                  {card.tag && (
                    <span
                      className={cn(
                        "hidden rounded-full px-2 py-0.5 text-[10px] font-bold sm:inline",
                        card.urgent
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : "bg-primary/10 text-primary",
                      )}
                    >
                      {card.tag}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const LandingPage = () => {
  const isLoggedIn = useAuthIsAuthenticated();
  const { resolvedTheme, toggleTheme } = useTheme();
  const year = digitsEnToFa(new Date().getFullYear());

  return (
    <div
      className="dir-rtl bg-background text-foreground selection:bg-primary/30 overscroll-behavior-none h-svh overflow-x-hidden overflow-y-auto scroll-smooth font-sans"
      dir="rtl"
    >
      {/* Background Grid */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.15] dark:opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,oklch(0.45_0.12_250/0.15),transparent)]"></div>
      </div>

      {/* Navigation */}
      <nav className="border-border/40 bg-background/40 relative z-20 mx-auto flex max-w-7xl items-center justify-between border-b px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-3">
          <Logo size={40} />
          <span className="font-arad text-sm leading-none font-bold tracking-tight">
            {landing.brandName}
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-5">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={resolvedTheme === "dark" ? "تم روشن" : "تم تاریک"}
            className="text-muted-foreground hover:text-foreground h-8 w-8 rounded-full"
          >
            {resolvedTheme === "dark" ? (
              <IconSun className="size-4" />
            ) : (
              <IconMoon className="size-4" />
            )}
          </Button>
          <Link
            to="/login"
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-sm text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            {landing.loginButton}
          </Link>
          <Button asChild variant="outline" size="xs">
            <Link to={isLoggedIn ? "/inbox" : "/register"}>
              {isLoggedIn ? landing.dashboard : landing.getStarted}
            </Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 pt-16 pb-12 text-center sm:px-6 md:pt-24">
        <h1 className="hero-title from-foreground via-foreground to-foreground/60 relative mb-6 bg-linear-to-b bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-7xl">
          {landing.shortBrandName}
        </h1>

        <p className="hero-description text-muted-foreground mb-10 max-w-xl px-4 text-base leading-loose font-medium md:text-lg">
          {landing.heroDescription}
        </p>

        <div className="hero-buttons flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/register">{landing.ctaButton}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="#features">{landing.featuresButton}</a>
          </Button>
        </div>

        <div className="hero-visual relative mt-16 w-full max-w-4xl md:mt-20">
          <BoardMockup />
        </div>
      </header>

      {/* Features Grid */}
      <section
        id="features"
        className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24"
      >
        <div className="mb-12 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end">
          <h2 className="text-foreground max-w-2xl text-3xl font-bold tracking-tight md:text-5xl">
            {landing.featuresTitle}
          </h2>
          <p className="text-muted-foreground border-primary max-w-sm border-s-2 ps-4 text-sm leading-loose font-medium">
            {landing.featuresSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {landing.features.map((feature) => {
            const Icon = featureIcons[feature.id];
            return (
              <div
                key={feature.id}
                className="group bg-card hover:border-primary/40 rounded-2xl border p-6 transition-[border-color,transform] duration-300 ease-out hover:-translate-y-0.5"
              >
                <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground mb-5 flex size-11 items-center justify-center rounded-xl transition-[background-color,color] duration-300 ease-out">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-foreground mb-2 text-base font-bold tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative z-10 px-4 py-16 sm:px-6 md:py-24">
        <div className="bg-primary relative mx-auto max-w-5xl overflow-hidden rounded-3xl p-10 text-center shadow-2xl md:p-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]"></div>

          <div className="relative z-10">
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-white md:text-5xl">
              {landing.ctaTitle}
            </h2>
            <p className="text-primary-foreground/80 mx-auto mb-10 max-w-lg text-base leading-loose font-medium">
              {landing.ctaDescription}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="text-primary bg-white">
                <Link to="/register">{landing.quickStart}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              >
                <a href={app.repoUrl} target="_blank" rel="noreferrer">
                  <IconBrandGithub className="size-4" />
                  {landing.sourceCode}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-border/40 bg-card relative z-10 border-t px-4 py-12 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-4">
            <Logo size={40} />
            <div className="flex flex-col">
              <span className="text-foreground/80 mb-1 text-sm font-bold tracking-tight">
                {landing.brandName}
              </span>
              <span className="text-muted-foreground text-xs">
                © {year} {landing.footer.allRightsReserved}
              </span>
            </div>
          </div>

          <div className="text-muted-foreground flex flex-wrap justify-center gap-x-8 gap-y-3 text-xs font-bold">
            {[
              { to: "/login", label: landing.footer.login },
              { to: "/register", label: landing.footer.register },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="hover:text-primary focus-visible:ring-ring rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={app.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary focus-visible:ring-ring rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              {landing.footer.sourceCode}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
