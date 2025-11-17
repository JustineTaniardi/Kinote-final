"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import "swagger-ui-react/swagger-ui.css";
import "./swagger.css"; // CSS override agar terang

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

const IS_PRODUCTION = process.env.NODE_ENV === "production";

export default function SwaggerPage() {
  const router = useRouter();

  useEffect(() => {
    // Suppress UNSAFE_componentWillReceiveProps warning from swagger-ui-react
    // This is a known issue in swagger-ui-react library and doesn't affect functionality
    const originalError = console.error as (...args: unknown[]) => void;

    const suppressedConsoleError = function (...args: unknown[]) {
      const errorString = String(args?.[0]) || "";
      if (
        errorString.includes("UNSAFE_componentWillReceiveProps") ||
        errorString.includes("ModelCollapse")
      ) {
        return;
      }
      originalError.apply(console, args);
    };

    console.error = suppressedConsoleError;

    return () => {
      console.error = originalError;
    };
  }, []);

  // Redirect in production
  if (IS_PRODUCTION) {
    router.replace("/");
    return null;
  }

  return (
    <div style={{ height: "100vh", background: "#fff" }}>
      <SwaggerUI
        url="/api/docs-json"
        docExpansion="list"
        defaultModelsExpandDepth={1}
      />
    </div>
  );
}
