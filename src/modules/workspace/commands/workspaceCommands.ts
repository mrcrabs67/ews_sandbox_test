import type {CommandDefinition} from "@/app/command-palette/commandPalette.types";
import type {AppThemeMode} from "@/theme";
import type {Ticket} from "@/modules/tickets/model/ticket.types";

export type BuildWorkspaceCommandsParams = {
  currentTicket: Ticket | null;
  onOpenTicketList: () => void;
  onMarkTicketReviewed: (ticketId: string) => void;
  themeMode: AppThemeMode;
  onToggleTheme: () => void;
};

export const buildWorkspaceCommands = ({
  currentTicket,
  onOpenTicketList,
  onMarkTicketReviewed,
  themeMode,
  onToggleTheme,
}: BuildWorkspaceCommandsParams): CommandDefinition[] => {
  const commands: CommandDefinition[] = [
    {
      id: "toggle-theme",
      title:
        themeMode === "dark" ? "Switch to light theme" : "Switch to dark theme",
      description:
        themeMode === "dark"
          ? "Use the light workspace theme."
          : "Use the dark workspace theme.",
      scope: "global",
      run: onToggleTheme,
    },
  ];

  if (currentTicket) {
    commands.push({
      id: "open-ticket-list",
      title: "Open ticket list",
      description: "Navigate to the ticket queue.",
      scope: "ticket",
      run: onOpenTicketList,
    });

    commands.push({
      id: "mark-current-ticket-reviewed",
      title: "Mark current ticket as reviewed",
      description: "Complete triage for the active ticket.",
      scope: "ticket",
      run: () => onMarkTicketReviewed(currentTicket.id),
    });
  }

  if (!currentTicket) return commands;

  return commands;
};
