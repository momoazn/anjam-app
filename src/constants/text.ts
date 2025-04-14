// export const TEXT = {
//   app: {
//     name: "Task Manager",
//   },
//   navigation: {
//     dashboard: "Dashboard",
//     projects: "Projects",
//     tasks: "Tasks",
//     settings: "Settings",
//     quickCreate: {
//       button: "Quick Create",
//       tooltip: "Quick Create",
//     },
//   },
//   header: {
//     title: "Task Manager",
//   },
//   user: {
//     dropdown: {
//       account: "Account",
//       logout: "Log out",
//     },
//   },
//   auth: {
//     login: {
//       title: "Login",
//       username: "Username",
//       password: "Password",
//       loginButton: "Login",
//       registerButton: "Register",
//       errors: {
//         credentialsRequired: "Username and password are required",
//         invalidCredentials: "Invalid username or password",
//       },
//     },
//     register: {
//       title: "Register",
//       username: "Username",
//       password: "Password",
//       confirmPassword: "Confirm Password",
//       registerButton: "Register",
//       loginButton: "Back to Login",
//       errors: {
//         credentialsRequired: "Username and password are required",
//         passwordsMismatch: "Passwords do not match",
//       },
//     },
//   },
//   tasks: {
//     table: {
//       columns: {
//         id: "ID",
//         status: "Status",
//         title: "Title",
//         deadline: "Deadline",
//         assignedUser: "Assigned User",
//         actions: "Actions",
//       },
//       selectAll: "Select all",
//       selectRow: "Select row",
//       dropdownMenu: {
//         label: "Actions",
//         copyId: "Copy task ID",
//         viewCustomer: "View customer",
//         viewDetails: "View payment details",
//       },
//     },
//     priority: {
//       urgent: "Urgent",
//       high: "High",
//       medium: "Medium",
//       low: "Low",
//     },
//     status: {
//       todo: "Todo",
//       in_progress: "In Progress",
//       done: "Done",
//       canceled: "Canceled",
//     },
//     tags: {
//       bug: "Bug",
//       feature: "Feature",
//       improvement: "Improvement",
//     },
//     addTask: {
//       title: "New issue",
//       issueTitle: "Issue title",
//       description: "Add description...",
//       unassigned: "Unassigned",
//       assignee: "Assignee",
//       priority: "Priority",
//       status: "Status",
//       buttons: {
//         create: "Create Task",
//         creating: "Creating...",
//         more: "More options",
//       },
//     },
//     list: {
//       noTasks: "No Tasks",
//       openMenu: "Open menu",
//     },
//   },
// } as const;

