import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiRole } from "@/lib/auth/guards";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function GET() {
  const auth = await requireApiRole("ADMIN");
  if ("error" in auth) return auth.error;

  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { weeks: true, users: true } } },
  });
  return NextResponse.json({ clients });
}

export async function POST(request: Request) {
  const auth = await requireApiRole("ADMIN");
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  if (!body?.name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const client = await prisma.client.create({
    data: {
      name: String(body.name),
      slug: slugify(body.slug || body.name),
      email: body.email ? String(body.email) : null,
      contactName: body.contactName ? String(body.contactName) : null,
      assumptions: {
        create: {
          defaultMpg: 6.5,
          defaultFuelPrice: 3.8,
          defaultMaintenancePerMile: 0.12,
          defaultFixedCostPerTruck: 900,
        }
      }
    }
  });

  return NextResponse.json({ client });
}
