import React, { useState, useEffect } from "react";
import { db } from "../../Firebase/FirebaseConfig";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { Outlet, useLocation } from "react-router-dom";

const ACC_PAGE_URLS = [
  "/a-dashboard/announcements",
  "/dashboard/announcements",
];
export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const isAdminPage = location.pathname === "/a-dashboard/announcements";
  let isAnnouncementsPage = false;
  if (ACC_PAGE_URLS.includes(location.pathname)) {
    isAnnouncementsPage = true;
  }

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const announcementsRef = collection(db, "announcements");
        const announcementsQuery = query(
          announcementsRef,
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(announcementsQuery);

        const announcementsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAnnouncements(announcementsData);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const formatDate = (timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex relative">
      <div className="flex-1 flex flex-col">
        {isAnnouncementsPage ? (
          <div className="mt-[3%] mx-[10%]">
            <div className="flex justify-between items-center mb-3">
              <h1 className="text-2xl font-semibold">Announcements</h1>
              {isAdminPage && (
                <button className="bg-primary text-white px-4 py-2 rounded">
                  <Link to="/a-dashboard/announcements/addNewAnnouncement">
                    Add New
                  </Link>
                </button>
              )}
            </div>

            <table className="w-full">
              <thead className="bg-primary">
                <tr>
                  <th className="border w-[20%] text-center font-semibold text-[20px] py-2 text-white">
                    Date
                  </th>
                  <th className="border w-[20%] text-center font-semibold text-[20px] py-2 text-white">
                    Title
                  </th>
                  <th className="border w-[20%] text-center font-semibold text-[20px] py-2 text-white">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="text-center py-5 text-lg">
                      Loading announcements...
                    </td>
                  </tr>
                ) : announcements.length > 0 ? (
                  announcements.map((announcement) => (
                    <tr key={announcement.id} className="bg-[#ECF4FF]">
                      <td className="border text-center py-2">
                        {/* Format the createdAt date */}
                        {formatDate(announcement.createdAt)}
                      </td>
                      <td className="border text-center py-2">
                        {announcement.title}
                      </td>
                      <td className="border text-center py-2">
                        <div>
                          {isAdminPage ? (
                            <Link
                              to={`/a-dashboard/announcements/${announcement.id}`}
                              className="bg-primary text-white px-6 py-1 rounded"
                            >
                              View
                            </Link>
                          ) : (
                            <Link
                              to={`/dashboard/announcements/${announcement.id}`}
                              className="bg-primary text-white px-6 py-1 rounded"
                            >
                              View
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-5 text-lg">
                      No announcements available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
}
