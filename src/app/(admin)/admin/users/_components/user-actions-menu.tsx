"use client";

import { useState } from "react";
import { MoreVertical, Shield, Ban, Coins, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner"; 
import { useRouter } from "next/navigation";
import { toggleBlockUser, giftCredits, deleteUser } from "@/actions/admin"; 

interface UserActionsProps {
  userId: string;
  isBlocked: boolean;
  currentCredits: number;
}

export const UserActionsMenu = ({ userId, isBlocked, currentCredits }: UserActionsProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onBlock = async () => {
    try {
      setLoading(true);
      await toggleBlockUser(userId, !isBlocked);
      toast.success(isBlocked ? "User Unblocked" : "User Blocked");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onGift = async () => {
    const amountStr = window.prompt("Enter amount to gift (e.g. 50 or -50 to remove):");
    if (!amountStr) return;
    
    const amount = parseInt(amountStr);
    if (isNaN(amount)) return toast.error("Invalid number");

    try {
      setLoading(true);
      await giftCredits(userId, amount);
      toast.success(`Credits updated by ${amount}`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update credits");
    } finally {
      setLoading(false);
    }
  };

  // 👇 ADDED: Delete Logic
  const onDelete = async () => {
    const confirm = window.confirm("Are you sure you want to delete this user? This cannot be undone.");
    if (!confirm) return;

    try {
      setLoading(true);
      await deleteUser(userId);
      toast.success("User deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreVertical className="h-4 w-4 text-white" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#1f2937] border-white/10 text-white">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(userId)}>
          Copy User ID
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        
        <DropdownMenuItem onClick={onGift} className="cursor-pointer hover:bg-white/10">
          <Coins className="mr-2 h-4 w-4 text-yellow-500" />
          Manage Credits
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onBlock} className="cursor-pointer hover:bg-white/10">
          {isBlocked ? (
             <><Shield className="mr-2 h-4 w-4 text-green-500" /> Unblock User</>
          ) : (
             <><Ban className="mr-2 h-4 w-4 text-red-500" /> Block User</>
          )}
        </DropdownMenuItem>

        {/* 👇 UPDATED: Attached onClick={onDelete} */}
        <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10 hover:bg-red-500/10">
           <Trash className="mr-2 h-4 w-4" /> Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};