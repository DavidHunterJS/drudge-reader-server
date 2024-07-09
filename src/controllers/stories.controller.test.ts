import { Socket } from "socket.io";
import { connectionHandler } from "./stories.controller";
import Story from "../models/Story";

// Mock the Story model
jest.mock("../models/Story", () => ({
  find: jest.fn(),
  watch: jest.fn()
}));

describe("connectionHandler", () => {
  let mockSocket: Partial<Socket>;
  let mockChangeStream: any;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create a mock Socket
    mockSocket = {
      id: "test-socket-id",
      emit: jest.fn(),
      on: jest.fn()
    };

    // Create a mock ChangeStream
    mockChangeStream = {
      on: jest.fn(),
      close: jest.fn()
    };

    // Mock the Story.watch() to return our mock ChangeStream
    (Story.watch as jest.Mock).mockReturnValue(mockChangeStream);

    // Spy on console.log and console.error
    jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();
  });

  it("should log when a new client connects", () => {
    connectionHandler(mockSocket as Socket);
    expect(console.log).toHaveBeenCalledWith(
      "A new client connected",
      "test-socket-id"
    );
  });

  it("should send initial data on connection", async () => {
    const mockDocuments = [{ id: 1, title: "Test Story" }];
    (Story.find as jest.Mock).mockResolvedValueOnce(mockDocuments);

    await connectionHandler(mockSocket as Socket);

    expect(Story.find).toHaveBeenCalledWith({});
    expect(mockSocket.emit).toHaveBeenCalledWith(
      "initialDocuments",
      mockDocuments
    );
  });

  it("should emit an error if fetching initial data fails", async () => {
    const mockError = new Error("Database error");
    (Story.find as jest.Mock).mockRejectedValueOnce(mockError);

    await connectionHandler(mockSocket as Socket);

    expect(console.error).toHaveBeenCalledWith(
      "Error sending initial data:",
      mockError
    );
    expect(mockSocket.emit).toHaveBeenCalledWith(
      "error",
      "Failed to fetch initial data"
    );
  });

  it("should start watching for changes", () => {
    connectionHandler(mockSocket as Socket);

    expect(Story.watch).toHaveBeenCalled();
    expect(mockChangeStream.on).toHaveBeenCalledWith(
      "change",
      expect.any(Function)
    );
  });

  it("should update documents when a change is detected", async () => {
    const mockUpdatedDocuments = [{ id: 1, title: "Updated Story" }];
    (Story.find as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(mockUpdatedDocuments);

    connectionHandler(mockSocket as Socket);

    // Simulate a change event
    const changeCallback = mockChangeStream.on.mock.calls[0][1];
    await changeCallback({ operationType: "update" });

    expect(console.log).toHaveBeenCalledWith(
      "Change detected in Story collection",
      { operationType: "update" }
    );
    expect(Story.find).toHaveBeenCalledTimes(2);
    expect(mockSocket.emit).toHaveBeenCalledWith(
      "updateDocuments",
      mockUpdatedDocuments
    );
  });

  it("should emit an error if updating documents fails", async () => {
    const mockError = new Error("Update error");
    (Story.find as jest.Mock)
      .mockResolvedValueOnce([])
      .mockRejectedValueOnce(mockError);

    connectionHandler(mockSocket as Socket);

    // Simulate a change event
    const changeCallback = mockChangeStream.on.mock.calls[0][1];
    await changeCallback({ operationType: "update" });

    expect(console.error).toHaveBeenCalledWith(
      "Error updating documents:",
      mockError
    );
    expect(mockSocket.emit).toHaveBeenCalledWith(
      "error",
      "Failed to update documents"
    );
  });

  it("should close the change stream on disconnect", () => {
    connectionHandler(mockSocket as Socket);

    // Simulate a disconnect event
    const disconnectCallback = (mockSocket.on as jest.Mock).mock.calls[0][1];
    disconnectCallback();

    expect(console.log).toHaveBeenCalledWith(
      "Client disconnected, closing change stream"
    );
    expect(mockChangeStream.close).toHaveBeenCalled();
  });
});
