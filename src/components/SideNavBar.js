
import { Sidebar, SidebarItem } from 'react-responsive-sidebar'
import {FaUserAlt, FaProjectDiagram, FaFileSignature, FaFileInvoiceDollar, FaTachometerAlt} from 'react-icons/fa';
import Bill from '../views/Bill';

const SideNavBar = {
    admin_items : [
        <div style={{height: '70px'}}></div>,
        <SidebarItem textAlign='left' leftIcon={<FaUserAlt />} href='/users/' className="sideMenuItem">Users</SidebarItem>,
        <SidebarItem textAlign='left' href='/ppa/' leftIcon={<FaFileSignature />} className="sideMenuItem">PPA</SidebarItem>,
        <SidebarItem textAlign='left' href='/bill/' leftIcon={<FaFileInvoiceDollar />} className="sideMenuItem">Bills</SidebarItem>,
        <SidebarItem textAlign='left' href='/meter/' leftIcon={<FaTachometerAlt />} className="sideMenuItem">Meters</SidebarItem>,
        <hr />,
      ],
      siteuser_items : [
        <div style={{height: '70px'}}></div>,
        <SidebarItem textAlign='left' leftIcon={<FaFileInvoiceDollar />} href='/bill/' className="sideMenuItem">Bills</SidebarItem>,
      ],
}

export default SideNavBar;