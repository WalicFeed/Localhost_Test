-- AlterTable: remove password column from User
ALTER TABLE "User" DROP COLUMN IF EXISTS "password";
