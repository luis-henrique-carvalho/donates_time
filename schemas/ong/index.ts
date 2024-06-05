import { z } from "zod";

export const OngSchema = z.object({
  name: z.string().min(5),
  email: z.string().email(),
  whatsapp: z.string().min(10),
  city: z.string().min(3),
  uf: z.string().length(2),
});
