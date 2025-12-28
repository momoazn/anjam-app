import {
  BarChart3,
  Clock,
  Cpu,
  Layers,
  Moon,
  ShieldCheck,
  Sun,
  Users,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { useAuthIsLoggedIn } from "@/store/auth-store";
import { useTheme } from "@/hooks/use-theme";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { landing } from "@/constants";

const LandingPage = () => {
  const isLoggedIn = useAuthIsLoggedIn();
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <div
      className="dir-rtl bg-background text-foreground selection:bg-primary/30 overscroll-behavior-none h-svh overflow-x-hidden overflow-y-auto font-sans"
      dir="rtl"
    >
      {/* Background Grid */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.15] dark:opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,oklch(0.45_0.12_250/0.15),transparent)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(var(--color-foreground)_1px,transparent_1px)] bg-[size:20px_20px] opacity-5"></div>
      </div>

      {/* Navigation */}
      <nav className="border-border/40 bg-background/40 relative z-20 mx-auto flex max-w-7xl items-center justify-between border-b px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Logo size={28} />
          <div className="flex flex-col text-right">
            <span className="font-arad text-[14px] leading-none font-bold tracking-tight">
              {landing.brandName}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground h-8 w-8 rounded-full"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Link
            to="/login"
            className="text-muted-foreground hover:text-foreground hidden text-xs font-medium transition-colors md:block"
          >
            {landing.loginButton}
          </Link>
          <Button
            asChild
            variant="outline"
            className="border-border hover:bg-accent h-9 rounded-xl px-5 text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            <Link to={isLoggedIn ? "/dashboard" : "/login"}>
              {isLoggedIn ? landing.dashboard : landing.getStarted}
            </Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 pt-24 pb-12 text-center">
        <h1 className="animate-in fade-in slide-in-from-bottom-8 from-foreground via-foreground to-foreground/60 relative mb-6 bg-gradient-to-b bg-clip-text text-5xl font-bold tracking-tight text-transparent delay-200 duration-1000 md:text-7xl">
          {landing.shortBrandName}
        </h1>

        <p className="animate-in fade-in slide-in-from-bottom-8 text-muted-foreground mb-10 max-w-xl px-4 text-base leading-relaxed font-medium delay-300 duration-1000 md:text-lg">
          {landing.heroDescription}
        </p>

        <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col justify-center gap-4 delay-500 duration-1000 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground h-12 rounded-xl px-8 text-sm font-bold shadow-md transition-all hover:brightness-110 active:scale-95"
          >
            <Link to="/login">{landing.ctaButton}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-border text-muted-foreground hover:bg-accent hover:text-foreground h-12 rounded-xl px-8 text-sm font-bold transition-all active:scale-95"
          >
            <a href="#features">{landing.featuresButton}</a>
          </Button>
        </div>

        {/* Hero Visual - Dashboard UI Mock */}
        <div className="group animate-in fade-in zoom-in-95 relative mt-20 aspect-[16/10] w-full max-w-4xl delay-700 duration-1000">
          <div className="bg-card relative flex h-full w-full flex-col overflow-hidden rounded-2xl border shadow-2xl">
            {/* Mock UI Header */}
            <div className="border-border/40 bg-muted/20 flex h-12 shrink-0 items-center justify-between border-b px-6">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/20"></div>
                <div className="h-3 w-3 rounded-full bg-amber-500/20"></div>
                <div className="h-3 w-3 rounded-full bg-emerald-500/20"></div>
              </div>
              <div className="text-muted-foreground flex items-center gap-4 text-xs font-bold">
                <span>{landing.mockUi.projectManagementSystem}</span>
              </div>
            </div>

            <div className="grid flex-1 grid-cols-12 overflow-hidden">
              {/* Sidebar Mock */}
              <div className="border-border/40 bg-muted/5 col-span-3 space-y-6 border-e p-6">
                <div className="space-y-3">
                  <div className="bg-muted/40 h-2.5 w-full rounded-full"></div>
                  <div className="bg-muted/20 h-2.5 w-3/4 rounded-full"></div>
                  <div className="bg-muted/20 h-2.5 w-5/6 rounded-full"></div>
                </div>
                <div className="space-y-4 pt-6">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div
                      key={`sidebar-item-${item}`}
                      className="bg-muted/10 flex h-8 w-full items-center justify-end rounded-lg px-3"
                    >
                      <div className="bg-muted-foreground/20 h-2 w-16 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Content Mock */}
              <div className="relative col-span-9 space-y-8 overflow-hidden p-8 text-right">
                <div className="flex flex-row-reverse items-center justify-between">
                  <div className="space-y-2">
                    <div className="bg-muted/40 h-10 w-64 rounded-lg"></div>
                    <div className="bg-muted/20 h-3 w-40 rounded-full"></div>
                  </div>
                  <div className="bg-primary/10 h-10 w-28 rounded-lg"></div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-muted/5 border-border/40 flex h-28 flex-col justify-between rounded-xl border p-5"
                    >
                      <div className="bg-muted/20 h-2.5 w-14 rounded-full"></div>
                      <div className="bg-muted/40 ms-auto h-8 w-20 rounded-lg"></div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-muted/5 flex h-14 w-full flex-row-reverse items-center justify-between rounded-xl border border-transparent px-5"
                    >
                      <div className="flex flex-row-reverse items-center gap-4">
                        <div className="bg-muted/20 h-5 w-5 rounded-md"></div>
                        <div className="bg-muted/40 h-5 w-56 rounded-lg"></div>
                      </div>
                      <div className="bg-muted/20 h-4 w-20 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="from-card pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent to-transparent"></div>
          </div>
        </div>
      </header>

      {/* Metric Activity */}
      <section className="border-border/40 bg-muted/30 relative z-10 border-y px-6 py-16 backdrop-blur-2xl">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 md:grid-cols-4 md:gap-4">
          {[
            {
              label: landing.metrics.finalTransactions,
              value: digitsEnToFa("۸۵,۴۲۰"),
              suffix: "LOGS",
              icon: <BarChart3 className="text-primary h-4 w-4" />,
              id: "metric-1",
            },
            {
              label: landing.metrics.avgTaskDelivery,
              value: digitsEnToFa("۴.۲"),
              suffix: "DAYS",
              icon: (
                <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
              ),
              id: "metric-2",
            },
            {
              label: landing.metrics.activeProjects,
              value: digitsEnToFa("۱۲۴"),
              suffix: "UNITS",
              icon: (
                <Layers className="h-4 w-4 text-orange-600 dark:text-orange-500" />
              ),
              id: "metric-3",
            },
            {
              label: landing.metrics.verifiedUsers,
              value: digitsEnToFa("۴۸۲"),
              suffix: "ACTIVE_USERS",
              icon: (
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-500" />
              ),
              id: "metric-4",
            },
          ].map((metric) => (
            <div
              key={metric.id}
              className="group border-border/40 hover:border-primary/50 flex flex-col gap-4 border-e pe-6 text-right transition-colors duration-500 last:border-none"
            >
              <div className="flex items-center justify-end gap-2">
                <span className="text-muted-foreground text-xs font-bold">
                  {metric.label}
                </span>
                {metric.icon}
              </div>
              <div className="flex flex-row-reverse items-baseline gap-2">
                <span className="text-foreground group-hover:text-primary text-4xl font-bold transition-all duration-500">
                  {metric.value}
                </span>
                <span className="text-muted-foreground font-mono text-[10px] font-bold tracking-tight">
                  {metric.suffix}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section
        id="features"
        className="relative z-10 mx-auto max-w-7xl px-6 py-24"
      >
        <div className="mb-20 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl text-right">
            <h2 className="text-foreground text-4xl font-bold tracking-tight md:text-6xl">
              {landing.featuresTitle}
            </h2>
          </div>
          <p className="text-muted-foreground border-primary max-w-xs border-e pe-6 text-right text-sm leading-relaxed font-medium">
            {landing.featuresSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              icon: <Layers className="h-5 w-5" />,
              title: landing.features.integratedManagement.title,
              desc: landing.features.integratedManagement.description,
              id: "feature-1",
            },
            {
              icon: <Cpu className="h-5 w-5" />,
              title: landing.features.smartAutomation.title,
              desc: landing.features.smartAutomation.description,
              id: "feature-2",
            },
            {
              icon: <ShieldCheck className="h-5 w-5" />,
              title: landing.features.centralizedSecurity.title,
              desc: landing.features.centralizedSecurity.description,
              id: "feature-3",
            },
            {
              icon: <Zap className="h-5 w-5" />,
              title: landing.features.instantSync.title,
              desc: landing.features.instantSync.description,
              id: "feature-4",
            },
            {
              icon: <BarChart3 className="h-5 w-5" />,
              title: landing.features.analyticalReporting.title,
              desc: landing.features.analyticalReporting.description,
              id: "feature-5",
            },
            {
              icon: <Users className="h-5 w-5" />,
              title: landing.features.teamCollaboration.title,
              desc: landing.features.teamCollaboration.description,
              id: "feature-6",
            },
          ].map((feature) => (
            <div
              key={feature.id}
              className="group bg-card hover:bg-primary/[0.02] relative overflow-hidden rounded-2xl border p-10 text-right transition-all duration-500"
            >
              <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground mb-8 flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-500">
                {feature.icon}
              </div>
              <h3 className="text-foreground mb-4 text-xl font-bold tracking-tight">
                {feature.title}
              </h3>
              <p className="text-muted-foreground group-hover:text-foreground/80 text-sm leading-relaxed font-medium transition-colors">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative z-10 px-6 py-24">
        <div className="group bg-primary relative mx-auto max-w-5xl overflow-hidden rounded-3xl p-16 text-center shadow-2xl md:p-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.03]"></div>

          <div className="relative z-10">
            <h2 className="mb-8 text-5xl font-bold tracking-tight text-white md:text-7xl">
              {landing.ctaTitle}
            </h2>
            <p className="text-primary-foreground/80 mx-auto mb-12 max-w-lg text-base leading-relaxed font-medium">
              {landing.ctaDescription}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="text-primary h-14 rounded-xl border-none bg-white px-10 text-base font-bold shadow-lg transition-all hover:bg-zinc-100 active:scale-95"
              >
                <Link to="/login">{landing.quickStart}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 rounded-xl border-white/20 bg-white/10 px-10 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95"
              >
                <a href="mailto:support@anjam.ir">
                  {landing.requestConsultation}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-border/40 bg-card relative z-10 border-t px-6 py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 md:flex-row">
          <div className="flex items-center gap-5">
            <Logo size={40} />
            <div className="flex flex-col text-right">
              <span className="text-foreground/80 mb-1 text-sm font-bold tracking-tight">
                {landing.brandName}
              </span>
              <span className="text-muted-foreground text-[10px] font-bold tracking-tight">
                © {digitsEnToFa(new Date().getFullYear())}{" "}
                {landing.footer.allRightsReserved}
              </span>
            </div>
          </div>

          <div className="text-muted-foreground flex flex-wrap justify-center gap-x-10 gap-y-4 text-xs font-bold tracking-tight">
            <span className="hover:text-primary cursor-pointer transition-colors">
              {landing.footer.documentation}
            </span>
            <span className="hover:text-primary cursor-pointer transition-colors">
              {landing.footer.security}
            </span>
            <span className="hover:text-primary cursor-pointer transition-colors">
              {landing.footer.terms}
            </span>
            <span className="hover:text-primary cursor-pointer transition-colors">
              {landing.footer.systemStatus}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
