"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// 1. Get Status (Used by Footer)
export async function getSystemStatus() {
  // Try to find the settings row
  let settings = await db.systemSettings.findFirst();

  // If it doesn't exist (first run), create it
  if (!settings) {
    settings = await db.systemSettings.create({
      data: { maintenanceMode: false }
    });
  }

  return settings;
}

// 2. Toggle Status (Used by Admin Dashboard)
export async function toggleMaintenanceMode() {
  const settings = await getSystemStatus();

  await db.systemSettings.update({
    where: { id: settings.id },
    data: { maintenanceMode: !settings.maintenanceMode }
  });

  revalidatePath("/"); // Refresh the whole app so Footer updates immediately
  return { success: true };
}