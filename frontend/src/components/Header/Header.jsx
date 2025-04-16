import { Link, useLocation } from "react-router-dom";
import { Breadcrumb, Layout, Space } from "antd";

const breadcrumbNameMap = {

  "/dashboard": "Dashboard",
  "/edit_candidate_profile": "Edit Profile",
  "/specific_employer_jobs": "Jobs List",
};

const HeaderBreadcrumb = (props) => {
  const location = useLocation();
  const pathSnippets = location.pathname.split("/").filter((i) => i);
  const extraBreadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
    if (breadcrumbNameMap[url]) {
      return (
        <Breadcrumb.Item key={url}>
          <Link style={{ fontFamily: "Poppins", color: "#6E7191" }} to={url}>
            {breadcrumbNameMap[url]}
          </Link>
        </Breadcrumb.Item>
      );
    } else {
      return <></>;
    }
  });
  const breadcrumbItems = [
    <Breadcrumb.Item key="home">
      <Link style={{ fontFamily: "Poppins", color: "#B1B5C5" }} to="/">
        Pages
      </Link>
    </Breadcrumb.Item>,
  ].concat(extraBreadcrumbItems);

  return (
    <Breadcrumb
      className="doctor-header-breadcrumb"
      style={{ display: "flex", alignItems: "center", backgroundColor: 'transparent' }}
    >
      {breadcrumbItems}
    </Breadcrumb>
  );
};

// Header 组件
const Header = (props) => {
  return (
    <Layout.Header
      style={{ backgroundColor: "inherit", padding: "0", marginBottom: "2rem" }}
    >
      <Space
        style={{
          marginTop: "1rem",
          marginLeft: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%"
        }}
      >
        <HeaderBreadcrumb />
      </Space>
    </Layout.Header>
  );
};

export default Header;
