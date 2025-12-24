import {
  BarChart3,
  Clock,
  Cpu,
  Layers,
  Moon,
  ShieldCheck,
  Sun,
  Terminal,
  Users,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuthIsLoggedIn } from "@/store/auth-store";
import { useTheme } from "@/hooks/use-theme";
import { digitsEnToFa } from "@persian-tools/persian-tools";

const LandingPage = () => {
  const isLoggedIn = useAuthIsLoggedIn();
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <div
      className="dir-rtl bg-background text-foreground selection:bg-primary/30 min-h-screen overflow-x-hidden font-sans"
      dir="rtl"
    >
      {/* Technical Grid Background */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.15] dark:opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,oklch(0.45_0.12_250/0.15),transparent)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(var(--color-foreground)_1px,transparent_1px)] bg-[size:20px_20px] opacity-5"></div>
      </div>

      {/* Navigation */}
      <nav className="border-border/40 bg-background/40 relative z-20 mx-auto flex max-w-7xl items-center justify-between border-b px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-none font-mono text-sm font-black shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
            A
          </div>
          <div className="flex flex-col text-right">
            <span className="font-vazirmatn text-[12px] leading-none font-black tracking-tight uppercase">
              سـامـانـه انـجـام
            </span>
            <span className="text-muted-foreground font-mono text-[7px] tracking-[0.2em] uppercase">
              REGISTRY_V2
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
            className="text-muted-foreground hover:text-foreground hidden font-mono text-[8px] tracking-[0.3em] uppercase transition-colors md:block"
          >
            AUTH_GATE
          </Link>
          <Button
            asChild
            variant="outline"
            className="border-border hover:bg-accent h-8 rounded-none px-4 font-mono text-[8px] tracking-widest uppercase shadow-[1px_1px_0px_rgba(0,0,0,0.05)] transition-all active:scale-95"
          >
            <Link to={isLoggedIn ? "/" : "/login"}>
              {isLoggedIn ? "CONSOLE" : "INITIALIZE"}
            </Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 pt-20 pb-12 text-center">
        <div className="animate-in fade-in slide-in-from-bottom-4 border-primary/20 bg-primary/5 text-primary mb-6 inline-flex items-center gap-2 border px-2.5 py-1 font-mono text-[7px] tracking-[0.4em] uppercase duration-700">
          <Terminal className="h-2.5 w-2.5" />
          STATE: OPERATIONAL
        </div>

        <h1 className="animate-in fade-in slide-in-from-bottom-8 font-vazirmatn from-foreground via-foreground to-foreground/60 relative mb-4 bg-gradient-to-b bg-clip-text text-5xl font-black tracking-tighter text-transparent delay-200 duration-1000 md:text-7xl">
          انجام
          <span className="text-primary/40 pointer-events-none absolute -top-2 -right-6 hidden font-mono text-[8px] tracking-[0.6em] uppercase md:block">
            V2.0
          </span>
        </h1>

        <p className="animate-in fade-in slide-in-from-bottom-8 font-vazirmatn text-muted-foreground mb-8 max-w-xl px-4 text-sm leading-relaxed font-light delay-300 duration-1000 md:text-base">
          اقتدار در مدیریت، دقت در اجرا. ابزاری مهندسی‌شده برای تیم‌هایی که
          خواستار انضباط صنعتی و شفافیت مطلق در پروژه‌های پیچیده هستند.
        </p>

        <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col justify-center gap-4 delay-500 duration-1000 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="font-vazirmatn bg-primary text-primary-foreground h-11 rounded-none px-6 text-sm font-black tracking-widest shadow-[3px_3px_0px_rgba(0,0,0,0.1)] transition-all hover:brightness-110 active:scale-95"
          >
            <Link to="/login">ورود به پروتکل</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="font-vazirmatn border-border text-muted-foreground hover:bg-accent hover:text-foreground h-11 rounded-none px-6 text-sm font-black tracking-widest uppercase transition-all active:scale-95"
          >
            <a href="#features">بررسی قابلیت‌ها</a>
          </Button>
        </div>

        {/* Hero Visual - Registry UI Mock */}
        <div className="group animate-in fade-in zoom-in-95 relative mt-16 aspect-[16/10] w-full max-w-4xl delay-700 duration-1000">
          <div className="border-primary/20 absolute -top-4 -left-4 h-12 w-12 border-t border-l"></div>
          <div className="border-primary/20 absolute -top-4 -right-4 h-12 w-12 border-t border-r"></div>
          <div className="border-primary/20 absolute -bottom-4 -left-4 h-12 w-12 border-b border-l"></div>
          <div className="border-primary/20 absolute -right-4 -bottom-4 h-12 w-12 border-r border-b"></div>

          <div className="group/mock border-border/60 bg-card relative flex h-full w-full flex-col overflow-hidden border shadow-[0_0_40px_rgba(0,0,0,0.05)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            {/* Mock UI Header */}
            <div className="border-border/40 bg-muted/20 flex h-8 shrink-0 items-center justify-between border-b px-4">
              <div className="flex gap-1.5">
                <div className="border-border/20 bg-muted-foreground/20 h-2 w-2 border"></div>
                <div className="border-border/20 bg-muted-foreground/20 h-2 w-2 border"></div>
                <div className="border-border/20 bg-muted-foreground/20 h-2 w-2 border"></div>
              </div>
              <div className="flex items-center gap-4 font-mono text-[8px] tracking-[0.3em] text-zinc-500 uppercase">
                <span className="font-vazirmatn text-primary/80 text-[8px] tracking-normal">
                  پـروتـکـل ثـبـت: فـعـال
                </span>
                <span className="bg-border h-3 w-px"></span>
                <span className="font-bold text-emerald-600 dark:text-emerald-500/70">
                  NODE_STREAM: OK
                </span>
              </div>
            </div>

            <div className="grid flex-1 grid-cols-12 overflow-hidden">
              {/* Sidebar Mock */}
              <div className="border-border/40 bg-muted/10 col-span-3 space-y-4 border-r p-4">
                <div className="space-y-2">
                  <div className="border-primary bg-muted/40 h-2 w-full border-r-2"></div>
                  <div className="bg-muted/20 h-2 w-3/4"></div>
                  <div className="bg-muted/20 h-2 w-5/6"></div>
                </div>
                <div className="space-y-2 pt-4">
                  <div className="border-primary/20 bg-primary/10 flex h-6 w-full items-center justify-end border px-2">
                    <div className="bg-primary/40 h-1 w-12"></div>
                  </div>
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div
                      key={`sidebar-item-${item}`}
                      className="bg-muted/20 flex h-6 w-full items-center justify-end px-2"
                    >
                      <div className="bg-muted-foreground/20 h-1 w-10"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Content Mock */}
              <div className="relative col-span-9 space-y-6 overflow-hidden p-6 text-right">
                <div className="flex flex-row-reverse items-center justify-between">
                  <div className="space-y-1.5">
                    <div className="bg-muted/40 h-6 w-48 shadow-inner"></div>
                    <div className="bg-muted/20 h-2 w-32"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="border-border/40 bg-muted/20 h-6 w-6 border"></div>
                    <div className="font-vazirmatn border-primary/30 bg-primary/10 text-primary flex h-6 w-24 items-center justify-center border text-[7px] tracking-widest uppercase">
                      NEW_RECORD
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    {
                      label: "تراکنش‌ها",
                      val: "۸۵",
                      color: "bg-primary/20",
                      id: "stat-1",
                    },
                    {
                      label: "پروژه‌ها",
                      val: "۱۲",
                      color: "bg-emerald-500/20",
                      id: "stat-2",
                    },
                    {
                      label: "نودها",
                      val: "۴۸",
                      color: "bg-orange-500/20",
                      id: "stat-3",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.id}
                      className="group/card border-border/40 bg-muted/10 hover:bg-muted/20 flex h-20 flex-col justify-between border p-3 transition-all"
                    >
                      <div className="text-muted-foreground font-mono text-[7px] tracking-[0.2em] uppercase">
                        {stat.label}
                      </div>
                      <div className="flex items-baseline justify-between">
                        <div
                          className={`h-1.5 w-8 ${stat.color} transition-all duration-700 group-hover/card:w-full`}
                        ></div>
                        <div className="font-vazirmatn text-foreground/90 text-xl font-black">
                          {digitsEnToFa(stat.val)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2.5 pt-2">
                  {[
                    {
                      title: "بازنگری معماری شبکه گره‌ها",
                      code: "ARC-102",
                      status: "PENDING",
                      color: "text-amber-600 dark:text-amber-500/70",
                      id: "row-1",
                    },
                    {
                      title: "به‌روزرسانی پروتکل امنیتی لایه ۴",
                      code: "SEC-045",
                      status: "VERIFIED",
                      color: "text-emerald-600 dark:text-emerald-500/70",
                      id: "row-2",
                    },
                    {
                      title: "تست نفوذ نودهای منطقه‌ای",
                      code: "NET-882",
                      status: "QUEUE",
                      color: "text-primary/70",
                      id: "row-3",
                    },
                  ].map((row) => (
                    <div
                      key={row.id}
                      className="group bg-muted/5 hover:bg-muted/10 flex h-9 w-full flex-row-reverse items-center justify-between border border-white/5 px-4 transition-all duration-300"
                    >
                      <div className="flex flex-row-reverse items-center gap-4">
                        <div className="border-border/60 group-hover:border-primary group-hover:bg-primary/10 h-3 w-3 border transition-all duration-300"></div>
                        <div className="font-vazirmatn text-foreground/80 group-hover:text-foreground text-[11px] font-bold transition-colors">
                          {row.title}
                        </div>
                      </div>
                      <div className="flex items-center gap-6 font-mono">
                        <div className="text-muted-foreground text-[7px] tracking-widest uppercase">
                          {row.code}
                        </div>
                        <div
                          className={`text-[7px] font-bold ${row.color} tracking-[0.2em]`}
                        >
                          {row.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[size:100%_2px,3px_100%] opacity-5"></div>
            <div className="from-card pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent to-transparent"></div>
          </div>
        </div>
      </header>

      {/* Metric Telemetry */}
      <section className="border-border/40 bg-muted/30 relative z-10 border-y px-6 py-12 backdrop-blur-2xl">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 md:grid-cols-4 md:gap-4">
          {[
            {
              label: "تراکنش‌های ثبتی نهایی",
              value: digitsEnToFa("۸۵,۴۲۰"),
              suffix: "LOGS",
              icon: <BarChart3 className="text-primary h-3.5 w-3.5" />,
              id: "metric-1",
            },
            {
              label: "میانگین تحویل تسک",
              value: digitsEnToFa("۴.۲"),
              suffix: "DAYS",
              icon: (
                <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" />
              ),
              id: "metric-2",
            },
            {
              label: "پروژه‌های تحت پایش",
              value: digitsEnToFa("۱۲۴"),
              suffix: "UNITS",
              icon: (
                <Layers className="h-3.5 w-3.5 text-orange-600 dark:text-orange-500" />
              ),
              id: "metric-3",
            },
            {
              label: "نودهای تایید شده",
              value: digitsEnToFa("۴۸۲"),
              suffix: "ACTIVE_NODES",
              icon: (
                <Users className="h-3.5 w-3.5 text-purple-600 dark:text-purple-500" />
              ),
              id: "metric-4",
            },
          ].map((metric) => (
            <div
              key={metric.id}
              className="group border-border/40 hover:border-primary/50 flex flex-col gap-3 border-r pr-4 text-right transition-colors duration-500"
            >
              <div className="flex items-center justify-end gap-2">
                <span className="font-vazirmatn text-[9px] leading-none tracking-[0.2em] text-zinc-500 uppercase">
                  {metric.label}
                </span>
                {metric.icon}
              </div>
              <div className="flex flex-row-reverse items-baseline gap-2">
                <span className="font-vazirmatn text-foreground group-hover:text-primary text-3xl font-black transition-all duration-500">
                  {metric.value}
                </span>
                <span className="text-muted-foreground font-mono text-[8px] tracking-widest uppercase">
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
        className="relative z-10 mx-auto max-w-7xl px-6 py-20"
      >
        <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl text-right">
            <span className="text-primary mb-4 block font-mono text-[9px] font-bold tracking-[0.5em] uppercase">
              SYSTEM_ARCHITECTURE {"//"} قابلیت‌ها
            </span>
            <h2 className="font-vazirmatn text-foreground text-3xl leading-[0.9] font-black tracking-tighter uppercase md:text-5xl">
              اقتدار صنعتی <br />
              در کالبد نرم‌افزار
            </h2>
          </div>
          <p className="font-vazirmatn border-primary text-muted-foreground max-w-xs border-r pr-4 text-right text-xs leading-relaxed font-light">
            انجام با مدیریت تیم شما مانند یک عملیات استراتژیک برخورد می‌کند؛
            جایی که هر تسک یک گره و هر تغییر یک رکورد ثبت شده است.
          </p>
        </div>

        <div className="border-border/60 grid grid-cols-1 gap-0 border md:grid-cols-3">
          {[
            {
              icon: <Layers className="h-4 w-4" />,
              title: "مدیریت ثبتی (Registry)",
              desc: "فراتر از یک لیست ساده؛ تسک‌ها در انجام به عنوان رکوردهای صنعتی با متادیتای غمیق و تاریخچه غیرقابل تغییر ثبت می‌شوند.",
              id: "feature-1",
            },
            {
              icon: <Cpu className="h-4 w-4" />,
              title: "اتوماسیون منطقی",
              desc: "پروتکل‌های خودکار برای تغییر وضعیت, اطلاع‌رسانی و اختصاص منابع که بدون دخالت انسانی، نظم تیم را حفظ می‌کنند.",
              id: "feature-2",
            },
            {
              icon: <ShieldCheck className="h-4 w-4" />,
              title: "امنیت متمرکز",
              desc: "کنترل‌های دسترسی مبتنی بر نقش (RBAC) با استانداردهای نظامی و پایش لحظه‌ای نفوذ و تلاش‌های ناموفق.",
              id: "feature-3",
            },
            {
              icon: <Zap className="h-4 w-4" />,
              title: "تلمتری زنده (Live)",
              desc: "مشاهده لحظه‌ای پیشرفت پروژه‌ها با تاخیر میلی‌ثانیه‌ای؛ شبکه تیم شما همیشه با گره مرکزی همگام باقی می‌ماند.",
              id: "feature-4",
            },
            {
              icon: <BarChart3 className="h-4 w-4" />,
              title: "گزارش‌دهی تحلیلی",
              desc: "استخراج بینش‌های استراتژیک از داده‌های خام؛ شناسایی گلوگاه‌های تولید با ابزارهای هوش تجاری داخلی.",
              id: "feature-5",
            },
            {
              icon: <Users className="h-4 w-4" />,
              title: "همکاری شبکه‌ای",
              desc: "ساختار یافته برای تیم‌های بزرگ؛ مدیریت گروه‌ها، دسترسی‌ها و ارتباطات به صورت کاملاً سلسله‌مراتبی و دقیق.",
              id: "feature-6",
            },
          ].map((feature) => (
            <div
              key={feature.id}
              className="group border-border/40 hover:bg-primary/[0.03] relative overflow-hidden border p-10 text-right transition-all duration-700"
            >
              <div className="border-border/60 bg-muted text-muted-foreground group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground mb-6 flex h-10 w-10 items-center justify-center border shadow-sm transition-all duration-500">
                {feature.icon}
              </div>
              <h3 className="font-vazirmatn text-foreground mb-4 text-lg leading-none font-black tracking-widest uppercase">
                {feature.title}
              </h3>
              <p className="font-vazirmatn text-muted-foreground group-hover:text-foreground/80 text-xs leading-relaxed font-light transition-colors">
                {feature.desc}
              </p>
              <div className="bg-primary/30 absolute top-0 right-0 h-[1px] w-10 transition-all duration-1000 group-hover:w-full"></div>
              <div className="bg-primary/30 absolute top-0 right-0 h-10 w-[1px] transition-all duration-1000 group-hover:h-full"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative z-10 px-6 py-20">
        <div className="group relative mx-auto max-w-5xl overflow-hidden bg-[#0047AB] p-12 text-center shadow-[0_30px_80px_rgba(0,0,0,0.1)] md:p-24 dark:shadow-[0_40px_100px_rgba(0,0,0,0.3)]">
          {/* Technical blueprint background for CTA */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:20px_20px] opacity-10"></div>
          <div className="absolute inset-0 bg-black/10 mix-blend-multiply"></div>

          <div className="relative z-10">
            <h2 className="font-vazirmatn mb-6 text-4xl leading-[0.8] font-black tracking-tighter text-white uppercase md:text-6xl">
              استقرار <br />
              سـامـانـه
            </h2>
            <p className="font-vazirmatn mx-auto mb-10 max-w-lg text-sm leading-relaxed font-light text-blue-50/90">
              آماده ورود به عصر جدید انضباط کاری هستید؟ گره اختصاصی تیم خود را
              در شبکه انجام فعال کنید.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="font-vazirmatn h-11 rounded-none border-none bg-white px-8 text-sm font-black tracking-widest text-black uppercase shadow-[3px_3px_0px_rgba(0,0,0,0.2)] transition-all hover:bg-zinc-100 active:scale-95"
              >
                <Link to="/login">استقرار آنی نود</Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="font-vazirmatn h-11 rounded-none border-2 border-white/40 bg-transparent px-8 text-sm font-black tracking-widest text-white uppercase transition-all hover:bg-white/10 active:scale-95"
              >
                <a href="mailto:support@anjam.ir">پروتکل مشاوره</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-border/40 bg-card relative z-10 border-t px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-10 md:flex-row">
          <div className="flex items-center gap-4">
            <div className="border-border/60 bg-muted text-muted-foreground flex h-8 w-8 items-center justify-center rounded-none border font-mono text-base font-black tracking-tighter shadow-sm">
              A
            </div>
            <div className="flex flex-col text-right">
              <span className="font-vazirmatn text-foreground/80 mb-0.5 text-[11px] leading-none font-black tracking-[0.1em] uppercase">
                سـامـانـه ثـبـت انـجـام
              </span>
              <span className="text-muted-foreground font-mono text-[8px] leading-none tracking-widest uppercase">
                © {digitsEnToFa(new Date().getFullYear())} CORE_RESERVED
              </span>
            </div>
          </div>

          <div className="font-vazirmatn text-muted-foreground flex flex-wrap justify-center gap-x-8 gap-y-4 font-mono text-[9px] tracking-[0.2em] uppercase">
            <a href="#doc" className="hover:text-primary transition-colors">
              مستندات گره‌ها
            </a>
            <a href="#privacy" className="hover:text-primary transition-colors">
              پروتکل امنیت
            </a>
            <a href="#terms" className="hover:text-primary transition-colors">
              توافق‌نامه
            </a>
            <a href="#status" className="hover:text-primary transition-colors">
              مانیتورینگ
            </a>
          </div>

          <div className="border-border/40 bg-muted/20 flex items-center gap-3 border px-4 py-2 shadow-inner">
            <div className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="flex flex-col items-start font-mono uppercase">
              <span className="text-[8px] leading-none font-bold tracking-[0.3em] text-emerald-600 dark:text-emerald-500/90">
                NODE_01_ACTIVE
              </span>
              <span className="mt-1 text-[6px] leading-none font-medium tracking-[0.1em] text-zinc-500">
                IR_TEH_DISTRICT_01
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
