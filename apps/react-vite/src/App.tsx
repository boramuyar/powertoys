import { useTabInfo, useTabList, useRequestAction, TabListItem } from "@powertoys/relay";

function App() {
  const tabInfo = useTabInfo();
  const tabList = useTabList();
  const requestAction = useRequestAction();

  const ping = async (tabId: string) => {
    requestAction(tabId, "PING", null, res => console.log(res));
  };

  const reloadAll = async () => {
    requestAction("*", "RELOAD");
  };

  const closeWindow = () => {
    requestAction("*", "CLOSE_WINDOW");
  };

  return (
    <div>
      <button onClick={() => window.open("http://localhost:5173/", "_blank")}>Open new tab</button>
      <button onClick={reloadAll}>Reload all tabs</button>
      <button onClick={closeWindow}>Close all windows</button>
      <h1>Current Tab: {tabInfo?.tabName}</h1>
      <h2>Connected Tabs: ({tabList.length})</h2>
      <ul>
        {tabList.map((tab: TabListItem) => (
          <li key={tab.tabId}>
            {tab.tabName} ({tab.tabId})
            {tab.tabId !== tabInfo?.tabId && <button onClick={() => ping(tab.tabId)}>Ping</button>}
          </li>
        ))}
      </ul>
      <h2>Open Link in New Tab</h2>
    </div>
  );
}

export default App;
