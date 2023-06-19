import { useState, useEffect, useContext } from "react";
import { SiteContext } from "SiteContext";
import { Moment, Table, TableActions } from "Components/elements";
import { FaRegEye, FaRegTrashAlt } from "react-icons/fa";
import { Prompt, Modal } from "Components/modal";
import s from "./chat.module.scss";
import { useFetch } from "hooks";
import { endpoints } from "config";

import SubPlanForm from "./ChatForm";

const Chats = () => {
  const { user, checkPermission } = useContext(SiteContext);
  const [subPlans, setChats] = useState([]);
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
        <h2>All Chats</h2>
      </div>
      <Table
        loading={loading}
        className={`${s.subPlans} ${
          user.userType === "admin" ? s.adminView : ""
        }`}
        columns={[
          { label: "Date" },
          { label: "User" },
          ...(user.userType === "admin" ? [{ label: "Business" }] : []),
          { label: "Topic" },
          { label: "Total Messages" },
          { label: "Action" },
        ]}
      >
        {subPlans.map((item) => (
          <tr style={{ cursor: "pointer" }} key={item._id}>
            <td>
              <Moment format="DD MMM YYYY hh:mma">{item.createdAt}</Moment>
            </td>
            <td>{item.user?.name}</td>
            {user.userType === "admin" && <td>{item.business?.name}</td>}
            <td>{item.topic}</td>
            <td>{item.messages.length - 1}</td>
            <TableActions
              className={s.actions}
              actions={[
                {
                  icon: <FaRegEye />,
                  label: "View",
                  callBack: () => {
                    setChat(item);
                  },
                },
                ...(checkPermission("chat_delete")
                  ? [
                      {
                        icon: <FaRegTrashAlt />,
                        label: "Delete",
                        callBack: () =>
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
        label={`${chat ? "View / Update" : "Add"} Chat`}
        className={s.fullChatModal}
        setOpen={() => setChat(null)}
      >
        <SubPlanForm chat={chat} />
      </Modal>
    </div>
  );
};

export default Chats;
