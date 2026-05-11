import Header from "./Header";
import { Outlet } from "react-router-dom";
import AIShopAssistant from "./AIShopAssistant";
import RecentlyViewedBar from "./RecentlyViewedBar";

const Layout = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Global Header */}
      <Header />

      {/* Recently Viewed Strip — shows below header for logged-in users */}
      <RecentlyViewedBar />

      {/* Main Content Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Global AI Shop Assistant */}
      <AIShopAssistant />
    </div>
  );
};

export default Layout;
