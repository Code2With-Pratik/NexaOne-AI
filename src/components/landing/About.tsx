// components/landing/About.tsx (Server Component)

import React from "react";
import { getSystemStatus } from "@/actions/system"; // Existing action
import { getAboutStats } from "@/actions/activity"; // The new action created in Step 1
import { AboutClient } from "./AboutClient";

export const About = async () => {
  // 1. Fetch System Status
  const settings = await getSystemStatus();
  const isMaintenance = settings?.maintenanceMode || false;

  // 2. Fetch Activity Count (Generations)
  const activityCount = await getAboutStats();

  // 3. Render Client Component with Data
  return (
    <AboutClient 
      isMaintenance={isMaintenance} 
      activityCount={activityCount} 
    />
  );
};