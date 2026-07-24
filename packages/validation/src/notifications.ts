import { z } from "zod";

export const registerPushTokenSchema = z.object({
  token: z.string().min(1, "Push token zorunludur."),
});
export type RegisterPushTokenInput = z.infer<typeof registerPushTokenSchema>;
