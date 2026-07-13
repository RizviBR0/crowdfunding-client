import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../App.jsx";
import AppProviders from "../app/AppProviders.jsx";
import { ACCESS_TOKEN_KEY } from "../lib/tokenStorage.js";
import { restoreSession } from "../services/authService.js";
import { listSupporterOwnedContributions } from "../services/campaignService.js";

vi.mock("../services/authService.js", () => ({
  loginWithEmail: vi.fn(),
  loginWithGoogle: vi.fn(),
  logout: vi.fn(),
  registerWithEmail: vi.fn(),
  restoreSession: vi.fn(),
}));

vi.mock("../services/campaignService.js", async () => {
  const actual = await vi.importActual("../services/campaignService.js");
  return {
    ...actual,
    listSupporterOwnedContributions: vi.fn(),
    getSupporterContributionStats: vi.fn(),
  };
});

const supporterUser = {
  displayName: "Sam Supporter",
  email: "supporter@example.com",
  role: "supporter",
  credits: 50,
};

const contribution = {
  id: "contribution_1",
  campaignId: "campaign_1",
  campaignTitle: "Community Robotics Lab",
  supporterName: "Sam Supporter",
  supporterEmail: "supporter@example.com",
  amount: 75,
  status: "approved",
  createdAt: new Date("2026-07-13").toISOString(),
};

const renderAt = (path) => {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, "stored-token");
  restoreSession.mockResolvedValue(supporterUser);
  window.history.pushState({}, "", path);

  render(
    <AppProviders>
      <App />
    </AppProviders>,
  );
};

describe("supporter contributions page", () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    window.history.pushState({}, "", "/");
  });

  it("renders contributions, handles status filters, and supports pagination", async () => {
    const user = userEvent.setup();

    // Initial fetch (all, page 1)
    listSupporterOwnedContributions.mockResolvedValueOnce({
      contributions: [contribution],
      meta: {
        page: 1,
        limit: 10,
        totalItems: 11,
        totalPages: 2,
        hasNext: true,
        hasPrev: false,
      },
    });

    renderAt("/dashboard/supporter/contributions");

    expect(
      await screen.findByRole("heading", { name: /contribution history/i }),
    ).toBeInTheDocument();

    // Table renders contribution
    expect(
      await screen.findByText(/community robotics lab/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/75 credits/i)).toBeInTheDocument();
    expect(screen.getByText("approved")).toBeInTheDocument();

    // Pagination check
    expect(listSupporterOwnedContributions).toHaveBeenCalledWith({
      status: "all",
      page: 1,
      limit: 10,
    });
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument();

    // Next page mock
    listSupporterOwnedContributions.mockResolvedValueOnce({
      contributions: [
        {
          ...contribution,
          id: "contribution_2",
          campaignTitle: "Second Page Campaign",
        },
      ],
      meta: {
        page: 2,
        limit: 10,
        totalItems: 11,
        totalPages: 2,
        hasNext: false,
        hasPrev: true,
      },
    });

    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(
      await screen.findByText(/second page campaign/i),
    ).toBeInTheDocument();
    expect(listSupporterOwnedContributions).toHaveBeenCalledWith({
      status: "all",
      page: 2,
      limit: 10,
    });

    // Change status mock
    listSupporterOwnedContributions.mockResolvedValueOnce({
      contributions: [],
      meta: {
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    });

    const tabs = screen.getByRole("tablist", {
      name: /filter contributions by status/i,
    });
    await user.click(within(tabs).getByRole("tab", { name: /pending/i }));

    expect(
      await screen.findByText(/no contributions match this view/i),
    ).toBeInTheDocument();
    expect(listSupporterOwnedContributions).toHaveBeenCalledWith({
      status: "pending",
      page: 1,
      limit: 10,
    });
  });
});
