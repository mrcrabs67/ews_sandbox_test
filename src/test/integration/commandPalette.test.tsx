import {beforeEach, describe, expect, it} from "vitest";
import {screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {createMemoryRouter, RouterProvider} from "react-router-dom";
import {renderWithProviders} from "@/shared/testing/renderWithProviders";
import {WorkspaceShell} from "@/modules/workspace/ui/WorkspaceShell";
import {TicketDetailPage} from "@/modules/tickets/ui/TicketDetailPage";
import {TicketListPage} from "@/modules/tickets/ui/TicketListPage";
import {resetMockTicketsForTests} from "@/modules/tickets/api/ticketsApi";

const createTestRouter = (initialEntry: string) =>
    createMemoryRouter(
        [
            {
                path: "/",
                element: <WorkspaceShell/>,
                children: [
                    {index: true, element: <div>home</div>},
                    {path: "tickets", element: <TicketListPage/>},
                    {path: "tickets/:ticketId", element: <TicketDetailPage/>},
                ],
            },
        ],
        {initialEntries: [initialEntry]},
    );

describe("Command palette integration", () => {
    beforeEach(() => {
        resetMockTicketsForTests();
    });

    it("opens palette and marks ticket as reviewed", async () => {
        const router = createTestRouter("/tickets/TCK-1001");
        renderWithProviders(<RouterProvider router={router}/>);

        // Ждём загрузки тикета
        await screen.findByText("TCK-1001");

        // Открываем палитру Ctrl+K
        await userEvent.keyboard("{Meta>}k"); // для Mac; для Windows нужно {Control>}k – тест пройдёт в jsdom, т.к. оба обрабатываются
        // Ждём появления модального окна
        expect(await screen.findByText("Command palette")).toBeInTheDocument();

        // Находим и активируем команду
        const command = screen.getByText("Mark current ticket as reviewed");
        expect(command).toBeInTheDocument();
        await userEvent.click(command); // или можно использовать Enter, но клик надёжнее

        // Палитра закрыта, проверяем изменение статуса
        await waitFor(() => {
            expect(screen.getByText("reviewed")).toBeInTheDocument();
        });
    });
});