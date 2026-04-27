"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";

function Inner() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const target = `/marketplace/viewer/video${query ? `?${query}` : ""}`;
    router.replace(target);
  }, [router, params, searchParams]);

  return null;
}

export default function ViewerVideoIdRedirect() {
  return (
    <Suspense fallback={
      <div style={{ background: "#0A0E1A", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#6B7280" }}>Redirecting…</p>
      </div>
    }>
      <Inner />
    </Suspense>
  );
}
