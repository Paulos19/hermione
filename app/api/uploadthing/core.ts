import { createUploadthing, type FileRouter } from "uploadthing/next";
import { verifyToken } from "@/lib/jwt";
import { auth } from "@/auth";

const f = createUploadthing();

// Helper to authenticate either via Next-Auth (Web) or JWT Bearer (Mobile)
async function authenticateUser(req: Request) {
  // Try Next-Auth (Web)
  const session = await auth();
  if (session?.user?.id) {
    return { id: session.user.id };
  }

  // Try JWT Bearer (Mobile)
  const authHeader = req.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const user = verifyToken(token);
    if (user && user.id) {
      return { id: user.id };
    }
  }

  throw new Error("Unauthorized");
}

export const ourFileRouter = {
  bookCover: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const user = await authenticateUser(req);
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),

  themeImage: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const user = await authenticateUser(req);
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),

  editorImage: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const user = await authenticateUser(req);
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),

  profileImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      try {
        const user = await authenticateUser(req);
        return { userId: user.id };
      } catch {
        return { userId: "onboarding" };
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
