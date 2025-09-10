//app/api/auth/select-role/route.ts
import { NextRequest, NextResponse } from "next/server";

const slugify = (str: string) =>
  str.toLowerCase().trim().replace(/\s+/g, "-");


export async function POST(req: NextRequest) {
  try {
    const { role } = await req.json();

    if (!role) {
      return NextResponse.json({ error: "Role tidak ditemukan" }, { status: 400 });
    }

     const roleSlug = slugify(role);
     
    // simpan role di cookie
    const res = NextResponse.json({ success: true });
    res.cookies.delete("selectedRole");
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
