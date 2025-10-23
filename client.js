const { OPCUAClient, AttributeIds, TimestampsToReturn } = require("node-opcua");

const endpointUrl = "opc.tcp://localhost:4840"; // your server endpoint

(async () => {
  try {
    const client = OPCUAClient.create({ endpointMustExist: false });
    await client.connect(endpointUrl);
    console.log("Connected to", endpointUrl);

    const session = await client.createSession();
    console.log("Session created");

    // Example: read server’s current time
    const nodeToRead = {
      nodeId: "ns=0;i=2258", // Server_ServerStatus_CurrentTime
      attributeId: AttributeIds.Value
    };

    const dataValue = await session.read(nodeToRead, TimestampsToReturn.Both);
    console.log("Server time:", dataValue.value.value);

    await session.close();
    await client.disconnect();
    console.log("Disconnected");
  } catch (err) {
    console.error("Error:", err);
  }
})();
