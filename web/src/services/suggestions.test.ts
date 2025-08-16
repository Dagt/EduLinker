import { listSuggestions, createSuggestion, getSuggestion, deleteSuggestion } from "./suggestions";
import { apiGet, apiPost, apiDelete } from "@/lib/api";

jest.mock("@/lib/api");
jest.mock("@/lib/auth", () => ({ getToken: () => "token" }));

describe("suggestions service", () => {
  it("lists suggestions", async () => {
    (apiGet as jest.Mock).mockResolvedValue([{ id: 1 }]);
    const res = await listSuggestions();
    expect(apiGet).toHaveBeenCalledWith("/suggestions/", "token");
    expect(res).toEqual([{ id: 1 }]);
  });

  it("creates suggestion", async () => {
    (apiPost as jest.Mock).mockResolvedValue({ id: 2 });
    const res = await createSuggestion({ title: "t", description: "d" });
    expect(apiPost).toHaveBeenCalledWith("/suggestions/", { title: "t", description: "d" }, "token");
    expect(res).toEqual({ id: 2 });
  });

  it("gets suggestion", async () => {
    (apiGet as jest.Mock).mockResolvedValue({ id: 3 });
    const res = await getSuggestion(3);
    expect(apiGet).toHaveBeenCalledWith("/suggestions/3/", "token");
    expect(res).toEqual({ id: 3 });
  });

  it("deletes suggestion", async () => {
    (apiDelete as jest.Mock).mockResolvedValue(undefined);
    await deleteSuggestion(4);
    expect(apiDelete).toHaveBeenCalledWith("/suggestions/4/", "token");
  });
});
