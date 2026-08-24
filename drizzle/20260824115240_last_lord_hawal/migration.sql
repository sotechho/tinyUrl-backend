CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"username" text,
	"email" text NOT NULL UNIQUE,
	"password" text NOT NULL,
	"isActive" boolean DEFAULT true,
	"isEmailVerified" boolean DEFAULT false,
	"refreshToken" text,
	"emailVerificationToken" text,
	"emailVerificationExpires" date,
	"role" text DEFAULT 'user',
	"createdAt" date DEFAULT now() NOT NULL,
	"updatedAt" date DEFAULT now() NOT NULL
);
