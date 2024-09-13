-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,
    "onboarding" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bundle" (
    "id" SERIAL NOT NULL,
    "bundleName" TEXT NOT NULL,
    "ProductBundleId" TEXT,
    "ProductHandle" TEXT,
    "description" TEXT,
    "discountType" TEXT,
    "discountValue" TEXT,
    "products" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "variants" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analytics" (
    "id" SERIAL NOT NULL,
    "revenue" TEXT NOT NULL,
    "orders" TEXT NOT NULL,
    "currency" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Bundle" ADD CONSTRAINT "Bundle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
