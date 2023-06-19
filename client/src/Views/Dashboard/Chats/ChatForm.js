import { HiThumbDown, HiThumbUp } from "react-icons/hi";
import s from "./chat.module.scss";
import { Moment } from "Components/elements";
import { Fragment, useState } from "react";

const FullChat = ({ chat }) => {
  return (
    <div className={`grid gap-1 ${s.fullChat}`}>
      <div className={`grid p-1 gap-1 ${s.detail}`}>
        <div className={s.user}>
          <h4>{chat.user?.name}</h4>
          <p>{chat.user?.phone}</p>
          <p>{chat.user?.email}</p>
        </div>

        <div className={s.other}>
          <p>
            <strong>Chat Started: </strong>
            <Moment format="DD MMM YYYY hh:mma">{chat.createdAt}</Moment>
          </p>
          <p>
            <strong>Last Message: </strong>
            <Moment format="DD MMM YYYY hh:mma">{chat.updatedAt}</Moment>
          </p>
          <p>
            <strong>Total Messages: </strong>
            {chat.messages.length - 1}
          </p>
          <p>
            <strong>Assistant Response: </strong>
            {chat.messages.filter((item) => item.role === "assistant").length}
          </p>
          <p>
            <strong>Total Liked Messages: </strong>
            {
              chat.messages.filter(
                (item) => item.role === "assistant" && item.like === true
              ).length
            }
          </p>
          <p>
            <strong>Total Disliked Messages: </strong>
            {
              chat.messages.filter(
                (item) => item.role === "assistant" && item.like === false
              ).length
            }
          </p>
        </div>
      </div>
      <div className={s.messages}>
        {chat.messages
          .filter((item) => item.name !== "System")
          .map((item, i, arr) => (
            <Fragment key={item._id}>
              {arr[i - 1] &&
                new Date(arr[i - 1].createdAt).getDate() !==
                  new Date(item.createdAt).getDate() && (
                  <p className={s.date}>
                    <Moment format="DD MMM YYYY">{item.createdAt}</Moment>
                  </p>
                )}
              {i === 0 && (
                <p className={s.date}>
                  <Moment format="DD MMM YYYY">{item.createdAt}</Moment>
                </p>
              )}
              <Message msg={item} />
            </Fragment>
          ))}
      </div>
    </div>
  );
};

const Message = ({ msg, style }) => {
  return (
    <div className={`${s.msg} ${s[msg.role]}`} style={style}>
      {msg.role === "assistant" && (
        <div className={s.actions}>
          {msg.like && <HiThumbUp />}
          {msg.like === false && <HiThumbDown />}
        </div>
      )}
      <p className={s.content}>{msg.content}</p>
      <Moment format="hh:mma">{msg.createdAt}</Moment>
    </div>
  );
};

export default FullChat;
