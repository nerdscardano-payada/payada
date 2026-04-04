import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export default function EmbedCodeDialog({ open, onOpenChange, title, description, htmlCode, jsCode }) {
  const handleCopy = async (value, label) => {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-900">HTML embed</p>
              <Button type="button" variant="outline" size="sm" onClick={() => handleCopy(htmlCode, "HTML embed code")}>
                <Copy className="mr-2 h-4 w-4" /> Copy
              </Button>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap break-all text-xs text-slate-700">{htmlCode}</pre>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-900">JavaScript embed</p>
              <Button type="button" variant="outline" size="sm" onClick={() => handleCopy(jsCode, "JavaScript embed code")}>
                <Copy className="mr-2 h-4 w-4" /> Copy
              </Button>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap break-all text-xs text-slate-700">{jsCode}</pre>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}