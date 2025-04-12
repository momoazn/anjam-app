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
    name: "مدیر وظایف",
  },
  navigation: {
    dashboard: "داشبورد",
    projects: "پروژه‌ها",
    tasks: "وظایف",
    settings: "تنظیمات",
    quickCreate: {
      button: "ایجاد سریع",
      tooltip: "ایجاد فوری",
    },
  },
  header: {
    title: "مدیر وظایف",
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
  tasks: {
    table: {
      columns: {
        id: "شناسه",
        status: "وضعیت",
        title: "عنوان",
        deadline: "موعد تحویل",
        assignedUser: "کاربر مسئول",
        actions: "اقدامات",
      },
      selectAll: "انتخاب همه",
      selectRow: "انتخاب ردیف",
      dropdownMenu: {
        label: "اقدامات",
        copyId: "کپی شناسه وظیفه",
        viewCustomer: "مشاهده مشتری",
        viewDetails: "مشاهده جزئیات پرداخت",
      },
    },
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
        create: "ایجاد وظیفه",
        creating: "در حال ایجاد...",
        more: "گزینه‌های بیشتر",
      },
    },
    list: {
      noTasks: "هیچ وظیفه‌ای موجود نیست",
      openMenu: "باز کردن منو",
    },
  },
} as const;
