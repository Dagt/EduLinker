import { render, fireEvent, waitFor, act } from "@testing-library/react-native";

const mockApi = {
  getNotificationPreferences: jest.fn(),
  updateNotificationPreferences: jest.fn(),
};

jest.mock("../api", () => mockApi);
jest.mock("../notifications", () => ({
  registerForPushNotificationsAsync: jest.fn(),
}));
jest.mock("../role", () => ({
  getRole: jest.fn().mockResolvedValue("PADRE"),
}));
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn(),
}));

const NotificationSettings = require("../screens/NotificationSettings").default;
const api = require("../api");
const AsyncStorage = require("@react-native-async-storage/async-storage");

describe("NotificationSettings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("saves preference when toggling push", async () => {
    (api.getNotificationPreferences as jest.Mock).mockResolvedValue({
      push: true,
      email: true,
      event: true,
    });
    const { getByTestId } = render(<NotificationSettings />);
    await act(async () => {});
    await waitFor(() => expect(api.getNotificationPreferences).toHaveBeenCalled());
    const pushSwitch = getByTestId("push-switch");
    fireEvent(pushSwitch, "valueChange", false);
    await waitFor(() => {
      expect(api.updateNotificationPreferences).toHaveBeenCalledWith({
        push: false,
        email: true,
        event: true,
      });
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "notificationPrefs",
        JSON.stringify({ push: false, email: true, event: true })
      );
    });
  });

  it("saves preference when toggling a type", async () => {
    (api.getNotificationPreferences as jest.Mock).mockResolvedValue({
      push: true,
      email: true,
      event: true,
    });
    const { getByTestId } = render(<NotificationSettings />);
    await act(async () => {});
    await waitFor(() => expect(api.getNotificationPreferences).toHaveBeenCalled());
    const eventSwitch = getByTestId("event-switch");
    fireEvent(eventSwitch, "valueChange", false);
    await waitFor(() => {
      expect(api.updateNotificationPreferences).toHaveBeenCalledWith({
        push: true,
        email: true,
        event: false,
      });
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "notificationPrefs",
        JSON.stringify({ push: true, email: true, event: false })
      );
    });
  });
});

