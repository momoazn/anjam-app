export const TEXT = {
  app: {
    name: "Task Manager",
  },
  navigation: {
    dashboard: "Dashboard",
    projects: "Projects",
    tasks: "Tasks",
    settings: "Settings",
    quickCreate: {
      button: "Quick Create",
      tooltip: "Quick Create",
    },
  },
  header: {
    title: "Task Manager",
  },
  user: {
    dropdown: {
      account: "Account",
      logout: "Log out",
    },
  },
  auth: {
    login: {
      title: "Login",
      username: "Username",
      password: "Password",
      loginButton: "Login",
      registerButton: "Register",
      errors: {
        credentialsRequired: "Username and password are required",
        invalidCredentials: "Invalid username or password",
      },
    },
    register: {
      title: "Register",
      username: "Username",
      password: "Password",
      confirmPassword: "Confirm Password",
      registerButton: "Register",
      loginButton: "Back to Login",
      errors: {
        credentialsRequired: "Username and password are required",
        passwordsMismatch: "Passwords do not match",
      },
    },
  },
  tasks: {
    table: {
      columns: {
        id: "ID",
        status: "Status",
        title: "Title",
        deadline: "Deadline",
        assignedUser: "Assigned User",
        actions: "Actions",
      },
      selectAll: "Select all",
      selectRow: "Select row",
      dropdownMenu: {
        label: "Actions",
        copyId: "Copy task ID",
        viewCustomer: "View customer",
        viewDetails: "View payment details",
      },
    },
    priority: {
      urgent: "Urgent",
      high: "High",
      medium: "Medium",
      low: "Low",
    },
    status: {
      todo: "Todo",
      in_progress: "In Progress",
      done: "Done",
      canceled: "Canceled",
    },
    tags: {
      bug: "Bug",
      feature: "Feature",
      improvement: "Improvement",
    },
    addTask: {
      title: "New issue",
      issueTitle: "Issue title",
      description: "Add description...",
      unassigned: "Unassigned",
      assignee: "Assignee",
      priority: "Priority",
      status: "Status",
      buttons: {
        create: "Create Task",
        creating: "Creating...",
        more: "More options",
      },
    },
    list: {
      noTasks: "No Tasks",
      openMenu: "Open menu",
    },
  },
} as const;
