-- CreateTable
CREATE TABLE "blacklistedTokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blacklistedTokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blacklistedTokens_token_key" ON "blacklistedTokens"("token");

-- CreateIndex
CREATE INDEX "blacklistedTokens_expiresAt_idx" ON "blacklistedTokens"("expiresAt");

-- CreateIndex
CREATE INDEX "blacklistedTokens_token_idx" ON "blacklistedTokens"("token");
