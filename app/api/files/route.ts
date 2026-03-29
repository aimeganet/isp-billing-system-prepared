import { readFile } from "node:fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "node:path";

const storageRoot = path.join(process.cwd(), "storage");

export async function GET(request: NextRequest) {
  const filePath = request.nextUrl.searchParams.get("path");

  if (!filePath) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  const absolutePath = path.resolve(process.cwd(), filePath);
  if (!absolutePath.startsWith(storageRoot)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    const buffer = await readFile(absolutePath);
    return new NextResponse(buffer);
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
