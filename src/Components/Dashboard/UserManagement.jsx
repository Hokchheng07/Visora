import { useState } from "react";
import {
  ChevronDown,
  Filter,
  MoreHorizontal,
  UserRound,
  UserRoundCheck,
  UserRoundX,
  Users,
} from "lucide-react";
import { Avatar, Pagination, StatusBadge, StatCards } from "./ManagementUi";
import { useDashboardData } from "./dashboardData";
import "./management.css";
const stats = [
  ["Total User", "1,345", UserRound, "purple"],
  ["Active Users", "3,234", UserRoundCheck, "amber"],
  ["New This Week", "2,567", Users, "green"],
  ["Suspended Users", "12", UserRoundX, "red"],
];
import { ArrowRight } from 'lucide-react';
const tabs = [
  ["all", "All Users", "1,248"],
  ["active", "Active", "1,086"],
  ["inactive", "Inactive", "128"],
  ["suspended", "Suspended", "34"],
];
const users = [
  [
    "Sok Chantha",
    "sok.chantha@visora.com",
    "Active",
    "May 24, 2024",
    "10:30 AM",
    24,
  ],
  [
    "Dara Vannak",
    "dara.vannak@visora.com",
    "Active",
    "May 24, 2024",
    "9:12 AM",
    18,
  ],
  [
    "Srey Pich",
    "srey.pich@visora.com",
    "Inactive",
    "May 23, 2024",
    "4:45 PM",
    12,
  ],
  [
    "Vuthy Keo",
    "vuthy.keo@visora.com",
    "Active",
    "May 23, 2024",
    "2:20 PM",
    37,
  ],
  [
    "Nita Sorn",
    "nita.sorn@visora.com",
    "Active",
    "May 22, 2024",
    "11:05 AM",
    9,
  ],
  [
    "Bora Chea",
    "bora.chea@visora.com",
    "Inactive",
    "May 22, 2024",
    "8:40 AM",
    7,
  ],
  [
    "Ratha Kim",
    "ratha.kim@visora.com",
    "Active",
    "May 21, 2024",
    "5:15 PM",
    31,
  ],
  [
    "Malis Phan",
    "malis.phan@visora.com",
    "Active",
    "May 21, 2024",
    "1:30 PM",
    15,
  ],
  [
    "Sophea Lim",
    "sophea.lim@visora.com",
    "Inactive",
    "May 20, 2024",
    "10:10 AM",
    5,
  ],
  [
    "Chan Dara",
    "chan.dara@visora.com",
    "Active",
    "May 20, 2024",
    "9:00 AM",
    22,
  ],
];
const registrations = [
  ["Sok Chantha", "sok.chantha@visora.com", "2 min ago", "Designer"],
  ["Dara Vannak", "dara.vannak@visora.com", "18 min ago", "Editor"],
  ["Srey Pich", "srey.pich@visora.com", "1 hour ago", "Contributor"],
  ["Vuthy Keo", "vuthy.keo@visora.com", "3 hours ago", "Viewer"],
  ["Nita Sorn", "nita.sorn@visora.com", "5 hours ago", "Designer"],
  ["Nita heng", "nita.heng@visora.com", "5 hours ago", "Designer"],
];
export default function UserManagement() {
  const [selectedTab, setSelectedTab] = useState("all");
  const { users: dataUsers, templates } = useDashboardData();
  const shown = dataUsers.filter(
    (u) => selectedTab === "all" || u.status === selectedTab,
  );
  const dynamicStats = [
    ["Total User", dataUsers.length, UserRound, "purple"],
    [
      "Active Users",
      dataUsers.filter((u) => u.status === "active").length,
      UserRoundCheck,
      "amber",
    ],
    ["New This Week", dataUsers.length, Users, "green"],
    [
      "Suspended Users",
      dataUsers.filter((u) => u.status === "suspended").length,
      UserRoundX,
      "red",
    ],
  ];
  return (
    <div className="dashboard-content management-page">
      <StatCards items={dynamicStats} />
      <div className="management-columns">
        <section>
          <div className="management-toolbar">
            <div className="management-tabs">
              {tabs.map(([key, label]) => (
                <button
                  key={key}
                  className={selectedTab === key ? "active" : ""}
                  onClick={() => setSelectedTab(key)}
                >
                  {label}{" "}
                  <span>
                    (
                    {key === "all"
                      ? dataUsers.length
                      : dataUsers.filter((u) => u.status === key).length}
                    )
                  </span>
                </button>
              ))}
            </div>
            <div className="toolbar-controls">
              <button>
                All Roles <ChevronDown size={15} />
              </button>
              <button>
                <Filter size={15} />
                Filter
              </button>
            </div>
          </div>
          <div className="management-card table-scroll">
            <div className="management-table users-table">
              <div className="management-head">
                <span className="text-[12px]">Names</span>
                <span className="text-[12px]">Status</span>
                <span className="text-[12px]">Joined Date</span>
                <span className="text-[12px]">Templates</span>
                <span className="text-[12px]">Actions</span>
              </div>
              {shown.map((u) => (
                <div className="management-row" key={u.id}>
                  <div className="person">
                    <Avatar name={u.name} />
                    <div>
                      <strong className="!text-[14px] font-semibold mt-1">{u.name}</strong>
                      <small className="!text-[10px] font-semibold">{u.email}</small>
                    </div>
                  </div>
                  <StatusBadge className="border" status={u.status}/>
                  <div className="date-cell ">
                    <strong >{u.joinedAt}</strong>
                    <small>10:30 AM</small>
                  </div>
                  <a className="count-link">
                    {templates.filter((t) => t.email === u.email).length}
                  </a>
                  <button className="menu-button">
                    <MoreHorizontal size={19} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <Pagination
            text={`Showing 1 to ${shown.length} of ${shown.length} Users`}
          />
        </section>
        <aside className="management-card registrations">
          <header>
            <div>
              <span className="panel-icon">
                <Users size={18} />
              </span>
              <h2 className="!text-[16px] text-blue-500 font-semibold">Recent Registrations</h2>
            </div>
            <button className="!text-[12px] -mr-39">View all</button><span className="text-blue-500"><ArrowRight size={13} /></span>
          </header>
          {dataUsers.slice(0, 10).map((u, index) => (
            <div className="registration-row" key={u.id}>
              <Avatar name={u.name} />
              <div>
                <strong className="!text-[14px] font-semibold mt-2">{u.name}</strong>
                <small className="!text-[10px] font-semibold">{u.email}</small>
                <small>{index + 1} hour ago</small>
              </div>
              <section>
                <b className="!text-[12px] border font-semibold mt-3"> {u.role}</b>
              </section>
            </div>
          ))}
          <div className="text-blue-500 flex items-center mt-7 font-semibold justify-center" >
            View all registrations <span className="text-blue-500"><ArrowRight size={13} /></span>
          </div>
        </aside>
      </div>
    </div>
  );
}
