import { render, screen } from "@testing-library/react";
import EventPhotoGallery from "./EventPhotoGallery";
import { apiGet } from "@/lib/api";

jest.mock("@/lib/api");
jest.mock("@/lib/auth", () => ({ getToken: () => "token" }));

const mockedApiGet = apiGet as jest.MockedFunction<typeof apiGet>;

describe("EventPhotoGallery", () => {
  it("fetches and displays photos", async () => {
    mockedApiGet.mockResolvedValueOnce([
      { id: 1, photo_url: "http://example.com/a.jpg", caption: "A" },
    ]);

    render(<EventPhotoGallery eventId={1} />);

    const img = await screen.findByAltText("A");
    expect(img).toHaveAttribute("src", "http://example.com/a.jpg");
    expect(mockedApiGet).toHaveBeenCalledWith("/events/1/photos/", "token");
  });
});
