import React from "react";
import { render, waitFor } from "@testing-library/react";
import EventDetail from "./EventDetail";
import { apiGet } from "@/lib/api";

jest.mock("@/lib/api", () => ({ apiGet: jest.fn() }));
jest.mock("@/lib/auth", () => ({ getToken: () => "tk" }));
jest.mock("./EventPhotoGallery", () => () => <div>gallery</div>);
jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (s: string) => s }) }));
jest.mock("@/i18n", () => ({}));

const api = apiGet as jest.Mock;

it("shows event data and attachments", async () => {
  api.mockResolvedValueOnce({ id: 1, title: "Meeting", start_at: "2025-01-01T10:00:00Z" });
  api.mockResolvedValueOnce([{ id: 2, file_url: "https://a", filename: "a.pdf" }]);
  const { getByText } = render(<EventDetail eventId={1} />);
  await waitFor(() => getByText("Meeting"));
  expect(getByText("a.pdf")).toBeTruthy();
  expect(getByText("gallery")).toBeTruthy();
});
