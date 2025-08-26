import AgentPropertyCreateForm from "@/components/AgentDashboard/AgentPropertyCreateForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Properview - New Property",
  description: "Properview - New Property",
};

export const runtime = "edge";

export default function NewPropertyPage() {
  return <AgentPropertyCreateForm />;
}
