CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"username" text,
	"email" text NOT NULL UNIQUE,
	"password" text NOT NULL,
	"isActive" boolean DEFAULT true,
	"isEmailVerified" boolean DEFAULT false,
	"refreshToken" text,
	"emailVerificationToken" text,
	"emailVerificationExpires" timestamp with time zone,
	"role" text DEFAULT 'user',
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
