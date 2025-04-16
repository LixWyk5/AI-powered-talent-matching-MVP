import React, { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
  ProfileOutlined
} from "@ant-design/icons";
import SideBar from "./SideBar";

const UserSideBar = () => {
  const navigate = useNavigate();

  const clearUser = useCallback(() => {
    localStorage.removeItem("user");
    navigate("/");
  }, [navigate]);

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "guest";

  const menuItems = useMemo(() => {
    const items = [
      {
        key: "dashboard",
        label: "Dashboard",
        icon: <DashboardOutlined />,
        action: "/dashboard",
      }
    ];

    if (role === "candidate") {
      items.push({
        key: "profile",
        label: "Profile",
        icon: <UserOutlined />,
        action: "/edit_candidate_profile"
      });
    } else if (role === "employer") {
      items.push({
        key: "jobs",
        label: "Jobs",
        icon: <ProfileOutlined />,
        action: "/specific_employer_jobs"
      });
    }

    // Add Log out
    items.push({
      key: "logout",
      label: "Log out",
      icon: <LogoutOutlined />,
      action: clearUser,
      isLogout: true
    });

    return items;
  }, [clearUser, role]);

  return <SideBar menuItems={menuItems} />;
};

export default UserSideBar;
