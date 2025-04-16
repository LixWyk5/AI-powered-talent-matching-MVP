import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, ConfigProvider } from "antd";
import "./SideBar.css";

const SideBar = ({ menuItems }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("");

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth <= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const currentKey = menuItems.find(
      (item) =>
        typeof item.action === "string" &&
        location.pathname.endsWith(item.action)
    )?.key;
    if (currentKey && currentKey !== selectedKey) {
      setSelectedKey(currentKey);
    }
  }, [location, menuItems, selectedKey]);

  const handleClick = ({ key }) => {
    const action = menuItems.find((item) => item.key === key).action;
    if (typeof action === "function") {
      action();
    } else if (typeof action === "string") {
      navigate(action);
    }
    setSelectedKey(key);
  };

  const regularItems = menuItems.filter(item => !item.isLogout);
  const logoutItem = menuItems.find(item => item.isLogout);

  return (
    <Layout.Sider
      className="side-bar"
      collapsed={collapsed}
      onCollapse={setCollapsed}
    >
      <div className="side-bar-logo-container">
        <a href="/" className="side-bar-logo-text">AI Match</a>
      </div>
      <ConfigProvider
        theme={{
          components: {
            Menu: {
              activeBarBorderWidth: "0",
              itemColor: "#6F718F",
              itemSelectedBg: "#0E45B7",
              itemSelectedColor: "#FFF",
            },
          },
        }}
      >
        <Menu
          onClick={handleClick}
          className="side-bar-menu"
          selectedKeys={[selectedKey]}
          mode="inline"
        >
          {regularItems.map((item) => (
            <Menu.Item key={item.key} icon={item.icon}>
              {item.label}
            </Menu.Item>
          ))}
          {logoutItem && (
            <Menu.Item
              key={logoutItem.key}
              icon={logoutItem.icon}
              className="logout-item"
            >
              {logoutItem.label}
            </Menu.Item>
          )}
        </Menu>
      </ConfigProvider>
    </Layout.Sider>
  );
};

export default SideBar;
