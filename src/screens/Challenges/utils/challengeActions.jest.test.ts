import { Alert } from "react-native";
import { handleEndNow } from "./challengeActions";
import { endChallengeNow } from "@/src/lib/challenges/challengeApi";

jest.mock("@/src/lib/challenges/challengeApi", () => ({
  activateChallenge: jest.fn(),
  softDeleteChallenge: jest.fn(),
  endChallengeNow: jest.fn(),
}));

describe("handleEndNow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  it("opens confirmation alert", () => {
    handleEndNow({ id: "c1" } as any);
    expect(Alert.alert).toHaveBeenCalled();
  });

  it("calls optimistic + api when confirming", async () => {
    const optimistic = jest.fn();
    handleEndNow({ id: "c1" } as any, optimistic);

    const buttons = (Alert.alert as any).mock.calls[0][2];
    const confirmBtn = buttons.find((b: any) => b.text === "End now");

    await confirmBtn.onPress();

    expect(optimistic).toHaveBeenCalledWith("c1");
    expect(endChallengeNow).toHaveBeenCalledWith({ challengeId: "c1" });
  });
});
