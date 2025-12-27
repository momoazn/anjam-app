import { UserAvatar } from "@/components/user-avatar";
import { formatUserName } from "@/lib/utils";

export type MentionOption = {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
};

type MentionAutocompleteProps = {
  items: MentionOption[];
  selectedIndex: number;
  onSelect: (item: MentionOption) => void;
  onHover: (index: number) => void;
  visible: boolean;
};

export function MentionAutocomplete({
  items,
  selectedIndex,
  onSelect,
  onHover,
  visible,
}: MentionAutocompleteProps) {
  if (!visible || items.length === 0) return null;

  return (
    <div className="border-border/40 bg-card mt-2 max-h-56 overflow-auto rounded-xl border p-2 text-right shadow-sm">
      <div className="text-muted-foreground mb-2 text-[10px] font-bold tracking-tight">
        Mention
      </div>
      <div className="space-y-1">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item)}
            onMouseEnter={() => onHover(index)}
            className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs font-bold tracking-tight transition-all ${
              index === selectedIndex
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted/30"
            }`}
          >
            <span>
              @{item.username}
              <span className="text-muted-foreground/60 ms-2 text-[10px]">
                {formatUserName(item.firstName, item.lastName, item.username)}
              </span>
            </span>
            <UserAvatar
              user={{
                id: item.id,
                username: item.username,
                first_name: item.firstName,
                last_name: item.lastName,
                avatar: item.avatar,
              }}
              className="border-border/40 size-7 rounded-md border"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
