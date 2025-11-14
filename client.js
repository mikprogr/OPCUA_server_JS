const { OPCUAClient, AttributeIds } = require("node-opcua");

(async () => {
    const endpointUrl = "opc.tcp://<IP_LUB_DNS>:46391/UA/MyServer";

    const client = OPCUAClient.create({ endpointMustExist: false });

    try {
        await client.connect(endpointUrl);
        console.log("✅ Połączono z serwerem");

        const session = await client.createSession();
        console.log("✅ Sesja utworzona");

        const dataValue = await session.read({
            nodeId: "ns=1;s=ZbiornikPoziom",  // poprawna składnia
            attributeId: AttributeIds.Value
        });

        console.log("Poziom zbiornika:", dataValue.value.value);

        await session.close();
        await client.disconnect();
        console.log("✅ Rozłączono klienta");

    } catch (err) {
        console.error("❌ Błąd klienta OPC UA:", err);
        try {
            await client.disconnect();
        } catch {}
    }
})();
