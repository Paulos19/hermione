-- CreateTable
CREATE TABLE "BookShareCode" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "permissions" TEXT[] DEFAULT ARRAY['READ']::TEXT[],
    "expiresAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookShareCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookCollaborator" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permissions" TEXT[] DEFAULT ARRAY['READ']::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookCollaborator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookShareCode_code_key" ON "BookShareCode"("code");

-- CreateIndex
CREATE INDEX "BookShareCode_bookId_idx" ON "BookShareCode"("bookId");

-- CreateIndex
CREATE INDEX "BookCollaborator_bookId_idx" ON "BookCollaborator"("bookId");

-- CreateIndex
CREATE INDEX "BookCollaborator_userId_idx" ON "BookCollaborator"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BookCollaborator_bookId_userId_key" ON "BookCollaborator"("bookId", "userId");

-- AddForeignKey
ALTER TABLE "BookShareCode" ADD CONSTRAINT "BookShareCode_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookCollaborator" ADD CONSTRAINT "BookCollaborator_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookCollaborator" ADD CONSTRAINT "BookCollaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
