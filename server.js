const { OPCUAServer, Variant, DataType } = require("node-opcua");

(async () => {
  const server = new OPCUAServer({
    port: 4334,
    resourcePath: "/UA/MyServer",
    buildInfo: {
      productName: "MyOPCUAServer",
      buildNumber: "1",
      buildDate: new Date()
    }
  });

  await server.initialize();

  const addressSpace = server.engine.addressSpace;
  const namespace = addressSpace.getOwnNamespace();
  const device = namespace.addObject({
    organizedBy: addressSpace.rootFolder.objects,
    browseName: "MyDevice"
  });

  namespace.addVariable({
    componentOf: device,
    browseName: "MyVariable1",
    nodeId: "ns=1;s=MyVariable1",
    dataType: "Double",
    value: {
      get: () =>
        new Variant({
          dataType: DataType.Double,  // use enum instead of numeric code
          value: Math.random()
        })
    }
  });

  await server.start();
  console.log(
    "Server running at:",
    server.endpoints[0].endpointDescriptions()[0].endpointUrl
  );
})();

