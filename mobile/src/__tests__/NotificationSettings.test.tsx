import { render, fireEvent, waitFor } from "@testing-library/react-native";

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
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const NotificationSettings = require("../screens/NotificationSettings").default;
const api = require("../api");
const AsyncStorage = require("@react-native-async-storage/async-storage");

describe("NotificationSettings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads preferences from API and stores them", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (api.getNotificationPreferences as jest.Mock).mockResolvedValue({
      push: true,
    });

    const { getByTestId } = render(<NotificationSettings />);

    await waitFor(() => expect(api.getNotificationPreferences).toHaveBeenCalled());
    const pushSwitch = getByTestId("push-switch");
    expect(pushSwitch.props.value).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "notificationPrefs",
      JSON.stringify({ push: true })
    );
  });

  it("updates preference when toggled", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (api.getNotificationPreferences as jest.Mock).mockResolvedValue({
      push: true,
      event: true,
    });

    const { getByTestId } = render(<NotificationSettings />);
    await waitFor(() => expect(api.getNotificationPreferences).toHaveBeenCalled());
    const pushSwitch = getByTestId("push-switch");
    fireEvent(pushSwitch, "valueChange", false);

    await waitFor(() => {
      expect(api.updateNotificationPreferences).toHaveBeenCalledWith({
        push: false,
        event: true,
      });
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "notificationPrefs",
        JSON.stringify({ push: false, event: true })
      );
    });
  });
});

