import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfileSetupStep({ data, onChange }) {
  const handleInputChange = (field, value) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Business Profile</CardTitle>
          <CardDescription>
            Tell us about your business so we can set everything up correctly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="business_name">Business Name *</Label>
            <Input
              id="business_name"
              placeholder="e.g., Acme Corp"
              value={data.business_name || ""}
              onChange={(e) => handleInputChange("business_name", e.target.value)}
              required
            />
            <p className="text-xs text-slate-500">
              This will be displayed to your customers during payment
            </p>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website_url">Website URL</Label>
            <Input
              id="website_url"
              type="url"
              placeholder="https://example.com"
              value={data.website_url || ""}
              onChange={(e) => handleInputChange("website_url", e.target.value)}
            />
          </div>

          {/* Default Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency">Preferred Fiat Currency *</Label>
            <Select
              value={data.default_fiat_currency || "EUR"}
              onValueChange={(value) =>
                handleInputChange("default_fiat_currency", value)
              }
            >
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              We'll convert ADA payments to this currency for reporting
            </p>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={data.timezone || "UTC"}
              onValueChange={(value) => handleInputChange("timezone", value)}
            >
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                <SelectItem value="Europe/London">Europe/London</SelectItem>
                <SelectItem value="America/New_York">America/New_York</SelectItem>
                <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cardano Address */}
          <div className="space-y-2">
            <Label htmlFor="receive_address">Cardano Receive Address *</Label>
            <Input
              id="receive_address"
              placeholder="addr1..."
              value={data.default_receive_address || ""}
              onChange={(e) =>
                handleInputChange("default_receive_address", e.target.value)
              }
              required
            />
            <p className="text-xs text-slate-500">
              ADA payments will be sent to this address
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}