import { Edit, Trash } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TEXT } from "@/constants/text";
import { UsersResponse } from "@/lib/pocketbase-types";

interface UserListTableProps {
  users: UsersResponse[];
  onEdit: (user: UsersResponse) => void;
  onDelete: (user: UsersResponse) => void;
  isAdmin: boolean;
}

export function UserListTable({
  users,
  onEdit,
  onDelete,
  isAdmin,
}: UserListTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-right">
            {TEXT.users.table.columns.user}
          </TableHead>
          <TableHead className="text-right">
            {TEXT.users.table.columns.username}
          </TableHead>
          <TableHead className="text-right">
            {TEXT.users.table.columns.role}
          </TableHead>
          {isAdmin && (
            <TableHead className="w-[100px] text-center">
              {TEXT.users.table.columns.actions}
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="flex text-right">
              <div className="flex items-center justify-end gap-2 self-start">
                <Avatar className="size-8">
                  <AvatarImage src={user.avatar} alt={user.username} />
                  <AvatarFallback>
                    {user.first_name?.[0]}
                    {user.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {user.first_name} {user.last_name}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-right">{user.username}</TableCell>
            <TableCell className="text-right capitalize">
              {TEXT.users.table.roles[user.role]}
            </TableCell>
            {isAdmin && (
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(user)}
                  >
                    <Edit className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600"
                    onClick={() => onDelete(user)}
                  >
                    <Trash className="size-4" />
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
