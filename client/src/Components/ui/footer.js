import s from "./ui.module.scss";

const Footer = ({}) => {
  return (
    <footer className={s.footer}>
      © {new Date().getFullYear()} Comify Technologies, All Rights Reserved.
    </footer>
  );
};

export default Footer;
