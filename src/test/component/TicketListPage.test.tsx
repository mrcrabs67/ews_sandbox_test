import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/shared/testing/renderWithProviders";
import { TicketListPage } from "@/modules/tickets/ui/TicketListPage";
import * as recentStorage from "@/modules/workspace/state/recentTicketStorage";

// Мокаем модуль, чтобы контролировать возвращаемые id
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
        // TCK-1001 и TCK-1003 есть в моках, TCK-9999 – нет
        mockedRead.mockReturnValue(["TCK-1001", "TCK-9999", "TCK-1003"]);

        renderWithProviders(<TicketListPage />);

        // Дожидаемся загрузки списка (просто проверяем наличие известного тикета)
        await screen.findByText("TCK-1001");
        await screen.findByText("TCK-1003");

        // Проверяем, что отсутствующий id не отобразился
        expect(screen.queryByText("TCK-9999")).not.toBeInTheDocument();

        // Проверяем порядок: первый элемент в Recently opened должен быть TCK-1001
        const recentSection = screen.getByText("Recently opened").closest("div");
        const items = recentSection?.querySelectorAll("a"); // ссылки на тикеты
        expect(items?.[0]).toHaveTextContent("TCK-1001");
        expect(items?.[1]).toHaveTextContent("TCK-1003");
    });

    it("shows empty state when no recent tickets", async () => {
        mockedRead.mockReturnValue([]);
        renderWithProviders(<TicketListPage />);
        await screen.findByText("No recently opened tickets yet.");
        expect(
            screen.getByText("No recently opened tickets yet."),
        ).toBeInTheDocument();
    });
});