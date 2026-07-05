export const SUBJECT_NAMES = [
  "Administration",
  "Allowances",
  "BAM Committee",
  "Coach Education",
  "Coaches",
  "Commercial",
  "Council",
  "Development",
  "Finance",
  "Governance",
  "HR",
  "JET",
  "Media",
  "National Junior Players",
  "National Players",
  "National Senior Players",
  "National Tournaments",
  "Others",
  "Ranking",
  "State BA",
  "State Grants",
  "State Players",
  "Strategy",
  "SUKMA",
  "Tangkis 2030",
  "Technical Official",
] as const;

export type SubjectName = (typeof SUBJECT_NAMES)[number];

export const OTHERS_SUBJECT = "Others" as const;
