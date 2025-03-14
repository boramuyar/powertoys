import { useTabInfo, useTabList, useRequestAction, TabListItem } from "@powertoys/relay";

function App() {
  const tabInfo = useTabInfo();
  const tabList = useTabList();
  const requestAction = useRequestAction();

  const ping = async (tabId: string) => {
    requestAction(tabId, "PING", null, (res) => console.log(res));
  };

  return (
    <div>
      <h1>Current Tab: {tabInfo?.tabName}</h1>
      <h2>Connected Tabs:</h2>
      <ul>
        {tabList.map((tab: TabListItem) => (
          <li key={tab.tabId}>
            {tab.tabName}
            {tab.tabId !== tabInfo?.tabId && <button onClick={() => ping(tab.tabId)}>Ping</button>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
