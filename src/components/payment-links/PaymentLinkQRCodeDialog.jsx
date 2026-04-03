import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import QRCodeDisplay from "@/components/shared/QRCodeDisplay";
import { Copy, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function PaymentLinkQRCodeDialog({ open, onOpenChange, link }) {
  if (!link) return null;

  const checkoutUrl = `${window.location.origin}/Pay?slug=${encodeURIComponent(link.slug)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(checkoutUrl)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(checkoutUrl);
    toast.success("Link gekopieerd");
  };

  const handleDownload = () => {
    const anchor = document.createElement("a");
    anchor.href = qrUrl;
    anchor.download = `${link.slug}-qr.png`;
    anchor.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR-code voor {link.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-white p-4 flex justify-center">
            <QRCodeDisplay value={checkoutUrl} size={220} />
          </div>
          <p className="text-xs text-muted-foreground break-all">{checkoutUrl}</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleCopy}><Copy className="w-4 h-4" />Kopieer link</Button>
            <Button variant="outline" onClick={handleDownload}><Download className="w-4 h-4" />Download QR</Button>
            <Button onClick={() => window.open(checkoutUrl, "_blank")}><ExternalLink className="w-4 h-4" />Open link</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}