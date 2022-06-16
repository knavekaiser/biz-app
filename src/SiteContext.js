import React, { createContext, useState, useEffect } from "react";

export const SiteContext = createContext();
export const Provider = ({ children }) => {
  const [user, setUser] = useState(
    null
    // {
    //   name: "Small Business",
    //   moto: "Shop at your fingertips",
    //   phone: "915874515451",
    //   email: "smallbusiness@gmail.com",
    //   address: "1/7 abby road, kamalpur, UP, India",
    //   bankDetail: {
    //     bankName: "National Bank",
    //     branch: "Tempa",
    //     accNo: "201452454545",
    //     accName: "Small Business",
    //   },
    //   owner: {
    //     name: "Mr. Anderson",
    //     phone: "915648774152",
    //     email: "anderson@email.com",
    //     signature:
    //       "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Signature_of_Ann_Miller.svg/800px-Signature_of_Ann_Miller.svg.png",
    //   },
    //   logo:
    //     "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Cool_TV_logo_2004.svg/1200px-Cool_TV_logo_2004.svg.png",
    //   gstin: "545455454545",
    //   pan: "9871456456454212",
    //   ifsc: "54515154545",
    //   terms: ["TDS as applicable", "Payment 30-days form the invoice"],
    // }
  );
  useEffect(() => {
    // do something after users are loaded
  }, [user]);
  return (
    <SiteContext.Provider
      value={{
        user,
        setUser,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};
