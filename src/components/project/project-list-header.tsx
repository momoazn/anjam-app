import { TEXT } from "@/constants/text";

export function ProjectListHeader() {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 px-2 py-2">
      <div className="flex min-w-0 flex-grow items-center gap-2">
        <span className="w-16 flex-shrink-0 text-xs font-medium text-gray-400">
          {TEXT.projects.table.columns.code}
        </span>
        <span className="flex-grow text-sm font-medium text-gray-400">
          {TEXT.projects.table.columns.name}
        </span>
      </div>
      <div className="flex flex-shrink-0 items-center gap-3">
        <span className="w-[60px] flex-shrink-0 text-right text-xs font-medium text-gray-400">
          {TEXT.projects.table.columns.created}
        </span>
        {/* Space for actions */}
        <div className="w-[52px]" />
      </div>
    </div>
  );
}
