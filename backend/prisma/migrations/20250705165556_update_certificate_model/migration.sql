/*
  Warnings:

  - You are about to drop the column `url` on the `Certificate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[certificateNumber]` on the table `Certificate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[verificationCode]` on the table `Certificate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `certificateNumber` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enrollmentId` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verificationCode` to the `Certificate` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Certificate_userId_courseId_key";

-- AlterTable
ALTER TABLE "Certificate" DROP COLUMN "url",
ADD COLUMN     "certificateNumber" TEXT NOT NULL,
ADD COLUMN     "certificateUrl" TEXT,
ADD COLUMN     "enrollmentId" TEXT NOT NULL,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'completion',
ADD COLUMN     "verificationCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_certificateNumber_key" ON "Certificate"("certificateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_verificationCode_key" ON "Certificate"("verificationCode");

-- CreateIndex
CREATE INDEX "Certificate_enrollmentId_idx" ON "Certificate"("enrollmentId");

-- CreateIndex
CREATE INDEX "Certificate_verificationCode_idx" ON "Certificate"("verificationCode");

-- CreateIndex
CREATE INDEX "Certificate_certificateNumber_idx" ON "Certificate"("certificateNumber");

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
