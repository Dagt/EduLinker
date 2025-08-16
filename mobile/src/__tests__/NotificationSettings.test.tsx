import { render, fireEvent, waitFor } from "@testing-library/react-native";

const mockApi = {
  getNotificationChannels: jest.fn(),
  updateNotificationChannels: jest.fn(),
};

jest.mock("../api", () => mockApi);
jest.mock("../notifications", () => ({
  registerForPushNotificationsAsync: jest.fn(),
}));
jest.mock("../role", () => ({
  getRole: jest.fn().mockResolvedValue("PADRE"),
}));

const NotificationSettings = require("../screens/NotificationSettings").default;
const api = require("../api");

describe("NotificationSettings", () => {
  it("saves preference when toggling push", async () => {
    (api.getNotificationChannels as jest.Mock).mockResolvedValue({
      push: true,
      email: true,
    });
    const { getByTestId } = render(<NotificationSettings />);
    await waitFor(() => expect(api.getNotificationChannels).toHaveBeenCalled());
    const pushSwitch = getByTestId("push-switch");
    fireEvent(pushSwitch, "valueChange", false);
    await waitFor(() =>
      expect(api.updateNotificationChannels).toHaveBeenCalledWith({
        push: false,
        email: true,
      })
    );
  });
});

