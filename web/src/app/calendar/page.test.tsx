import { render, fireEvent, waitFor } from "@testing-library/react";
import Calendar from "./page";
import { getToken } from "@/lib/auth";
import { apiGet, authHeaders } from "@/lib/api";
import { NextIntlClientProvider } from "next-intl";
import en from "@/i18n/en.json";

jest.mock("@/lib/auth");
jest.mock("@/lib/api");

describe("Calendar ICS download", () => {
  beforeEach(() => {
    (getToken as jest.Mock).mockReturnValue("token");
    (apiGet as jest.Mock).mockResolvedValue([]);
    (authHeaders as jest.Mock).mockReturnValue({
      Authorization: "Bearer token",
      "X-School-ID": "1",
    });
    process.env.NEXT_PUBLIC_API_URL = "http://api";
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob(["data"], { type: "text/calendar" }),
    }) as any;
  });

  afterEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  it("sends auth headers when downloading ICS", async () => {
    const urlSpy = jest.fn().mockReturnValue("blob:ics");
    (URL as any).createObjectURL = urlSpy;

    const { getByText } = render(
      <NextIntlClientProvider locale="en" messages={en}>
        <Calendar />
      </NextIntlClientProvider>
    );

    await waitFor(() => expect(apiGet).toHaveBeenCalled());
    fireEvent.click(getByText(/Download ICS|Descargar ICS/));
    expect(global.fetch).toHaveBeenCalledWith("http://api/events/ics/", {
      headers: { Authorization: "Bearer token", "X-School-ID": "1" },
    });
  });
});