export const TEXT = {
  app: {
    name: "مدیر تسک‌ها",
  },
  common: {
    cancel: "انصراف",
    submit: "تایید",
  },
  navigation: {
    dashboard: "داشبورد",
    projects: "پروژه‌ها",
    tasks: "تسک‌ها",
    users: "کاربران",
    reports: "گزارش‌ها",
    settings: "تنظیمات",
    quickCreate: {
      button: "ایجاد سریع",
      tooltip: "ایجاد فوری",
    },
  },
  header: {
    title: "مدیر تسک‌ها",
  },
  user: {
    dropdown: {
      account: "حساب کاربری",
      logout: "خروج",
    },
  },
  auth: {
    login: {
      title: "ورود",
      username: "نام کاربری",
      password: "رمز عبور",
      loginButton: "ورود",
      registerButton: "ثبت‌نام",
      errors: {
        credentialsRequired: "وارد کردن نام کاربری و رمز عبور الزامی است",
        invalidCredentials: "نام کاربری یا رمز عبور نادرست است",
      },
    },
    register: {
      title: "ثبت‌نام",
      username: "نام کاربری",
      password: "رمز عبور",
      confirmPassword: "تأیید رمز عبور",
      registerButton: "ثبت‌نام",
      loginButton: "بازگشت به ورود",
      initialAdminMessage:
        "برای ایجاد ادمین اولیه، لطفا نام کاربری و رمز عبور خود را وارد کنید.",
      errors: {
        credentialsRequired: "وارد کردن نام کاربری و رمز عبور الزامی است",
        passwordsMismatch: "رمزهای عبور مطابقت ندارند",
        adminCreationFailed: "خطا در ایجاد ادمین اولیه",
      },
    },
    errors: {
      usernameRequired: "وارد کردن نام کاربری الزامی است",
      passwordRequired: "وارد کردن رمز عبور الزامی است",
      passwordConfirmRequired: "وارد کردن تأیید رمز عبور الزامی است",
      passwordsMismatch: "رمزهای عبور مطابقت ندارند",
      firstNameRequired: "وارد کردن نام الزامی است",
      lastNameRequired: "وارد کردن نام خانوادگی الزامی است",
    },
  },
  users: {
    title: "کاربران",
    list: {
      count: "{count} کاربر",
    },
    table: {
      columns: {
        user: "کاربر",
        username: "نام کاربری",
        email: "ایمیل",
        role: "نقش",
        actions: "عملیات",
      },
      roles: {
        admin: "مدیر",
        supervisor: "سرپرست",
        employee: "کارمند",
      },
    },
    form: {
      firstName: "نام",
      lastName: "نام خانوادگی",
      selectRole: "انتخاب نقش",
    },
    create: {
      button: "کاربر جدید",
      title: "ایجاد کاربر جدید",
      success: "کاربر با موفقیت ایجاد شد",
      error: "خطا در ایجاد کاربر: {error}",
      errors: {
        usernameRequired: "وارد کردن نام کاربری الزامی است",
        passwordRequired: "وارد کردن رمز عبور الزامی است",
        passwordConfirmRequired: "وارد کردن تأیید رمز عبور الزامی است",
        passwordsMismatch: "رمزهای عبور مطابقت ندارند",
      },
    },
    edit: {
      title: "ویرایش کاربر",
      button: "به‌روزرسانی",
    },
    delete: {
      title: "حذف کاربر",
      description: "آیا از حذف این کاربر اطمینان دارید؟",
      button: "حذف",
    },
  },
  projects: {
    title: "پروژه‌ها",
    projectTasks: "تسک‌های پروژه",
    project: "پروژه",
    users: {
      title: "کاربران پروژه",
      count: "کاربر",
      add: "افزودن کاربر",
      addDialog: {
        title: "افزودن کاربر به پروژه",
        selectPlaceholder: "انتخاب کاربر",
      },
      table: {
        user: "کاربر",
        role: "نقش",
        actions: "عملیات",
      },
      addSuccess: "کاربر با موفقیت به پروژه اضافه شد",
      addError: "خطا در افزودن کاربر به پروژه",
      removeSuccess: "کاربر با موفقیت از پروژه حذف شد",
      removeError: "خطا در حذف کاربر از پروژه",
    },
    list: {
      noProjects: "هیچ پروژه‌ای موجود نیست",
      count: "{count} پروژه",
      viewTasks: "مشاهده تسک‌ها",
    },
    create: {
      button: "پروژه جدید",
      title: "ایجاد پروژه جدید",
      description: "یک پروژه جدید به فضای کاری خود اضافه کنید.",
      form: {
        name: "نام",
        nameRequired: "وارد کردن نام الزامی است",
        code: "کد",
        codeLength: "کد باید 3 کاراکتر باشد",
      },
      submit: "ایجاد پروژه",
      success: "پروژه با موفقیت ایجاد شد",
      error: "خطا در ایجاد پروژه: {error}",
    },
    edit: {
      title: "ویرایش پروژه",
      description: "جزئیات پروژه را به‌روزرسانی کنید.",
      submit: "به‌روزرسانی پروژه",
      success: "پروژه با موفقیت به‌روزرسانی شد",
      error: "خطا در به‌روزرسانی پروژه: {error}",
    },
    delete: {
      title: "حذف پروژه",
      confirm:
        "آیا از حذف این پروژه اطمینان دارید؟ با حذف پروژه، تمامی تسک های مربوط به آن نیز حذف خواهند شد.",
      submit: "حذف پروژه",
      success: "پروژه با موفقیت حذف شد",
      error: "خطا در حذف پروژه: {error}",
    },
  },
  tasks: {
    title: "تسک‌ها",
    allTasks: "همه تسک‌ها",
    priority: {
      urgent: "فوری",
      high: "بالا",
      medium: "متوسط",
      low: "پایین",
    },
    status: {
      todo: "برای انجام",
      in_progress: "در حال انجام",
      done: "انجام‌شده",
      canceled: "لغوشده",
    },
    tags: {
      bug: "اشکال",
      feature: "ویژگی",
      improvement: "بهبود",
    },
    addTask: {
      title: "افزودن تسک",
      issueTitle: "عنوان تسک",
      description: "توضیحات تسک",
      status: "وضعیت",
      priority: "اولویت",
      assignee: "مسئول",
      unassigned: "اختصاص‌نیافته",
      selectProject: "انتخاب پروژه",
      success: "تسک با موفقیت ایجاد شد",
      error: "خطا در ایجاد تسک: {error}",
      buttons: {
        create: "ایجاد",
        creating: "در حال ایجاد...",
        more: "بیشتر",
      },
    },
    list: {
      noTasks: "هیچ تسک‌ای موجود نیست",
      openMenu: "باز کردن منو",
    },
    details: {
      title: "جزئیات تسک",
      buttons: {
        save: "ذخیره",
        saving: "در حال ذخیره...",
        cancel: "انصراف",
      },
    },
    edit: {
      title: "ویرایش تسک",
      success: "تسک با موفقیت به‌روزرسانی شد",
      error: "خطا در به‌روزرسانی تسک: {error}",
      buttons: {
        save: "ذخیره",
        saving: "در حال ذخیره...",
        cancel: "انصراف",
      },
    },
  },
} as const;
