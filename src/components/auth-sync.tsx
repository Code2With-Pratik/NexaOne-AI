"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import axios from "axios";

export const AuthSync = () => {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      // Send user data to our backend to ensure they exist in DB
      axios.post("/api/auth/sync", {
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName || user.username || "Anonymous",
        image: user.imageUrl,
      }).catch(err => console.error("Auth Sync Error:", err));
    }
  }, [isLoaded, user]);

  return null; // This component is invisible
};