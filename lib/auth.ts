import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPermissionSetFromUser, hasPermissionFromUser, type PermissionKey } from "@/lib/permissions";

const SESSION_TTL_DAYS = 30;
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "isp_auth_session";

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt
    }
  });

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    expires: expiresAt
  });
}

export async function destroyCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }

  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!session || session.expiresAt < new Date() || !session.user.active) {
    if (token) {
      await prisma.session.deleteMany({ where: { token } });
      cookieStore.delete(AUTH_COOKIE_NAME);
    }
    return null;
  }

  return session;
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function getCurrentPermissionSet() {
  const user = await getCurrentUser();
  return getPermissionSetFromUser(user);
}

export async function can(permission: PermissionKey) {
  const user = await getCurrentUser();
  return hasPermissionFromUser(user, permission);
}

export async function requirePermission(permission: PermissionKey, fallback = "/dashboard") {
  const user = await requireUser();
  if (!hasPermissionFromUser(user, permission)) {
    redirect(fallback);
  }
  return user;
}
