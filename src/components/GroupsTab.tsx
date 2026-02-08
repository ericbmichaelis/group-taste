import { Users } from "lucide-react";
import { GroupsList } from "./GroupsList";

export function GroupsTab() {
  return (
    <div className="p-4 pb-24">
      <div className="flex items-center gap-2 mb-4">
        <Users size={20} className="text-pink-500" />
        <h2 className="text-xl font-bold text-gray-900">Your Squad</h2>
      </div>
      <GroupsList />
    </div>
  );
}
