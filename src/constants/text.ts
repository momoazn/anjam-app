export const TEXT = {
  app: {
    name: "Task Manager",
  },
  navigation: {
    dashboard: "Dashboard",
    projects: "Projects",
    tasks: "Tasks",
    settings: "Settings",
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
    },
    priority: {
      urgent: "Urgent",
      high: "High",
      medium: "Medium",
      low: "Low",
    },
    tags: {
      bug: "Bug",
      feature: "Feature",
      improvement: "Improvement",
    },
    addTask: {
      title: "Add Task",
      issueTitle: "Issue title",
      unassigned: "Unassigned",
    },
  },
} as const;
