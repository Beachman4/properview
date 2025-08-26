import { redirect } from "next/navigation";
import { Metadata } from "next";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Properview - Agent Dashboard",
  description: "Properview - Agent Dashboard",
};

export default function AgentPage() {
  return redirect("/agent/properties");
}
