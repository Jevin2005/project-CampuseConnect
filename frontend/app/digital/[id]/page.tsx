"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function DigitalIdRedirect() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const id = params?.id;
    if (id) {
      router.replace(`/marketplace/digital/${id}`);
    }
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
