import { createFileRoute } from "@tanstack/react-router";

import { ProposalsPage } from "@/features/proposals/proposals-page";

export const Route = createFileRoute("/")({
  component: ProposalsPage,
});
