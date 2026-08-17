import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { createGrievance, fetchTracking, loadFormOptions } from "./public.server";

export const getFormOptions = createServerFn({ method: "GET" }).handler(async () =>
  loadFormOptions(),
);

export const submitGrievance = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        operator_name: z.string().trim().min(2).max(120),
        operator_id: z.string().trim().min(2).max(60),
        mobile_number: z
          .string()
          .trim()
          .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
        centre_name: z.string().trim().min(2).max(160),
        district: z.string().trim().min(2).max(80),
        training_location: z.string().trim().min(2).max(160),
        trainer_id: z.string().uuid(),
        training_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        category: z.string().trim().min(2).max(80),
        subject: z.string().trim().min(4).max(160),
        description: z.string().trim().min(10).max(4000),
        priority: z.enum(["Low", "Medium", "High", "Critical"]),
        attachment: z
          .object({
            name: z.string().max(200),
            type: z.string().max(120),
            dataBase64: z.string().max(7_000_000),
          })
          .nullable()
          .optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => createGrievance({ ...data, attachment: data.attachment ?? null }));

export const trackGrievance = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ grievance_id: z.string().trim().min(4).max(40) }).parse(data),
  )
  .handler(async ({ data }) => {
    const result = await fetchTracking(data.grievance_id);
    return { found: !!result, grievance: result };
  });
