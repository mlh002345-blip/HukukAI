import { z } from "zod";

export const subscribeSchema = z.object({
  plan: z.enum(["FREE", "INDIVIDUAL", "PRO"]),
});
export type SubscribeInput = z.infer<typeof subscribeSchema>;
