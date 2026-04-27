"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ProductIdRedirect() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const id = params?.id ?? "1";
    router.replace(`/marketplace/product/${id}`);
  }, [router, params]);

  return (
    <div style={{
      background: "#0A0E1A", height: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#6B7280" }}>
        Redirecting…
      </p>
    </div>
  );
}
