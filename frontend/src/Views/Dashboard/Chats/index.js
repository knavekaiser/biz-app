import { useState, useEffect, useContext } from "react";
import { SiteContext } from "SiteContext";
import { Moment, Table, TableActions } from "Components/elements";
import { FaRegEye, FaRegTrashAlt } from "react-icons/fa";
import { Prompt, Modal } from "Components/modal";
import s from "./chat.module.scss";
import { useFetch } from "hooks";
import { endpoints } from "config";

import SubPlanForm from "./ChatForm";
import { BsList } from "react-icons/bs";

const Chats = ({ setSidebarOpen }) => {
  const { user, checkPermission } = useContext(SiteContext);
  const [chats, setChats] = useState([]);
  const [chat, setChat] = useState(null);

  const { get: getChats, loading } = useFetch(endpoints.chats);
  const { remove: deleteChat } = useFetch(endpoints.chats + "/{ID}");

  useEffect(() => {
    getChats()
      .then(({ data }) => {
        if (data.success) {
          return setChats(data.data);
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);
  return (
    <div className={`${s.content} grid gap-1 m-a p-1`}>
      <div className="flex">
        <div
          className={`flex align-center pointer gap_5  ml-1`}
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          <BsList style={{ fontSize: "1.75rem" }} />
          <h2>All Chats</h2>
        </div>
      </div>
      <Table
        loading={loading}
        className={`${s.subPlans} ${
          user.userType === "admin" ? s.adminView : ""
        }`}
        columns={[
          { label: "Date" },
          { label: "User" },
          // ...(user.userType === "admin" ? [{ label: "Business" }] : []),
          { label: "Topic" },
          { label: "Total Messages" },
          { label: "Token Usage" },
          { label: "Action", className: "action" },
        ]}
      >
        {chats.map((item) => (
          <tr style={{ cursor: "pointer" }} key={item._id}>
            <td>
              <Moment format="DD MMM YYYY hh:mma">{item.createdAt}</Moment>
            </td>
            <td>{item.user?.name}</td>
            {/* {user.userType === "admin" && <td>{item.business?.name}</td>} */}
            <td>{item.topic}</td>
            <td>{item.messages.length - 1}</td>
            <td>{item.tokenUsage}</td>
            <TableActions
              className={s.actions}
              actions={[
                {
                  icon: <FaRegEye />,
                  label: "View",
                  onClick: () => {
                    setChat(item);
                  },
                },
                ...(checkPermission("chat_delete")
                  ? [
                      {
                        icon: <FaRegTrashAlt />,
                        label: "Delete",
                        onClick: () =>
                          Prompt({
                            type: "confirmation",
                            message: `Are you sure you want to remove this Chat?`,
                            callback: () => {
                              deleteChat(
                                {},
                                { params: { "{ID}": item._id } }
                              ).then(({ data }) => {
                                if (data.success) {
                                  setChats((prev) =>
                                    prev.filter((plan) => plan._id !== item._id)
                                  );
                                } else {
                                  Prompt({
                                    type: "error",
                                    message: data.message,
                                  });
                                }
                              });
                            },
                          }),
                      },
                    ]
                  : []),
              ]}
            />
          </tr>
        ))}
      </Table>
      <Modal
        open={chat}
        head
        label={`Chat`}
        className={s.fullChatModal}
        setOpen={() => setChat(null)}
      >
        <SubPlanForm chat={chat} />
      </Modal>
    </div>
  );
};

export default Chats;
