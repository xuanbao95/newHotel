import fs from "fs";
import path from "path";

/**
 * Đảm bảo file public/login-bg.jpg tồn tại và dọn dẹp route xung đột.
 */
export function ensureLoginBg() {
  try {
    const targetPath = path.join(process.cwd(), "public", "login-bg.jpg");

    // 1. Kiểm tra và trích xuất file nếu chưa có
    if (!fs.existsSync(targetPath)) {
      const uploadedHtml = path.resolve(
        "C:/Users/User/.gemini/antigravity/brain/ffa6843a-a3e6-484b-9805-e23e977b037b/.user_uploaded/media_1791443346224_d982be3a.html"
      );

      if (fs.existsSync(uploadedHtml)) {
        const content = fs.readFileSync(uploadedHtml, "utf8");
        const match = content.match(/data:image\/jpeg;base64,([A-Za-z0-9+/=]+)/);
        if (match && match[1]) {
          const publicDir = path.dirname(targetPath);
          if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
          }
          fs.writeFileSync(targetPath, Buffer.from(match[1], "base64"));
          console.log("Successfully created public/login-bg.jpg.");
        }
      }
    }

    // 2. Dọn dẹp route trùng lặp app/login-bg.jpg/route.ts nếu có để Next.js dùng static server chuẩn
    const conflictRoute = path.join(process.cwd(), "app", "login-bg.jpg", "route.ts");
    if (fs.existsSync(conflictRoute)) {
      try {
        fs.unlinkSync(conflictRoute);
        const routeDir = path.dirname(conflictRoute);
        fs.rmdirSync(routeDir);
        console.log("Removed conflicting app/login-bg.jpg route.");
      } catch (err) {
        console.error("Cleanup conflict route error:", err);
      }
    }
  } catch (error) {
    console.error("ensureLoginBg error:", error);
  }
}
