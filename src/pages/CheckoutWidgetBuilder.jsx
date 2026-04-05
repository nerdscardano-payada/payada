import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, Copy } from "lucide-react";

const assetOptions = ["ADA", "USDM", "SNEK", "HOSKY"];

function AssetToggle({ asset, active, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(asset)}
      className={`rounded-full border px-3 py-2 text-sm transition ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-secondary"}`}
    >
      {asset}
    </button>
  );
}

function WidgetPreview({ color, radius, assets }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div
        className="mx-auto max-w-sm border bg-white p-5"
        style={{ borderRadius: `${radius}px`, borderColor: color }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Embedded Checkout</p>
            <h3 className="text-lg font-semibold text-foreground">Pay with crypto</h3>
          </div>
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
        </div>

        <div className="space-y-3">
          <div className="rounded-lg bg-secondary p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Supported assets</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {assets.map((asset) => (
                <Badge key={asset} variant="secondary" className="bg-background text-foreground">
                  {asset}
                </Badge>
              ))}
            </div>
          </div>

          <button
            className="w-full px-4 py-3 text-sm font-medium text-white"
            style={{ backgroundColor: color, borderRadius: `${Math.max(radius - 4, 8)}px` }}
          >
            Continue to checkout
          </button>
        </div>
      </div>
    </div>
  );
}

function CodePreview({ code, copied, onCopy }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Generated snippet</CardTitle>
          <CardDescription>Paste this on the merchant’s external website.</CardDescription>
        </div>
        <Button onClick={onCopy} className="gap-2">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy code"}
        </Button>
      </CardHeader>
      <CardContent>
        <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
          <code>{code}</code>
        </pre>
      </CardContent>
    </Card>
  );
}

export default function CheckoutWidgetBuilder() {
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [borderRadius, setBorderRadius] = useState("16");
  const [supportedAssets, setSupportedAssets] = useState(["ADA", "USDM"]);
  const [copied, setCopied] = useState(false);

  const toggleAsset = (asset) => {
    setSupportedAssets((current) => {
      if (current.includes(asset)) {
        return current.length === 1 ? current : current.filter((item) => item !== asset);
      }
      return [...current, asset];
    });
  };

  const snippet = useMemo(() => {
    const config = {
      primaryColor,
      borderRadius: Number(borderRadius),
      supportedAssets,
    };

    return `<div id="payada-checkout-widget"></div>\n<script>\n  window.PayadaCheckoutWidget = ${JSON.stringify(config, null, 2)};\n<\/script>\n<script src="https://cdn.payada.app/widget.js" defer><\/script>`;
  }, [primaryColor, borderRadius, supportedAssets]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Checkout Widget Builder</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Configure an embeddable JavaScript checkout snippet for external merchant websites.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Widget settings</CardTitle>
            <CardDescription>Adjust the appearance and accepted crypto assets.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary color</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="primaryColor"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-12 w-16 p-1"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="borderRadius">Border radius (px)</Label>
              <Input
                id="borderRadius"
                type="number"
                min="0"
                max="32"
                value={borderRadius}
                onChange={(e) => setBorderRadius(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label>Supported crypto assets</Label>
              <div className="flex flex-wrap gap-2">
                {assetOptions.map((asset) => (
                  <AssetToggle
                    key={asset}
                    asset={asset}
                    active={supportedAssets.includes(asset)}
                    onToggle={toggleAsset}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <WidgetPreview
            color={primaryColor}
            radius={Number(borderRadius) || 0}
            assets={supportedAssets}
          />
          <CodePreview code={snippet} copied={copied} onCopy={handleCopy} />
        </div>
      </div>
    </div>
  );
}