import { useCallback, useContext, useRef, useState } from "react";
import {
  AiOutlineMessage,
  AiOutlineSend,
  AiOutlineClose,
  AiOutlineClear,
} from "react-icons/ai";
import s from "./style.module.css";
import { ChatContextProvider, ChatContext } from "./ChatContext";
import { useFetch } from "./utils/useFetch";
import endpoints from "./utils/endpoints";

export default function ComifyChat() {
  const [open, setOpen] = useState(false);
  const { topics } = useContext(ChatContext);

  return (
    <div className={s.chatContainer}>
      {open ? (
        <Chat setOpen={setOpen} />
      ) : (
        <button
          className={s.chatTglBtn}
          onClick={() => setOpen(true)}
          disabled={topics.length === 0}
        >
          <AiOutlineMessage />
        </button>
      )}
    </div>
  );
}

const Chat = ({ setOpen }) => {
  const messagesRef = useRef();
  const { convo, setConvo, messages, setMessages } = useContext(ChatContext);
  return (
    <div className={s.chat}>
      {convo && (
        <button
          className={s.clearBtn}
          onClick={() => {
            setConvo(null);
            setMessages([]);
            localStorage.removeItem("comify_chat_id");
          }}
        >
          <AiOutlineClear />
        </button>
      )}
      <button className={s.closeBtn} onClick={() => setOpen(false)}>
        <AiOutlineClose />
      </button>
      <div className={s.messages} ref={messagesRef}>
        {!convo ? (
          <ConvoForm />
        ) : messages.length === 0 ? (
          <p className={s.placeholder}>No message yet!</p>
        ) : (
          messages.map((item, i, arr) => (
            <p
              key={item._id}
              className={`${s.msg} ${s[item.role]}`}
              style={{
                marginBottom: arr[i - 1]?.role !== item.role ? 5 : 0,
              }}
            >
              {item.content}
            </p>
          ))
        )}
      </div>
      {convo && (
        <ChatForm
          convo={convo}
          setMessages={setMessages}
          scrollDown={() => {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
          }}
        />
      )}
    </div>
  );
};

const ChatForm = ({ convo, setMessages, scrollDown }) => {
  const [msg, setMsg] = useState("");
  const { post: sendMessage, loading } = useFetch(endpoints.chat);
  const submit = useCallback(
    (e) => {
      e.preventDefault();
      scrollDown();

      sendMessage({ content: msg }, { params: { ":chat_id": convo._id } })
        .then(({ data }) => {
          if (!data.success) {
            return alert(data.message);
          }
          setMessages((prev) => {
            return [
              data.data,
              { _id: Math.random(), role: "user", name: "Guest", content: msg },
              ...prev,
            ];
          });
          setMsg("");
        })
        .catch((err) => alert(err.message));
    },
    [msg]
  );
  return (
    <form className={s.chatForm} onSubmit={submit}>
      <input
        placeholder="Type a message"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        className={s.input}
      />
      <button className={s.sendBtn} disabled={loading}>
        <AiOutlineSend />
      </button>
    </form>
  );
};

const ConvoForm = ({}) => {
  const { topics, setConvo, setMessages } = useContext(ChatContext);
  const [errors, setErrors] = useState({});
  const [topic, setTopic] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const { post: initChat, loading } = useFetch(endpoints.chat);

  const submit = useCallback(
    (e) => {
      e.preventDefault();

      if (!topic) {
        return setErrors((prev) => ({
          ...prev,
          topic: "Please select a topic",
        }));
      }

      initChat(
        {
          topic,
          name,
          email,
          message: msg,
        },
        {
          params: {
            ":chat_id": "",
          },
        }
      )
        .then(({ data }) => {
          if (!data.success) {
            return alert(data.message);
          }
          localStorage.setItem("comify_chat_id", data.data._id);
          setConvo({ ...data.data, messages: undefined });
          setMessages(data.data.messages.reverse());
        })
        .catch((err) => alert(err.message));
    },
    [topic, name, email, msg]
  );

  return (
    <form className={s.convoForm} onSubmit={submit}>
      <section>
        <label className={s.label}>Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={s.input}
        />
      </section>
      <section>
        <label className={s.label}>Email</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={s.input}
        />
      </section>
      <section className={s.topics}>
        <label className={s.label}>Pick a Topic</label>
        <ul className={s.list}>
          {topics.map((item) => (
            <li
              key={item}
              className={`${s.topic} ${topic === item ? s.active : ""}`}
              onClick={() => {
                setTopic(item);
                setErrors((prev) => ({ ...prev, topic: undefined }));
              }}
            >
              {item}
            </li>
          ))}
        </ul>
        {errors.topic && <p className={s.err}>{errors.topic}</p>}
      </section>
      <section>
        <label className={s.label}>Message</label>
        <textarea
          required
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          className={s.textarea}
        />
      </section>
      <button className={s.btn} disabled={loading}>
        Submit
      </button>
    </form>
  );
};

export { ChatContextProvider };
