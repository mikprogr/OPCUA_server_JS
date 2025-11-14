using System;
using System.Threading;
using Opc.Ua;
using Opc.Ua.Server;

namespace ZbiornikOpcUaServer
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Uruchamianie serwera OPC UA...");

            var server = new ZbiornikServer();
            server.Start();

            Console.WriteLine("Serwer OPC UA działa!");
            Console.WriteLine("Naciśnij Ctrl+C, aby zakończyć.");
            
            // Serwer działa w tle
            ManualResetEvent quitEvent = new ManualResetEvent(false);
            Console.CancelKeyPress += (sender, eArgs) =>
            {
                quitEvent.Set();
                eArgs.Cancel = true;
            };
            quitEvent.WaitOne();

            server.Stop();
        }
    }

    // Nasz serwer
    public class ZbiornikServer : StandardServer
    {
        protected override MasterNodeManager CreateMasterNodeManager(IServerInternal server, ApplicationConfiguration configuration)
        {
            Console.WriteLine("Tworzenie przestrzeni adresowej...");

            var nodeManagers = new MasterNodeManager(server, configuration, new ZbiornikNodeManager(server, configuration));

            return nodeManagers;
        }
    }

    public class ZbiornikNodeManager : CustomNodeManager2
    {
        private BaseDataVariableState<double> _poziom;
        private BaseDataVariableState<bool> _zawor;

        public ZbiornikNodeManager(IServerInternal server, ApplicationConfiguration configuration)
            : base(server, configuration, "http://example.org/Zbiornik")
        {
        }

        protected override void CreateAddressSpace()
        {
            base.CreateAddressSpace();

            // Utworzenie folderu Zbiornik
            var zbiornik = new FolderState(null)
            {
                SymbolicName = "Zbiornik",
                ReferenceTypeId = ReferenceTypes.Organizes,
                TypeDefinitionId = ObjectTypeIds.FolderType,
                NodeId = new NodeId("Zbiornik", NamespaceIndex),
                BrowseName = new QualifiedName("Zbiornik", NamespaceIndex),
                DisplayName = "Zbiornik"
            };
            AddRootNotifier(zbiornik);

            // Zmienna Poziom (double)
            _poziom = new BaseDataVariableState<double>(zbiornik)
            {
                NodeId = new NodeId("ZbiornikPoziom", NamespaceIndex),
                BrowseName = new QualifiedName("Poziom", NamespaceIndex),
                DisplayName = "Poziom",
                TypeDefinitionId = VariableTypeIds.BaseDataVariableType,
                DataType = DataTypeIds.Double,
                ValueRank = ValueRanks.Scalar,
                AccessLevel = AccessLevels.CurrentRead
            };
            zbiornik.AddChild(_poziom);

            // Zmienna Zawor (bool)
            _zawor = new BaseDataVariableState<bool>(zbiornik)
            {
                NodeId = new NodeId("ZbiornikZaworDolotowy", NamespaceIndex),
                BrowseName = new QualifiedName("ZaworDolotowy", NamespaceIndex),
                DisplayName = "ZaworDolotowy",
                TypeDefinitionId = VariableTypeIds.BaseDataVariableType,
                DataType = DataTypeIds.Boolean,
                ValueRank = ValueRanks.Scalar,
                AccessLevel = AccessLevels.CurrentReadOrWrite
            };
            zbiornik.AddChild(_zawor);

            // Timer do aktualizacji poziomu
            Timer timer = new Timer(UpdateValues, null, 0, 1000);
        }

        private void UpdateValues(object state)
        {
            // Losowy poziom 0-100
            _poziom.Value = new Random().NextDouble() * 100;

            // Wyświetlenie wartości w konsoli
            Console.Clear();
            Console.WriteLine($"Poziom zbiornika: {_poziom.Value:F2} litrów");
            Console.WriteLine($"Zawór dolotowy: {_zawor.Value}");
            
            // Powiadom klientów OPC UA
            _poziom.ClearChangeMasks(SystemContext, true);
            _zawor.ClearChangeMasks(SystemContext, true);
        }
    }
}
