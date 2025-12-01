// Comments module constants
import { shared } from "./shared";

export const comments = {
  title: "نظرات",
  empty: {
    noComments: "هنوز نظری ثبت نشده",
    beFirst: "اولین نفری باشید که نظر می‌دهد!",
  },
  composer: {
    placeholder: "نظرتان را بنویسید...",
    placeholderDisabled: "برای ارسال نظر وارد شوید",
    send: "ارسال",
  },
  item: {
    deleted: "این نظر حذف شده",
    actions: "گزینه‌های نظر",
    edit: shared.edit,
    delete: shared.delete,
    deleting: shared.deleting,
    editPlaceholder: "ویرایش نظر...",
    saving: shared.saving,
    save: shared.save,
    cancel: shared.cancel,
    edited: "· ویرایش شده",
  },
} as const;
