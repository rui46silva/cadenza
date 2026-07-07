-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MASCULINO', 'FEMININO');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gender" "Gender";
