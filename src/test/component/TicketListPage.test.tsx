import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react"; // добавили waitFor
import { MemoryRouter } from "react-router-dom";
import { renderWithProviders } from "@/shared/testing/renderWithProviders";
import { TicketListPage } from "@/modules/tickets/ui/TicketListPage";
import * as recentStorage from "@/modules/workspace/state/recentTicketStorage";

vi.mock("@/modules/workspace/state/recentTicketStorage", () => ({
    readRecentTicketIds: vi.fn(),
    rememberRecentTicketId: vi.fn(),
}));

const mockedRead = recentStorage.readRecentTicketIds as ReturnType<typeof vi.fn>;

describe("TicketListPage – recently opened", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("shows recent tickets that exist in the API", async () => {
        mockedRead.mockReturnValue(["TCK-1001", "TCK-9999", "TCK-1003"]);

        renderWithProviders(
            <MemoryRouter initialEntries={["/tickets"]}>
                <TicketListPage />
            </MemoryRouter>,
        );

        // Ждём появления заголовка Recently opened
        const recentSection = await screen.findByText("Recently opened")
            .then(el => el.closest("div"));
        expect(recentSection).toBeInTheDocument();

        // Ждём, пока внутри блока появятся ссылки (список подгрузился)
        await waitFor(() => {
            const links = recentSection!.querySelectorAll("a");
            expect(links.length).toBeGreaterThan(0);
        });

        const links = recentSection!.querySelectorAll("a");
        const linkTexts = Array.from(links).map(link => link.textContent ?? "");

        // Проверяем наличие нужных ID и отсутствие ненужного
        expect(linkTexts.some(text => text.includes("TCK-1001"))).toBe(true);
        expect(linkTexts.some(text => text.includes("TCK-1003"))).toBe(true);
        expect(linkTexts.some(text => text.includes("TCK-9999"))).toBe(false);

        // Порядок: первый элемент – TCK-1001, второй – TCK-1003
        expect(links.length).toBeGreaterThanOrEqual(2);
        expect(links[0]).toHaveTextContent(/TCK-1001/);
        expect(links[1]).toHaveTextContent(/TCK-1003/);
    });

    it("shows empty state when no recent tickets", async () => {
        mockedRead.mockReturnValue([]);
        renderWithProviders(
            <MemoryRouter>
                <TicketListPage />
            </MemoryRouter>,
        );
        await screen.findByText("No recently opened tickets yet.");
        expect(screen.getByText("No recently opened tickets yet.")).toBeInTheDocument();
    });
});