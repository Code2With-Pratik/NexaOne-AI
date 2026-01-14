"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquareReply } from "lucide-react";
import { adminReplyTicket } from "@/actions/support";
import { toast } from "sonner";

export const TicketReplyModal = ({ ticket }: { ticket: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reply, setReply] = useState(ticket.adminReply || "");
  const [status, setStatus] = useState(ticket.status);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await adminReplyTicket(ticket.id, reply, status);
      toast.success("Ticket updated");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to update ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10">
          <MessageSquareReply className="w-4 h-4 mr-2" />
          {ticket.status === "RESOLVED" ? "Edit Reply" : "Reply & Resolve"}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Reply to {ticket.user.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-gray-900 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea 
              value={reply} 
              onChange={(e) => setReply(e.target.value)} 
              placeholder="Type your reply here..." 
              className="bg-gray-900 border-gray-600 min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
            {loading ? "Sending..." : "Send Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};