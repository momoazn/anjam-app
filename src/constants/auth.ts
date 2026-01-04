// Authentication module

export const auth = {
  login: {
    title: "ورود به سیستم",
    username: "ایمیل یا نام کاربری",
    password: "رمز عبور",
    loginButton: "ورود",
    loggingIn: "در حال ورود...",
    registerButton: "ثبت‌نام",
    noAccountPrompt: "حساب ندارید؟",
    subtitle: "لطفاً اطلاعات ورود خود را وارد کنید",
    placeholders: {
      email: "name@company.com",
      password: "••••••••",
    },
    secureAccess: "دسترسی امن",
    errors: {
      credentialsRequired: "لطفاً نام کاربری و رمز عبور را وارد کنید",
      invalidCredentials: "نام کاربری یا رمز عبور اشتباه است. دوباره تلاش کنید",
    },
  },
  // Visual content (left side)
  visual: {
    systemDevelopment: "توسعه سیستم",
    management: "مدیریت",
    description:
      "ورود به سامانه انجام برای مدیریت یکپارچه تسک‌ها و پروژه‌های سازمانی.",
    copyright: "تمامی حقوق محفوظ است.",
  },
  register: {
    title: "ایجاد حساب کاربری",
    username: "نام کاربری",
    email: "ایمیل",
    password: "رمز عبور",
    confirmPassword: "تکرار رمز عبور",
    organizationName: "نام سازمان",
    organizationNamePlaceholder: "نام سازمان شما",
    registerButton: "ایجاد حساب",
    registering: "در حال ایجاد حساب...",
    loginButton: "بازگشت به ورود",
    haveAccountPrompt: "قبلا ثبت‌نام کرده‌اید؟",
    success: "حساب کاربری با موفقیت ایجاد شد",
    initialAdminMessage:
      "با ایمیل و رمز عبور خود ثبت‌نام کنید و سازمان جدید بسازید.",
    errors: {
      credentialsRequired: "لطفاً اطلاعات لازم را وارد کنید",
      passwordsMismatch: "رمزهای عبور با هم مطابقت ندارند",
      adminCreationFailed:
        "متأسفانه نتوانستیم حساب ادمین را بسازیم. دوباره تلاش کنید",
      organizationNameRequired: "نام سازمان الزامی است",
    },
  },
  invite: {
    title: "پیوستن به سازمان",
    joining: "پیوستن به {orgName}",
    joinButton: "عضویت",
    joiningButton: "در حال عضویت...",
    welcomeMessage: "با ایمیل و رمز عبور خود ثبت‌نام کنید.",
    success: "عضویت با موفقیت انجام شد",
    errors: {
      inviteNotFound: "لینک دعوت نامعتبر است",
      inviteExpired: "لینک دعوت منقضی شده است",
      inviteExhausted: "ظرفیت استفاده از این لینک دعوت تکمیل شده است",
      inviteRevoked: "این لینک دعوت لغو شده است",
      emailAlreadyRegistered: "این ایمیل قبلاً ثبت‌نام شده است",
    },
    loginPrompt: "قبلاً حساب دارید؟",
  },
  pendingActivation: {
    title: "احراز هویت :: فعال‌سازی",
    status: "وضعیت حساب :: در انتظار",
    instruction: "دستورالعمل",
    securityCheck: "بررسی امنیتی :: موفق",
    secureAuth: "احراز هویت امن",
  },
  onboarding: {
    title: "خوش آمدید!",
    subtitle: "سازمان خود را آماده کنید",
    step1: {
      title: "لوگوی سازمان",
      description: "لوگوی سازمان خود را بارگذاری کنید",
    },
    step2: {
      title: "پروژه اول",
      description: "اولین پروژه خود را بسازید",
      createProject: "ساخت اولین پروژه",
      projectDescription:
        "پروژه‌ها به شما کمک می‌کنند تسک‌ها را سازماندهی کنید",
      projectPlaceholder: "نام پروژه (مثلاً «توسعه محصول»)",
    },
    step3: {
      title: "دعوت اعضا",
      description: "اعضای تیم خود را دعوت کنید",
    },
    skip: "رد شدن",
    next: "بعدی",
    previous: "قبلی",
    finish: "اتمام",
    placeholders: {
      email: "email@example.com",
    },
  },
  errors: {
    usernameRequired: "نام کاربری را وارد کنید",
    emailRequired: "ایمیل را وارد کنید",
    emailInvalid: "ایمیل معتبر نیست",
    passwordRequired: "رمز عبور باید حداقل ۸ کاراکتر باشد",
    passwordConfirmRequired: "لطفاً رمز عبور را دوباره وارد کنید",
    passwordsMismatch: "رمزهای عبور با هم مطابقت ندارند",
    firstNameRequired: "نام را وارد کنید",
    lastNameRequired: "نام خانوادگی را وارد کنید",
    passwordMinLength: "رمز عبور باید حداقل ۸ کاراکتر باشد",
    usernameMinLength: "نام کاربری باید حداقل ۳ کاراکتر باشد",
    usernameMaxLength: "نام کاربری نمی‌تواند بیشتر از ۵۰ کاراکتر باشد",
    passwordMaxLength: "رمز عبور نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد",
    usernameInvalid: "نام کاربری معتبر نیست",
    passwordInvalid: "رمز عبور معتبر نیست",
    userAlreadyExists:
      "این نام کاربری قبلاً استفاده شده. نام دیگری انتخاب کنید",
    invalidCredentials: "نام کاربری یا رمز عبور اشتباه است",
    userInactive:
      "حساب کاربری شما غیرفعال است. لطفاً با ادمین سیستم تماس بگیرید",
    userBlocked:
      "حساب کاربری شما مسدود شده است. لطفاً با ادمین سیستم تماس بگیرید",
    serverError: "مشکلی پیش آمده. چند لحظه صبر کنید و دوباره تلاش کنید",
    rateLimited:
      "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً چند لحظه صبر کنید.",
    notLoggedIn: "لطفاً ابتدا وارد شوید",
  },
} as const;
