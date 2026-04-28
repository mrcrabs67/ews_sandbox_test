import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import { AppThemeProvider } from "@/app/theme/AppThemeProvider";
import { makeTestStore } from "@/shared/testing/renderWithProviders";
import { WorkspaceShell } from "@/modules/workspace/ui/WorkspaceShell";
import { TicketDetailPage } from "@/modules/tickets/ui/TicketDetailPage";
import { TicketListPage } from "@/modules/tickets/ui/TicketListPage";
import { resetMockTicketsForTests } from "@/modules/tickets/api/ticketsApi";

const createTestRouter = (initialEntry: string) =>
    createMemoryRouter(
        [
            {
                path: "/",
                element: <WorkspaceShell />,
                children: [
                    { index: true, element: <div>home</div> },
                    { path: "tickets", element: <TicketListPage /> },
                    { path: "tickets/:ticketId", element: <TicketDetailPage /> },
                ],
            },
        ],
        { initialEntries: [initialEntry] },
    );

function renderWithFullProviders(ui: React.ReactElement) {
    const store = makeTestStore();
    return render(
        <Provider store={store}>
            <AppThemeProvider>
                {ui}
            </AppThemeProvider>
        </Provider>,
    );
}

describe("Command palette integration", () => {
    beforeEach(() => {
        resetMockTicketsForTests();
    });

    it("opens palette and marks ticket as reviewed", async () => {
        const router = createTestRouter("/tickets/TCK-1001");
        renderWithFullProviders(<RouterProvider router={router} />);

        // Ждём появления TCK-1001 (в заголовке h1)
        await screen.findByRole("heading", { name: /TCK-1001/i });

        // Открываем палитру Ctrl+K (Meta+K)
        await userEvent.keyboard("{Meta>}k");
        expect(await screen.findByRole("dialog", { name: /Command palette/i })).toBeInTheDocument();

        // Активируем команду
        const command = screen.getByText("Mark current ticket as reviewed");
        await userEvent.click(command);

        // Проверяем изменение статуса (должен появиться чип "reviewed")
        await waitFor(() => {
            expect(screen.getByText("reviewed")).toBeInTheDocument();
        });
    });
});