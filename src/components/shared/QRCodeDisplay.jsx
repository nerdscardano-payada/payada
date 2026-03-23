import React from "react";

export default function QRCodeDisplay({ value, size = 200 }) {
  if (!value) return null;

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;

  return (
    <img
      src={qrSrc}
      alt="QR code"
      width={size}
      height={size}
      className="block"
    />
  );
}