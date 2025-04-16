import { Layout, ConfigProvider } from "antd";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import UserSideBar from "../SideBar/UserSideBar";
import './PageLayout.css';

const PageLayout = () => {
  return (
    <ConfigProvider
      theme={{
        components: {
          Layout: {
            colorBgLayout: "#f2f8fd",
          },
        },
      }}
    >
      <Layout className="page-layout">
        <UserSideBar />
        <Layout className="page-layout-main">
          <Header />
          <Outlet />
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default PageLayout;
