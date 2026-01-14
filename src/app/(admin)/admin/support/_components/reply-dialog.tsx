"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { resolveTicket } from "@/actions/admin"; // We created this in previous steps
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";

export const ReplyDialog = ({ ticketId }: { ticketId: string; currentStatus: string }) => {
    const [open, setOpen] = useState(false);
    const [reply, setReply] = useState("");
    const [loading, setLoading] = useState(false);

    const onResolve = async (status: "RESOLVED" | "REJECTED") => {
        setLoading(true);
        try {
            await resolveTicket(ticketId, reply, status); // Need to update action to accept status
            toast.success(`Ticket ${status.toLowerCase()}`);
            setOpen(false);
        } catch {
            toast.error("Error updating ticket");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="border-indigo-500 text-indigo-400 hover:bg-indigo-500/10">
                    <MessageSquare className="w-4 h-4 mr-2" /> Reply
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1f2937] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Reply to User</DialogTitle>
                </DialogHeader>
                <Textarea 
                    value={reply} 
                    onChange={(e) => setReply(e.target.value)} 
                    placeholder="Type your response..."
                    className="bg-black/20 border-white/10 min-h-[100px]"
                />
                <div className="flex gap-2 justify-end mt-4">
                    <Button variant="destructive" onClick={() => onResolve("REJECTED")} disabled={loading}>
                        Reject
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-500" onClick={() => onResolve("RESOLVED")} disabled={loading || !reply}>
                        Solve & Send
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};