import type { JobType } from "@prisma/client";

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  ORQUESTRA: "Orquestra",
  BANDA_FILARMONICA: "Banda filarmónica",
  JAZZ: "Jazz",
  CORO: "Coro",
  OUTRO: "Outro",
};

export const JOB_TYPE_ORDER: JobType[] = [
  "ORQUESTRA",
  "BANDA_FILARMONICA",
  "JAZZ",
  "CORO",
  "OUTRO",
];

export function isJobType(value: string): value is JobType {
  return (JOB_TYPE_ORDER as string[]).includes(value);
}
