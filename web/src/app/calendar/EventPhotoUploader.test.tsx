import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EventPhotoUploader from "./EventPhotoUploader";
import { apiPost } from "@/lib/api";

jest.mock("@/lib/api");
jest.mock("@/lib/auth", () => ({ getToken: () => "token" }));
jest.mock("@/components/UploadButton", () => ({ onUploaded }: any) => (
  <button onClick={() => onUploaded("http://example.com/a.jpg")}>upload</button>
));

const mockedApiPost = apiPost as jest.MockedFunction<typeof apiPost>;

describe("EventPhotoUploader", () => {
  it("uploads photo with caption", async () => {
    render(<EventPhotoUploader eventId={2} />);

    fireEvent.change(screen.getByPlaceholderText("Caption"), {
      target: { value: "hello" },
    });
    fireEvent.click(screen.getByText("upload"));

    await waitFor(() =>
      expect(mockedApiPost).toHaveBeenCalledWith(
        "/events/2/photos/",
        { photo_url: "http://example.com/a.jpg", caption: "hello" },
        "token"
      )
    );
  });
});
