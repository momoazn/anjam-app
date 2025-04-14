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
      errors: {
        credentialsRequired: "وارد کردن نام کاربری و رمز عبور الزامی است",
        passwordsMismatch: "رمزهای عبور مطابقت ندارند",
      },
    },
  },
  projects: {
    title: "پروژه‌ها",
    projectTasks: "تسک‌های پروژه",
    project: "پروژه",
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
        code: "کد",
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
      title: "مشکل جدید",
      issueTitle: "عنوان مشکل",
      description: "افزودن توضیحات...",
      unassigned: "اختصاص‌نیافته",
      assignee: "مسئول",
      priority: "اولویت",
      status: "وضعیت",
      buttons: {
        create: "ایجاد تسک",
        creating: "در حال ایجاد...",
        more: "گزینه‌های بیشتر",
      },
    },
    list: {
      noTasks: "هیچ تسک‌ای موجود نیست",
      openMenu: "باز کردن منو",
    },
  },
} as const;
