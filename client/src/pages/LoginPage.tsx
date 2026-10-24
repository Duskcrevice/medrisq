import React from "react";
import PortalLoginGate from "@/components/PortalLoginGate";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0d161d] py-12 px-4 flex items-center justify-center">
      <PortalLoginGate defaultType="doctor" redirectTo="/app/rx-safety" />
    </div>
  );
}
