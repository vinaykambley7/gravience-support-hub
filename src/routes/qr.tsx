import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, Printer } from "lucide-react";
import { useEffect, useState } from "react";

import { AuthGate } from "@/components/AuthGate";
import { StaffShell } from "@/components/StaffShell";
import { Button } from "@/components/ui/button";
import { getSettings } from "@/lib/admin.functions";
import { FALLBACK_PUBLIC_BASE_URL, PORTAL_NAME, PORTAL_SUBTITLE } from "@/lib/constants";

export const Route = createFileRoute("/qr")({
  head: () => ({
    meta: [
      { title: "Operator QR Code — Aadhaar Training Support" },
      {
        name: "description",
        content:
          "Admin QR management: download or print the common operator QR code that opens the grievance portal.",
      },
      { property: "og:title", content: "Operator QR Code — Aadhaar Training Support" },
      { property: "og:description", content: "Download and print the operator portal QR code." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: QrPage,
});

function resolveBase(configured: string | undefined) {
  if (configured && configured.trim()) return configured.trim().replace(/\/$/, "");
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    if (!/localhost|127\.0\.0\.1/.test(origin)) return origin.replace(/\/$/, "");
  }
  return FALLBACK_PUBLIC_BASE_URL.replace(/\/$/, "");
}

function QrPage() {
  return (
    <AuthGate require="admin" loginPath="/admin/login">
      {() => (
        <StaffShell
          area="Admin Portal"
          loginPath="/admin/login"
          userLabel="Administrator"
          navItems={[
            { label: "Dashboard", to: "/admin/dashboard" },
            { label: "Analytics", to: "/admin/analytics" },
            { label: "QR Code", to: "/qr" },
          ]}
        >
          <QrManager />
        </StaffShell>
      )}
    </AuthGate>
  );
}

function QrManager() {
  const settingsFn = useServerFn(getSettings);
  const { data: settings } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => settingsFn(),
  });

  const target = `${resolveBase(settings?.["public_base_url"])}/operator`;
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    let active = true;
    void import("qrcode").then(async (qrcode) => {
      const url = await qrcode.toDataURL(target, {
        width: 1024,
        margin: 2,
        errorCorrectionLevel: "H",
      });
      if (active) setDataUrl(url);
    });
    return () => {
      active = false;
    };
  }, [target]);

  const printPoster = () => {
    if (!dataUrl) return;
    const win = window.open("", "_blank", "width=900,height=1200");
    if (!win) return;
    win.document.write(`<!doctype html><html><head><title>Operator QR Poster</title>
<style>
  @page { size: A4; margin: 0; }
  html,body { margin:0; padding:0; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; color:#0f172a; }
  .poster { width:210mm; height:297mm; box-sizing:border-box; padding:22mm 18mm; display:flex; flex-direction:column; align-items:center; text-align:center; }
  h1 { font-size:34pt; letter-spacing:1px; margin:0; text-transform:uppercase; }
  h2 { font-size:17pt; font-weight:500; margin:6mm 0 0; color:#3f4a5a; }
  img { width:118mm; height:118mm; margin:16mm 0 10mm; }
  .cta { font-size:15pt; font-weight:600; margin:0; }
  .url { margin-top:8mm; font-size:11pt; color:#5a6572; word-break:break-all; }
  .foot { margin-top:auto; font-size:10pt; color:#7b8492; }
</style></head><body>
<div class="poster">
  <h1>${PORTAL_NAME}</h1>
  <h2>${PORTAL_SUBTITLE}</h2>
  <img src="${dataUrl}" alt="Operator portal QR code" />
  <p class="cta">Scan to submit or track a training grievance</p>
  <p class="url">${target}</p>
  <p class="foot">No account required for operators.</p>
</div>
<script>window.onload = function(){ window.focus(); window.print(); };</script>
</body></html>`);
    win.document.close();
  };

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-xl font-semibold">QR Code Management</h1>
      <p className="mt-1 mb-5 text-sm text-muted-foreground">
        One common QR for every training venue. Scanning it opens the operator portal where
        operators can submit or track a grievance.
      </p>

      <div className="card-surface grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-start">
        <div className="mx-auto rounded-xl border border-border bg-white p-3">
          {dataUrl ? (
            <img src={dataUrl} alt="Operator portal QR code" className="size-56" />
          ) : (
            <div className="size-56 animate-pulse rounded bg-muted" />
          )}
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              QR destination
            </p>
            <p className="mt-1 text-sm font-medium break-all">{target}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild disabled={!dataUrl}>
              <a href={dataUrl || "#"} download="operator-portal-qr.png">
                <Download className="mr-1.5 size-4" /> Download QR
              </a>
            </Button>
            <Button variant="outline" onClick={() => window.print()} disabled={!dataUrl}>
              <Printer className="mr-1.5 size-4" /> Print QR
            </Button>
            <Button variant="outline" onClick={printPoster} disabled={!dataUrl}>
              <Printer className="mr-1.5 size-4" /> A4 Poster
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            The destination uses the public base URL from Admin → Settings. Update it there if the
            portal moves to a custom domain.
          </p>
        </div>
      </div>
    </div>
  );
}
