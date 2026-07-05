-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL,
    "decisionDate" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "customSubject" TEXT,
    "createdBy" TEXT NOT NULL DEFAULT 'michelle.c@bam.org.my',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Decision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DecisionToSubject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DecisionToSubject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");

-- CreateIndex
CREATE INDEX "Decision_decisionDate_idx" ON "Decision"("decisionDate");

-- CreateIndex
CREATE INDEX "Decision_createdBy_idx" ON "Decision"("createdBy");

-- CreateIndex
CREATE INDEX "_DecisionToSubject_B_index" ON "_DecisionToSubject"("B");

-- AddForeignKey
ALTER TABLE "_DecisionToSubject" ADD CONSTRAINT "_DecisionToSubject_A_fkey" FOREIGN KEY ("A") REFERENCES "Decision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DecisionToSubject" ADD CONSTRAINT "_DecisionToSubject_B_fkey" FOREIGN KEY ("B") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

