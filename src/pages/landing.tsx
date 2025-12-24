import {
  BarChart3,
  Clock,
  Cpu,
  Layers,
  ShieldCheck,
  Terminal,
  Users,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuthIsLoggedIn } from "@/store/auth-store";
import { digitsEnToFa } from "@persian-tools/persian-tools";

const LandingPage = () => {
  const isLoggedIn = useAuthIsLoggedIn();

  return (
    <div
      className="dir-rtl min-h-screen overflow-x-hidden bg-[#0a0a0b] font-sans text-zinc-100 selection:bg-blue-500/30"
      dir="rtl"
    >
      {/* Technical Grid Background */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#1d4ed815,transparent)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between border-b border-white/5 bg-black/40 px-6 py-5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-none bg-blue-600 font-mono text-base font-black text-black shadow-[2px_2px_0px_rgba(30,58,138,0.4)]">
            A
          </div>
          <div className="flex flex-col text-right">
            <span className="font-vazirmatn text-[13px] leading-none font-black tracking-tight uppercase">
              سـامـانـه انـجـام
            </span>
            <span className="font-mono text-[8px] tracking-[0.2em] text-zinc-500 uppercase">
              REGISTRY_CORE_V2
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link
            to="/login"
            className="hidden font-mono text-[9px] tracking-[0.3em] text-zinc-400 uppercase transition-colors hover:text-white md:block"
          >
            AUTH_GATE
          </Link>
          <Button
            asChild
            variant="outline"
            className="h-9 rounded-none border-white/10 px-5 font-mono text-[9px] tracking-widest text-white uppercase shadow-[1px_1px_0px_rgba(255,255,255,0.05)] transition-all hover:bg-white/5 active:scale-95"
          >
            <Link to={isLoggedIn ? "/" : "/login"}>
              {isLoggedIn ? "ACCESS_CONSOLE" : "INITIALIZE_SYSTEM"}
            </Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 pt-24 pb-16 text-center">
        <div className="animate-in fade-in slide-in-from-bottom-4 mb-8 inline-flex items-center gap-2 border border-blue-500/30 bg-blue-500/10 px-3 py-1 font-mono text-[8px] tracking-[0.4em] text-blue-400 uppercase duration-700">
          <Terminal className="h-2.5 w-2.5" />
          STATE: OPERATIONAL
        </div>

        <h1 className="animate-in fade-in slide-in-from-bottom-8 font-vazirmatn relative mb-6 bg-gradient-to-b from-white via-white to-zinc-700 bg-clip-text text-6xl font-black tracking-tighter text-transparent delay-200 duration-1000 md:text-8xl">
          انجام
          <span className="pointer-events-none absolute -top-3 -right-8 hidden font-mono text-[10px] tracking-[0.6em] text-blue-500/40 uppercase md:block">
            V2.0
          </span>
        </h1>

        <p className="animate-in fade-in slide-in-from-bottom-8 font-vazirmatn mb-10 max-w-2xl px-4 text-base leading-relaxed font-light text-zinc-400 delay-300 duration-1000 md:text-lg">
          اقتدار در مدیریت، دقت در اجرا. ابزاری مهندسی‌شده برای تیم‌هایی که
          خواستار انضباط صنعتی و شفافیت مطلق در پروژه‌های پیچیده هستند.
        </p>

        <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col justify-center gap-5 delay-500 duration-1000 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="font-vazirmatn h-12 rounded-none bg-blue-600 px-8 text-base font-black tracking-widest text-white uppercase shadow-[4px_4px_0px_rgba(30,58,138,0.5)] transition-all hover:bg-blue-700 active:scale-95"
          >
            <Link to="/login">ورود به پروتکل</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="font-vazirmatn h-12 rounded-none border-white/20 px-8 text-base font-black tracking-widest text-zinc-300 uppercase transition-all hover:bg-white/10 hover:text-white active:scale-95"
          >
            <a href="#features">بررسی قابلیت‌ها</a>
          </Button>
        </div>

        {/* Hero Visual - Registry UI Mock */}
        <div className="group animate-in fade-in zoom-in-95 relative mt-20 aspect-[16/10] w-full max-w-5xl delay-700 duration-1000">
          <div className="absolute -top-6 -left-6 h-16 w-16 border-t border-l border-blue-500/20"></div>
          <div className="absolute -top-6 -right-6 h-16 w-16 border-t border-r border-blue-500/20"></div>
          <div className="absolute -bottom-6 -left-6 h-16 w-16 border-b border-l border-blue-500/20"></div>
          <div className="absolute -right-6 -bottom-6 h-16 w-16 border-r border-b border-blue-500/20"></div>

          <div className="group/mock relative flex h-full w-full flex-col overflow-hidden border border-white/10 bg-[#0c0c0e] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            {/* Mock UI Header */}
            <div className="flex h-10 shrink-0 items-center justify-between border-b border-white/10 bg-white/[0.04] px-5">
              <div className="flex gap-2">
                <div className="h-2.5 w-2.5 border border-white/5 bg-zinc-800"></div>
                <div className="h-2.5 w-2.5 border border-white/5 bg-zinc-800"></div>
                <div className="h-2.5 w-2.5 border border-white/5 bg-zinc-800"></div>
              </div>
              <div className="flex items-center gap-5 font-mono text-[9px] tracking-[0.3em] text-zinc-500 uppercase">
                <span className="font-vazirmatn text-[9px] tracking-normal text-blue-500/80">
                  پـروتـکـل ثـبـت: فـعـال
                </span>
                <span className="h-3.5 w-px bg-white/10"></span>
                <span className="font-bold text-emerald-500/70">
                  NODE_STREAM: OK
                </span>
              </div>
            </div>

            <div className="grid flex-1 grid-cols-12 overflow-hidden">
              {/* Sidebar Mock */}
              <div className="col-span-3 space-y-6 border-r border-white/5 bg-black/40 p-5">
                <div className="space-y-3">
                  <div className="h-3 w-full border-r-2 border-blue-500 bg-white/5"></div>
                  <div className="h-3 w-3/4 bg-white/5"></div>
                  <div className="h-3 w-5/6 bg-white/5"></div>
                </div>
                <div className="space-y-3 pt-4">
                  <div className="flex h-8 w-full items-center justify-end border border-blue-600/20 bg-blue-600/10 px-3">
                    <div className="h-1.5 w-16 bg-blue-500/40"></div>
                  </div>
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div
                      key={`sidebar-item-${item}`}
                      className="flex h-8 w-full items-center justify-end bg-white/5 px-3"
                    >
                      <div className="h-1.5 w-12 bg-zinc-800"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Content Mock */}
              <div className="relative col-span-9 space-y-8 overflow-hidden p-8 text-right">
                <div className="flex flex-row-reverse items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-8 w-64 bg-white/[0.08] shadow-inner"></div>
                    <div className="h-3 w-48 bg-white/5"></div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-8 w-8 border border-white/10 bg-white/5"></div>
                    <div className="font-vazirmatn flex h-8 w-32 items-center justify-center border border-blue-600/30 bg-blue-600/20 text-[8px] tracking-widest text-blue-400 uppercase">
                      NEW_RECORD
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {[
                    {
                      label: "تراکنش‌ها",
                      val: "۸۵",
                      color: "bg-blue-500/20",
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
                      color: "bg-zinc-500/20",
                      id: "stat-3",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.id}
                      className="group/card flex h-28 flex-col justify-between border border-white/5 bg-white/[0.03] p-5 transition-all hover:bg-white/[0.06]"
                    >
                      <div className="font-mono text-[9px] tracking-[0.2em] text-zinc-500 uppercase">
                        {stat.label}
                      </div>
                      <div className="flex items-baseline justify-between">
                        <div
                          className={`h-2 w-10 ${stat.color} transition-all duration-700 group-hover/card:w-full`}
                        ></div>
                        <div className="font-vazirmatn text-3xl font-black text-white/90">
                          {digitsEnToFa(stat.val)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3.5 pt-4">
                  {[
                    {
                      title: "بازنگری معماری شبکه گره‌ها",
                      code: "ARC-102",
                      status: "PENDING",
                      color: "text-amber-500/70",
                      id: "row-1",
                    },
                    {
                      title: "به‌روزرسانی پروتکل امنیتی لایه ۴",
                      code: "SEC-045",
                      status: "VERIFIED",
                      color: "text-emerald-500/70",
                      id: "row-2",
                    },
                    {
                      title: "تست نفوذ نودهای منطقه‌ای",
                      code: "NET-882",
                      status: "QUEUE",
                      color: "text-blue-500/70",
                      id: "row-3",
                    },
                  ].map((row) => (
                    <div
                      key={row.id}
                      className="group flex h-12 w-full flex-row-reverse items-center justify-between border border-white/5 bg-white/[0.02] px-6 transition-all duration-300 hover:bg-white/[0.04]"
                    >
                      <div className="flex flex-row-reverse items-center gap-5">
                        <div className="h-4 w-4 border border-white/20 transition-all duration-300 group-hover:border-blue-500 group-hover:bg-blue-500/10"></div>
                        <div className="font-vazirmatn text-[13px] font-bold text-zinc-300 transition-colors group-hover:text-white">
                          {row.title}
                        </div>
                      </div>
                      <div className="flex items-center gap-8 font-mono">
                        <div className="text-[9px] tracking-widest text-zinc-600 uppercase">
                          {row.code}
                        </div>
                        <div
                          className={`text-[8px] font-bold ${row.color} tracking-[0.2em]`}
                        >
                          {row.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%] opacity-[0.05]"></div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-transparent to-transparent"></div>
          </div>
        </div>
      </header>

      {/* Metric Telemetry */}
      <section className="relative z-10 border-y border-white/5 bg-black/70 px-6 py-16 backdrop-blur-2xl">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-12 md:grid-cols-4 md:gap-6">
          {[
            {
              label: "تراکنش‌های ثبتی نهایی",
              value: digitsEnToFa("۸۵,۴۲۰"),
              suffix: "LOGS",
              icon: <BarChart3 className="h-4 w-4 text-blue-500" />,
              id: "metric-1",
            },
            {
              label: "میانگین تحویل تسک",
              value: digitsEnToFa("۴.۲"),
              suffix: "DAYS",
              icon: <Clock className="h-4 w-4 text-emerald-500" />,
              id: "metric-2",
            },
            {
              label: "پروژه‌های تحت پایش",
              value: digitsEnToFa("۱۲۴"),
              suffix: "UNITS",
              icon: <Layers className="h-4 w-4 text-orange-500" />,
              id: "metric-3",
            },
            {
              label: "نودهای تایید شده",
              value: digitsEnToFa("۴۸۲"),
              suffix: "ACTIVE_NODES",
              icon: <Users className="h-4 w-4 text-purple-500" />,
              id: "metric-4",
            },
          ].map((metric) => (
            <div
              key={metric.id}
              className="group flex flex-col gap-4 border-r border-white/5 pr-6 text-right transition-colors duration-500 hover:border-blue-500/50"
            >
              <div className="flex items-center justify-end gap-2">
                <span className="font-vazirmatn text-[10px] leading-none tracking-[0.2em] text-zinc-500 uppercase">
                  {metric.label}
                </span>
                {metric.icon}
              </div>
              <div className="flex flex-row-reverse items-baseline gap-3">
                <span className="font-vazirmatn text-4xl font-black tracking-tighter text-white transition-all duration-500 group-hover:text-blue-500">
                  {metric.value}
                </span>
                <span className="font-mono text-[9px] tracking-widest text-zinc-600 uppercase">
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
        <div className="mb-20 flex flex-col justify-between gap-10 md:flex-row md:items-end">
          <div className="max-w-2xl text-right">
            <span className="mb-5 block font-mono text-[10px] font-bold tracking-[0.5em] text-blue-500 uppercase">
              SYSTEM_ARCHITECTURE {"//"} قابلیت‌ها
            </span>
            <h2 className="font-vazirmatn text-4xl leading-[0.9] font-black tracking-tighter uppercase md:text-6xl">
              اقتدار صنعتی <br />
              در کالبد نرم‌افزار
            </h2>
          </div>
          <p className="font-vazirmatn max-w-xs border-r border-blue-500 pr-5 text-right text-sm leading-relaxed font-light text-zinc-400">
            انجام با مدیریت تیم شما مانند یک عملیات استراتژیک برخورد می‌کند؛
            جایی که هر تسک یک گره و هر تغییر یک رکورد ثبت شده است.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-0 border border-white/10 md:grid-cols-3">
          {[
            {
              icon: <Layers className="h-5 w-5" />,
              title: "مدیریت ثبتی (Registry)",
              desc: "فراتر از یک لیست ساده؛ تسک‌ها در انجام به عنوان رکوردهای صنعتی با متادیتای غمیق و تاریخچه غیرقابل تغییر ثبت می‌شوند.",
              id: "feature-1",
            },
            {
              icon: <Cpu className="h-5 w-5" />,
              title: "اتوماسیون منطقی",
              desc: "پروتکل‌های خودکار برای تغییر وضعیت، اطلاع‌رسانی و اختصاص منابع که بدون دخالت انسانی، نظم تیم را حفظ می‌کنند.",
              id: "feature-2",
            },
            {
              icon: <ShieldCheck className="h-5 w-5" />,
              title: "امنیت متمرکز",
              desc: "کنترل‌های دسترسی مبتنی بر نقش (RBAC) با استانداردهای نظامی و پایش لحظه‌ای نفوذ و تلاش‌های ناموفق.",
              id: "feature-3",
            },
            {
              icon: <Zap className="h-5 w-5" />,
              title: "تلمتری زنده (Live)",
              desc: "مشاهده لحظه‌ای پیشرفت پروژه‌ها با تاخیر میلی‌ثانیه‌ای؛ شبکه تیم شما همیشه با گره مرکزی همگام باقی می‌ماند.",
              id: "feature-4",
            },
            {
              icon: <BarChart3 className="h-5 w-5" />,
              title: "گزارش‌دهی تحلیلی",
              desc: "استخراج بینش‌های استراتژیک از داده‌های خام؛ شناسایی گلوگاه‌های تولید با ابزارهای هوش تجاری داخلی.",
              id: "feature-5",
            },
            {
              icon: <Users className="h-5 w-5" />,
              title: "همکاری شبکه‌ای",
              desc: "ساختار یافته برای تیم‌های بزرگ؛ مدیریت گروه‌ها، دسترسی‌ها و ارتباطات به صورت کاملاً سلسله‌مراتبی و دقیق.",
              id: "feature-6",
            },
          ].map((feature) => (
            <div
              key={feature.id}
              className="group relative overflow-hidden border border-white/5 p-12 text-right transition-all duration-700 hover:bg-blue-600/[0.05]"
            >
              <div className="mb-8 flex h-12 w-12 items-center justify-center border border-white/10 bg-zinc-900 text-zinc-400 transition-all duration-500 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white">
                {feature.icon}
              </div>
              <h3 className="font-vazirmatn mb-5 text-xl leading-none font-black tracking-widest uppercase">
                {feature.title}
              </h3>
              <p className="font-vazirmatn text-[13px] leading-relaxed font-light text-zinc-500 transition-colors group-hover:text-zinc-300">
                {feature.desc}
              </p>
              <div className="absolute top-0 right-0 h-[1.5px] w-12 bg-blue-500/20 transition-all duration-1000 group-hover:w-full"></div>
              <div className="absolute top-0 right-0 h-12 w-[1.5px] bg-blue-500/20 transition-all duration-1000 group-hover:h-full"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative z-10 px-6 py-24">
        <div className="group relative mx-auto max-w-6xl overflow-hidden bg-blue-600 p-16 text-center shadow-[0_40px_100px_rgba(30,58,138,0.3)] md:p-24">
          {/* Technical blueprint background for CTA */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:25px_25px] opacity-20"></div>
          <div className="absolute inset-0 bg-blue-900/70 mix-blend-multiply"></div>

          <div className="relative z-10">
            <h2 className="font-vazirmatn mb-8 text-4xl leading-[0.8] font-black tracking-tighter text-white uppercase md:text-7xl">
              استقرار <br />
              سـامـانـه
            </h2>
            <p className="font-vazirmatn mx-auto mb-12 max-w-xl text-base leading-relaxed font-light text-blue-50/90">
              آماده ورود به عصر جدید انضباط کاری هستید؟ گره اختصاصی تیم خود را
              در شبکه انجام فعال کنید.
            </p>
            <div className="flex flex-col justify-center gap-6 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="font-vazirmatn h-14 rounded-none bg-white px-10 text-lg font-black tracking-widest text-blue-700 uppercase shadow-[8px_8px_0px_rgba(30,58,138,0.5)] transition-all hover:bg-zinc-100 active:scale-95"
              >
                <Link to="/login">استقرار آنی نود</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="font-vazirmatn h-14 rounded-none border-white/50 px-10 text-lg font-black tracking-widest text-white uppercase transition-all hover:border-white hover:bg-white/10 active:scale-95"
              >
                <a href="mailto:support@anjam.ir">پروتکل مشاوره</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-black px-6 py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 md:flex-row">
          <div className="flex items-center gap-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-none border border-white/10 bg-zinc-900 font-mono text-lg font-black tracking-tighter text-zinc-300 shadow-2xl">
              A
            </div>
            <div className="flex flex-col text-right">
              <span className="font-vazirmatn mb-1 text-[13px] leading-none font-black tracking-[0.1em] text-zinc-400 uppercase">
                سـامـانـه ثـبـت انـجـام
              </span>
              <span className="font-mono text-[9px] leading-none tracking-widest text-zinc-700 uppercase">
                © {digitsEnToFa(new Date().getFullYear())}{" "}
                CORE_REGISTRY_RESERVED
              </span>
            </div>
          </div>

          <div className="font-vazirmatn flex flex-wrap justify-center gap-x-12 gap-y-5 font-mono text-[10px] tracking-[0.2em] text-zinc-600 uppercase">
            <a href="#doc" className="transition-colors hover:text-blue-500">
              مستندات گره‌ها
            </a>
            <a
              href="#privacy"
              className="transition-colors hover:text-blue-500"
            >
              پروتکل امنیت
            </a>
            <a href="#terms" className="transition-colors hover:text-blue-500">
              توافق‌نامه سطح سرویس
            </a>
            <a href="#status" className="transition-colors hover:text-blue-500">
              مانیتورینگ شبکه
            </a>
          </div>

          <div className="flex items-center gap-4 border border-white/10 bg-white/[0.03] px-6 py-3 shadow-inner">
            <div className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="flex flex-col items-start font-mono uppercase">
              <span className="text-[9px] leading-none font-bold tracking-[0.3em] text-emerald-500/90">
                NODE_01_ACTIVE
              </span>
              <span className="mt-1 text-[7px] leading-none font-medium tracking-[0.1em] text-zinc-600">
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
