const { OPCUAServer, Variant, DataType } = require("node-opcua");

(async () => {
  // Utworzenie serwera
  const server = new OPCUAServer({
    port: 4334,
    resourcePath: "/UA/ZbiornikServer",
    buildInfo: {
      productName: "ZbiornikOPCUAServer",
      buildNumber: "1",
      buildDate: new Date()
    }
  });

  await server.initialize();

  // Utworzenie przestrzeni adresowej
  const addressSpace = server.engine.addressSpace;
  const namespace = addressSpace.getOwnNamespace();

  // Utworzenie obiektu "Zbiornik"
  const zbiornik = namespace.addObject({
    organizedBy: addressSpace.rootFolder.objects,
    browseName: "Zbiornik"
  });

  // Zmienna 1: poziom zbiornika (np. w litrach)
  namespace.addVariable({
    componentOf: zbiornik,
    browseName: "Poziom",
    nodeId: "ns=1;s=ZbiornikPoziom",
    dataType: "Double",
    value: {
      get: () => {
        const poziom = Math.round(Math.random() * 100); // przykładowo 0-100 litrów
        // Wyświetlanie wizualizacji w konsoli
        renderPoziom(poziom);
        return new Variant({
          dataType: DataType.Double,
          value: poziom
        });
      }
    }
  });

  // Zmienna 2: zawór dolotowy (stan logiczny)
  let zaworOtwarte = false;

  namespace.addVariable({
    componentOf: zbiornik,
    browseName: "ZaworDolotowy",
    nodeId: "ns=1;s=ZbiornikZaworDolotowy",
    dataType: "Boolean",
    value: {
      get: () =>
        new Variant({
          dataType: DataType.Boolean,
          value: zaworOtwarte
        }),
      set: (variant) => {
        zaworOtwarte = variant.value;
        console.log("Zmieniono stan zaworu na:", zaworOtwarte ? "otwarty" : "zamknięty");
        return true;
      }
    }
  });

  // Funkcja do renderowania poziomu w konsoli
  function renderPoziom(poziom) {
    const maxPoziom = 100; // Maksymalny poziom
    const barLength = 50;  // Długość wykresu (ilość "█" w pasku)

    // Obliczenie liczby "█" w zależności od poziomu
    const filledLength = Math.round((poziom / maxPoziom) * barLength);
    const emptyLength = barLength - filledLength;

    // Wyświetlenie poziomu w formie graficznej
    const bar = "█".repeat(filledLength) + "░".repeat(emptyLength);
    console.log(`Poziom zbiornika: ${poziom} litrów [${bar}]`);
  }

  await server.start();

  console.log("✅ Serwer OPC UA działa!");
  console.log(
    "📡 Endpoint:",
    server.endpoints[0].endpointDescriptions()[0].endpointUrl
  );
})();
