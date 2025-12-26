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
      className="dir-rtl bg-background text-foreground selection:bg-primary/30 min-h-screen overflow-x-hidden font-sans"
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
          <div className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-none font-mono text-sm font-black">
            A
          </div>
          <div className="flex flex-col text-right">
            <span className="font-arad text-[14px] leading-none font-black tracking-tight uppercase">
              {landing.brandName}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground h-7 w-7 rounded-none"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-3.5 w-3.5" />
            ) : (
              <Moon className="h-3.5 w-3.5" />
            )}
          </Button>
          <Link
            to="/login"
            className="text-muted-foreground hover:text-foreground hidden font-mono text-[10px] tracking-tight uppercase transition-colors md:block"
          >
            {landing.loginButton}
          </Link>
          <Button
            asChild
            variant="outline"
            className="border-border hover:bg-accent h-8 rounded-none px-4 font-mono text-[10px] tracking-tight uppercase shadow-sm transition-all active:scale-95"
          >
            <Link to={isLoggedIn ? "/" : "/login"}>
              {isLoggedIn ? landing.dashboard : landing.getStarted}
            </Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 pt-24 pb-12 text-center">
        <h1 className="animate-in fade-in slide-in-from-bottom-8 font-arad from-foreground via-foreground to-foreground/60 relative mb-6 bg-gradient-to-b bg-clip-text text-5xl font-black tracking-tighter text-transparent delay-200 duration-1000 md:text-7xl">
          {landing.shortBrandName}
        </h1>

        <p className="animate-in fade-in slide-in-from-bottom-8 font-arad text-muted-foreground mb-10 max-w-xl px-4 text-base leading-relaxed font-light delay-300 duration-1000 md:text-lg">
          {landing.heroDescription}
        </p>

        <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col justify-center gap-4 delay-500 duration-1000 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="font-arad bg-primary text-primary-foreground h-12 rounded-none px-8 text-sm font-black tracking-tight shadow-md transition-all hover:brightness-110 active:scale-95"
          >
            <Link to="/login">{landing.ctaButton}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="font-arad border-border text-muted-foreground hover:bg-accent hover:text-foreground h-12 rounded-none px-8 text-sm font-black tracking-tight uppercase transition-all active:scale-95"
          >
            <a href="#features">{landing.featuresButton}</a>
          </Button>
        </div>

        {/* Hero Visual - Dashboard UI Mock */}
        <div className="group animate-in fade-in zoom-in-95 relative mt-20 aspect-[16/10] w-full max-w-4xl delay-700 duration-1000">
          <div className="border-primary/20 absolute -start-4 -top-4 h-12 w-12 border-s border-t"></div>
          <div className="border-primary/20 absolute -end-4 -top-4 h-12 w-12 border-e border-t"></div>
          <div className="border-primary/20 absolute -start-4 -bottom-4 h-12 w-12 border-s border-b"></div>
          <div className="border-primary/20 absolute -end-4 -bottom-4 h-12 w-12 border-e border-b"></div>

          <div className="group/mock border-border/60 bg-card relative flex h-full w-full flex-col overflow-hidden border shadow-xl">
            {/* Mock UI Header */}
            <div className="border-border/40 bg-muted/20 flex h-10 shrink-0 items-center justify-between border-b px-4">
              <div className="flex gap-1.5">
                <div className="bg-muted-foreground/20 h-2.5 w-2.5 rounded-full"></div>
                <div className="bg-muted-foreground/20 h-2.5 w-2.5 rounded-full"></div>
                <div className="bg-muted-foreground/20 h-2.5 w-2.5 rounded-full"></div>
              </div>
              <div className="text-muted-foreground flex items-center gap-4 text-xs font-bold">
                <span>{landing.mockUi.projectManagementSystem}</span>
              </div>
            </div>

            <div className="grid flex-1 grid-cols-12 overflow-hidden">
              {/* Sidebar Mock */}
              <div className="border-border/40 bg-muted/10 col-span-3 space-y-4 border-e p-6">
                <div className="space-y-3">
                  <div className="bg-muted/40 h-2 w-full"></div>
                  <div className="bg-muted/20 h-2 w-3/4"></div>
                  <div className="bg-muted/20 h-2 w-5/6"></div>
                </div>
                <div className="space-y-3 pt-6">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div
                      key={`sidebar-item-${item}`}
                      className="bg-muted/20 flex h-6 w-full items-center justify-end px-2"
                    >
                      <div className="bg-muted-foreground/20 h-1.5 w-12"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Content Mock */}
              <div className="relative col-span-9 space-y-8 overflow-hidden p-8 text-right">
                <div className="flex flex-row-reverse items-center justify-between">
                  <div className="space-y-2">
                    <div className="bg-muted/40 h-8 w-56"></div>
                    <div className="bg-muted/20 h-2 w-36"></div>
                  </div>
                  <div className="bg-primary/10 h-8 w-24"></div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-muted/5 border-border/40 flex h-24 flex-col justify-between border p-4"
                    >
                      <div className="bg-muted/20 h-2 w-12"></div>
                      <div className="bg-muted/40 ms-auto h-6 w-16"></div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-muted/5 flex h-12 w-full flex-row-reverse items-center justify-between border border-transparent px-4"
                    >
                      <div className="flex flex-row-reverse items-center gap-4">
                        <div className="bg-muted/20 h-4 w-4"></div>
                        <div className="bg-muted/40 h-4 w-48"></div>
                      </div>
                      <div className="bg-muted/20 h-3 w-16"></div>
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
                <span className="font-arad text-muted-foreground text-xs leading-none font-bold uppercase">
                  {metric.label}
                </span>
                {metric.icon}
              </div>
              <div className="flex flex-row-reverse items-baseline gap-2">
                <span className="font-arad text-foreground group-hover:text-primary text-4xl font-black transition-all duration-500">
                  {metric.value}
                </span>
                <span className="text-muted-foreground font-mono text-[10px] font-bold tracking-tight uppercase">
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
            <h2 className="font-arad text-foreground text-4xl leading-[1.1] font-black tracking-tighter uppercase md:text-6xl">
              {landing.featuresTitle}
            </h2>
          </div>
          <p className="font-arad border-primary text-muted-foreground max-w-xs border-e pe-6 text-right text-sm leading-relaxed font-light">
            {landing.featuresSubtitle}
          </p>
        </div>

        <div className="border-border/60 grid grid-cols-1 gap-0 border md:grid-cols-3">
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
              className="group border-border/40 hover:bg-primary/[0.03] relative overflow-hidden border p-12 text-right transition-all duration-700"
            >
              <div className="border-border/60 bg-muted text-muted-foreground group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground mb-8 flex h-12 w-12 items-center justify-center border shadow-sm transition-all duration-500">
                {feature.icon}
              </div>
              <h3 className="font-arad text-foreground mb-4 text-xl leading-none font-black tracking-tight uppercase">
                {feature.title}
              </h3>
              <p className="font-arad text-muted-foreground group-hover:text-foreground/80 text-sm leading-relaxed font-light transition-colors">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative z-10 px-6 py-24">
        <div className="group relative mx-auto max-w-5xl overflow-hidden bg-[#0047AB] p-16 text-center shadow-2xl md:p-28">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:30px_30px] opacity-10"></div>
          <div className="absolute inset-0 bg-black/10 mix-blend-multiply"></div>

          <div className="relative z-10">
            <h2 className="font-arad mb-8 text-5xl leading-[0.9] font-black tracking-tighter text-white uppercase md:text-7xl">
              {landing.ctaTitle}
            </h2>
            <p className="font-arad mx-auto mb-12 max-w-lg text-base leading-relaxed font-light text-blue-50/90">
              {landing.ctaDescription}
            </p>
            <div className="flex flex-col justify-center gap-6 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="font-arad h-14 rounded-none border-none bg-white px-10 text-base font-black tracking-tight text-black uppercase shadow-lg transition-all hover:bg-zinc-100 active:scale-95"
              >
                <Link to="/login">{landing.quickStart}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="font-arad h-14 rounded-none border border-white/40 bg-transparent px-10 text-base font-black tracking-tight text-white uppercase transition-all hover:bg-white/10 active:scale-95"
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
            <div className="border-border/60 bg-muted text-muted-foreground flex h-10 w-10 items-center justify-center rounded-none border font-mono text-xl font-black tracking-tighter shadow-sm">
              A
            </div>
            <div className="flex flex-col text-right">
              <span className="font-arad text-foreground/80 mb-1 text-sm leading-none font-black tracking-tight uppercase">
                {landing.brandName}
              </span>
              <span className="text-muted-foreground font-mono text-[10px] leading-none font-bold tracking-tight uppercase">
                © {digitsEnToFa(new Date().getFullYear())}{" "}
                {landing.footer.allRightsReserved}
              </span>
            </div>
          </div>

          <div className="font-arad text-muted-foreground flex flex-wrap justify-center gap-x-10 gap-y-4 font-mono text-xs font-bold tracking-tight uppercase">
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
