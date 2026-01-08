import { useMemo, useRef, useState } from "react";

import { useOrganizationMembers } from "@/hooks/organization-members";
import { formatUserName } from "@/lib/utils";
import { useAuthUser } from "@/store/app-context-store";

export type MentionOption = {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  image?: string;
};

export function useCommentMentions() {
  const [content, setContent] = useState("");
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const [mentionCursor, setMentionCursor] = useState<number>(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentUser = useAuthUser();
  const { data: orgMembers } = useOrganizationMembers();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const mentionOptions = useMemo(() => {
    if (!orgMembers) return [];
    const normalized = mentionQuery.toLowerCase();
    return orgMembers
      .map((member) => member.expand?.user)
      .filter((user): user is NonNullable<typeof user> => Boolean(user))
      .filter((user) => {
        if (!normalized) return true;
        const fullName = formatUserName(
          user.firstName,
          user.lastName,
          user.username,
        ).toLowerCase();
        return (
          (user.username || "").toLowerCase().includes(normalized) ||
          fullName.includes(normalized)
        );
      })
      .map((user) => ({
        id: user._id,
        username: user.username || "",
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
      }));
  }, [orgMembers, mentionQuery]);

  const isMentionOpen = mentionStart !== null && mentionOptions.length > 0;

  const updateMentionState = (value: string, cursor: number) => {
    setMentionCursor(cursor);
    const textBefore = value.slice(0, cursor);
    const match = /(?:^|\s)@([\w.-]*)$/.exec(textBefore);
    if (!match) {
      setMentionStart(null);
      setMentionQuery("");
      return;
    }
    const query = match[1] ?? "";
    const startIndex = textBefore.lastIndexOf("@");
    setMentionStart(startIndex);
    setMentionQuery(query);
    setSelectedIndex(0);
  };

  const handleMentionSelect = (index: number) => {
    const option = mentionOptions[index];
    if (!option || mentionStart === null) return;
    const before = content.slice(0, mentionStart);
    const after = content.slice(mentionCursor);
    const mentionText = `@${option.username} `;
    const nextValue = `${before}${mentionText}${after}`;
    setContent(nextValue);
    setMentionStart(null);
    setMentionQuery("");
    requestAnimationFrame(() => {
      const nextCursor = before.length + mentionText.length;
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(nextCursor, nextCursor);
    });
  };

  return {
    content,
    setContent,
    mentionQuery,
    mentionStart,
    mentionCursor,
    selectedIndex,
    setSelectedIndex,
    currentUser,
    orgMembers,
    textareaRef,
    mentionOptions,
    isMentionOpen,
    updateMentionState,
    handleMentionSelect,
  };
}
