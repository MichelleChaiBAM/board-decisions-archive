import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { OTHERS_SUBJECT } from "@/lib/subjects";
import { ANONYMOUS_USER_EMAIL } from "@/lib/auth";

export const decisionInclude = {
  subjects: { orderBy: { name: "asc" as const } },
} satisfies Prisma.DecisionInclude;

export type DecisionWithSubjects = Prisma.DecisionGetPayload<{
  include: typeof decisionInclude;
}>;

export type DecisionSearchParams = {
  query?: string;
  subjects?: string[];
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
};

export type DecisionSearchResult = {
  decisions: DecisionWithSubjects[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type SubjectRecord = {
  id: string;
  name: string;
};

export async function getSubjects(): Promise<SubjectRecord[]> {
  return prisma.subject.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

function buildWhereClause(
  params: DecisionSearchParams
): Prisma.DecisionWhereInput {
  const andConditions: Prisma.DecisionWhereInput[] = [];

  if (params.query?.trim()) {
    const q = params.query.trim();
    andConditions.push({
      OR: [
        { title: { contains: q } },
        { description: { contains: q } },
        { keywords: { contains: q } },
      ],
    });
  }

  if (params.subjects && params.subjects.length > 0) {
    const subjectFilters: Prisma.DecisionWhereInput[] = [];
    const namedSubjects = params.subjects.filter((s) => s !== OTHERS_SUBJECT);

    if (namedSubjects.length > 0) {
      subjectFilters.push({
        subjects: { some: { name: { in: namedSubjects } } },
      });
    }

    if (params.subjects.includes(OTHERS_SUBJECT)) {
      subjectFilters.push({
        AND: [
          { customSubject: { not: null } },
          { NOT: { customSubject: "" } },
        ],
      });
    }

    if (subjectFilters.length > 0) {
      andConditions.push({ OR: subjectFilters });
    }
  }

  if (params.dateFrom || params.dateTo) {
    const decisionDate: Prisma.DateTimeFilter = {};
    if (params.dateFrom) {
      decisionDate.gte = new Date(params.dateFrom);
    }
    if (params.dateTo) {
      const end = new Date(params.dateTo);
      end.setHours(23, 59, 59, 999);
      decisionDate.lte = end;
    }
    andConditions.push({ decisionDate });
  }

  if (andConditions.length === 0) return {};
  if (andConditions.length === 1) return andConditions[0];
  return { AND: andConditions };
}

export async function searchDecisions(
  params: DecisionSearchParams
): Promise<DecisionSearchResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 10));
  const skip = (page - 1) * pageSize;
  const where = buildWhereClause(params);

  const [decisions, total] = await Promise.all([
    prisma.decision.findMany({
      where,
      include: decisionInclude,
      orderBy: { decisionDate: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.decision.count({ where }),
  ]);

  return {
    decisions,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

export async function getDecisionById(
  id: string
): Promise<DecisionWithSubjects | null> {
  return prisma.decision.findUnique({
    where: { id },
    include: decisionInclude,
  });
}

export async function getRecentDecisions(
  limit = 3
): Promise<DecisionWithSubjects[]> {
  return prisma.decision.findMany({
    include: decisionInclude,
    orderBy: { decisionDate: "desc" },
    take: limit,
  });
}

export type CreateDecisionInput = {
  decisionDate: string;
  title: string;
  subjectNames: string[];
  customSubject?: string;
  keywords: string;
  description: string;
  createdBy?: string;
};

export async function deleteDecision(id: string): Promise<void> {
  // Implicit many-to-many junction rows are removed automatically by Prisma
  await prisma.decision.delete({ where: { id } });
}

export async function createDecision(
  input: CreateDecisionInput
): Promise<DecisionWithSubjects> {
  const hasOthers = input.subjectNames.includes(OTHERS_SUBJECT);

  return prisma.decision.create({
    data: {
      decisionDate: new Date(input.decisionDate),
      title: input.title.trim(),
      keywords: input.keywords.trim(),
      description: input.description.trim(),
      createdBy: input.createdBy?.trim().toLowerCase() || ANONYMOUS_USER_EMAIL,
      customSubject:
        hasOthers && input.customSubject?.trim()
          ? input.customSubject.trim()
          : null,
      subjects: {
        connect: input.subjectNames.map((name) => ({ name })),
      },
    },
    include: decisionInclude,
  });
}
