// actions/system.ts (Add this function)
import { db } from "@/lib/db";

export const getAboutStats = async () => {
  try {
    const generations = await db.history.count();
    return generations;
  } catch (error) {
    return 0;
  }
};