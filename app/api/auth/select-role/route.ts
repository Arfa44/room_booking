//app/api/auth/select-role/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { role } = await req.json();

    if (!role) {
      return NextResponse.json({ error: "Role tidak ditemukan" }, { status: 400 });
    }

    // simpan role di cookie
    const res = NextResponse.json({ success: true });
    res.cookies.set("selectedRole", role.toLowerCase(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
