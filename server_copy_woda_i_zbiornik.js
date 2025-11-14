const {
  OPCUAServer,
  Variant,
  DataType,
  SecurityPolicy,
  MessageSecurityMode
} = require("node-opcua");

// Funkcja do wizualizacji poziomu zbiornika
function renderPoziom(poziom) {
  const max = 100;
  const width = 40;
  const filled = Math.round((poziom / max) * width);
  const empty = width - filled;

  const bar = "█".repeat(filled) + "░".repeat(empty);
  console.log(`Poziom zbiornika: ${poziom} L  [${bar}]`);
}

(async () => {
  const server = new OPCUAServer({
    port: 4334,
    resourcePath: "/UA/ZbiornikServer",

    // 🔧 Wyłączamy zabezpieczenia — naprawia błędy RSA PKCS#1 w Node 20+
    securityPolicies: [SecurityPolicy.None],
    securityModes: [MessageSecurityMode.None],

    buildInfo: {
      productName: "ZbiornikOPCUAServer",
      buildNumber: "2",
      buildDate: new Date()
    }
  });

  await server.initialize();

  const addressSpace = server.engine.addressSpace;
  const namespace = addressSpace.getOwnNamespace();

  // Obiekt Zbiornik
  const zbiornik = namespace.addObject({
    organizedBy: addressSpace.rootFolder.objects,
    browseName: "Zbiornik"
  });

  // Zmienna: Poziom
  namespace.addVariable({
    componentOf: zbiornik,
    browseName: "Poziom",
    nodeId: "ns=1;s=ZbiornikPoziom",
    dataType: "Double",
    minimumSamplingInterval: 500, // 🔧 usuwa warningi
    value: {
      get: () => {
        const poziom = Math.round(Math.random() * 100);

        // Wizualizacja na konsoli
        renderPoziom(poziom);

        return new Variant({
          dataType: DataType.Double,
          value: poziom
        });
      }
    }
  });

  // Zmienna: Zawór dolotowy
  let zaworOtwarte = false;

  namespace.addVariable({
    componentOf: zbiornik,
    browseName: "ZaworDolotowy",
    nodeId: "ns=1;s=ZbiornikZaworDolotowy",
    dataType: "Boolean",
    minimumSamplingInterval: 200,
    value: {
      get: () =>
        new Variant({
          dataType: DataType.Boolean,
          value: zaworOtwarte
        }),

      set: (variant) => {
        zaworOtwarte = variant.value;
        console.log(
          "Stan zaworu:", zaworOtwarte ? "OTWARTY" : "ZAMKNIĘTY"
        );
        return true;
      }
    }
  });

  await server.start();

  console.log("✅ Serwer OPC UA działa!");
  console.log("📡 Endpoint:", server.endpoints[0].endpointDescriptions()[0].endpointUrl);
})();
