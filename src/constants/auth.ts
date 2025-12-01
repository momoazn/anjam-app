// Authentication module

export const auth = {
  login: {
    title: "ورود به سیستم",
    username: "نام کاربری",
    password: "رمز عبور",
    loginButton: "ورود",
    loggingIn: "در حال ورود...",
    registerButton: "ثبت‌نام",
    errors: {
      credentialsRequired: "لطفاً نام کاربری و رمز عبور را وارد کنید",
      invalidCredentials: "نام کاربری یا رمز عبور اشتباه است. دوباره تلاش کنید",
    },
  },
  register: {
    title: "ایجاد حساب کاربری",
    username: "نام کاربری",
    password: "رمز عبور",
    confirmPassword: "تکرار رمز عبور",
    registerButton: "ایجاد حساب",
    registering: "در حال ایجاد حساب...",
    loginButton: "بازگشت به ورود",
    success: "حساب کاربری با موفقیت ایجاد شد",
    initialAdminMessage:
      "برای شروع، حساب مدیر سیستم را بسازید. نام کاربری و رمز عبور دلخواهتان را وارد کنید.",
    errors: {
      credentialsRequired: "لطفاً نام کاربری و رمز عبور را وارد کنید",
      passwordsMismatch: "رمزهای عبور با هم مطابقت ندارند",
      adminCreationFailed:
        "متأسفانه نتوانستیم حساب مدیر را بسازیم. دوباره تلاش کنید",
    },
  },
  errors: {
    usernameRequired: "نام کاربری را وارد کنید",
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
      "حساب کاربری شما غیرفعال است. لطفاً با مدیر سیستم تماس بگیرید",
    userBlocked:
      "حساب کاربری شما مسدود شده است. لطفاً با مدیر سیستم تماس بگیرید",
    serverError: "مشکلی پیش آمده. چند لحظه صبر کنید و دوباره تلاش کنید",
  },
} as const;
