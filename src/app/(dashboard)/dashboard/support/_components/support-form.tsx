"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitTicket } from "@/actions/user"; // Create this action

export const SupportForm = () => {
    const [loading, setLoading] = useState(false);

    const onSubmit = async (formData: FormData) => {
        setLoading(true);
        try {
            await submitTicket(formData);
            toast.success("Ticket submitted successfully!");
        } catch {
            toast.error("Failed to submit");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form action={onSubmit} className="space-y-4">
            <Input name="subject" placeholder="Subject (e.g. Payment Failed)" required className="bg-black/20 border-white/10 text-white" />
            <Textarea name="message" placeholder="Describe your issue..." required className="bg-black/20 border-white/10 text-white min-h-[120px]" />
            <Button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500">
                {loading ? "Sending..." : "Submit Ticket"}
            </Button>
        </form>
    );
};