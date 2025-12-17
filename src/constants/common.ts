// Common strings used across multiple components
// This file now imports from shared.ts to avoid duplication

import { shared } from "./shared";

export const common = {
  cancel: shared.cancel,
  submit: shared.submit,
  delete: shared.delete,
  save: shared.save,
  saving: shared.saving,
  edit: shared.edit,
  create: shared.create,
  creating: shared.creating,
  update: shared.update,
  updating: shared.updating,
  loading: shared.loading,
  theme: {
    switchToLight: "روشن کردن صفحه",
    switchToDark: "تاریک کردن صفحه",
  },

  // Common button labels
  buttons: {
    ok: shared.ok,
    cancel: shared.cancel,
    save: shared.save,
    delete: shared.delete,
    edit: shared.edit,
    create: shared.create,
    update: "ذخیره تغییرات",
    close: shared.close,
    add: shared.add,
    remove: shared.remove,
    view: shared.view,
    search: shared.search,
    filter: shared.filter,
    clear: shared.clear,
    export: shared.export,
    import: shared.import,
    download: shared.download,
    upload: shared.upload,
    select: shared.select,
    selected: "انتخاب شده",
    all: shared.all,
    none: shared.none,
    yes: shared.yes,
    no: shared.no,
    multiSelect: "انتخاب چندتایی",
    cancelSelection: "لغو انتخاب",
    backToList: "بازگشت به لیست",
    back: shared.back,
    retry: shared.retry,
  },
  connectors: {
    and: "و",
  },

  // Validation messages
  validation: {
    required: shared.required,
  },

  // Common error/info messages
  messages: {
    notFound: shared.notFound,
    noData: shared.noData,
    noName: shared.noName,
    quickActions: "عملیات سریع",
  },

  // Common state labels
  states: {
    active: shared.active,
    inactive: shared.inactive,
    enabled: shared.enabled,
    disabled: shared.disabled,
    visible: "نمایان",
    hidden: "مخفی",
    success: shared.success,
    error: shared.error,
    warning: shared.warning,
    info: shared.info,
    pending: shared.pending,
    completed: shared.completed,
    inProgress: shared.inProgress,
    done: shared.done,
    canceled: shared.canceled,
  },

  // Pagination
  pagination: {
    page: "صفحه",
    of: "از",
    previous: shared.previous,
    next: shared.next,
    loginAttemptsLabel: "تلاش‌های ورود به سیستم",
  },

  // Calendar and date-related
  today: shared.today,
  previous: shared.previous,
  next: shared.next,
  more: shared.more,
  preview: shared.preview,

  time: {
    hoursShort: "ساعت",
    minutesShort: "دقیقه",
  },

  // Status labels
  total: shared.total,
  completed: shared.completed,
  pending: shared.pending,
} as const;
