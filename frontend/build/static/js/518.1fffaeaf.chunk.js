"use strict";(self.webpackChunkcash_app=self.webpackChunkcash_app||[]).push([[518],{2518:function(e,t,n){n.r(t),n.d(t,{default:function(){return S}});var i=n(2982),c=n(885),a=n(2791),r=n(4581),o=n(5470),s=n(2202),u=n(8750),l={content:"receipts_content__z6trl",receipts:"receipts_receipts__NH-V3",addReceiptForm:"receipts_addReceiptForm__n7XLC",receiptDetail:"receipts_receiptDetail__nmLry",box:"receipts_box__vj9u4",noContent:"receipts_noContent__fNjH0",items:"receipts_items__Ga40U",name:"receipts_name__sxSXf",itemForm:"receipts_itemForm__7BZu3",btns:"receipts_btns__z9YQE",mainForm:"receipts_mainForm__WJKvS",mainFormWrapper:"receipts_mainFormWrapper__Ag34X",invoiceTable:"receipts_invoiceTable__cNmy2",detail:"receipts_detail__juo0m",label:"receipts_label__EIIS1",viewOnly:"receipts_viewOnly__Pzz+e",print:"receipts_print__mpSLr",logo:"receipts_logo__4Dcyr",taxes:"receipts_taxes__ujk7o",totalAmount:"receipts_totalAmount__pmhFy",word:"receipts_word__J2MQt",digit:"receipts_digit__cQdkI",sign:"receipts_sign__n8aJo",signature:"receipts_signature__G5kL0",head:"receipts_head__gXPc3",date:"receipts_date__L92hv",no:"receipts_no__Xfm-Y",customer:"receipts_customer__Xbq4A",net:"receipts_net__ltS8B",actions:"receipts_actions__JRhnz",itemName:"receipts_itemName__TXJZQ"},d=n(5454),m=n(1080),p=n(1413),f=n(1134),v=n(1570),x=n(1146),h=n(184),_=v.Ry({date:v.Z_().required(),amount:v.Rx().min(1,"Enter more than 0").required().typeError("Enter a valid amount"),customerAccountId:v.Z_().required(),cashAccountId:v.Z_().required(),customerDetail:v.Z_().required("Customer detail is a required field")}),b=v.Ry({no:v.Z_().required(),amount:v.Rx().min(0,"Price can not be less than 0").required().typeError("Enter a valid Number"),net:v.Rx(),due:v.Rx()}),j=function(e){var t=e.label,n=e.value,i=e.className;return(0,h.jsxs)("p",{className:"".concat(l.detail," ").concat(i||""),children:[(0,h.jsxs)("span",{className:l.label,children:[t,":"]})," ",(0,h.jsx)("span",{className:l.value,children:n})]})},g=function(e){var t=e.edit,n=e.setEdit,i=(e.receipts,e.invoices),c=e.onSuccess,m=((0,a.useContext)(r.D).config,(0,f.cI)({defaultValues:{unit:"Piece"},resolver:(0,d.y)(b)})),v=m.handleSubmit,x=m.register,_=m.reset,j=(m.watch,m.setValue),g=(m.clearErrors,m.control),N=m.formState.errors;return(0,a.useEffect)((function(){_((0,p.Z)({},t))}),[t]),(0,h.jsxs)("form",{onSubmit:v((function(e){if(t||(e._id=Math.random().toString().substr(-8)),e.amount>e.due)return(0,u.N)({type:"error",message:"Enter an amount less or equal to ".concat(e.due)});e.no=+e.no,c(e),_()})),className:"".concat(l.itemForm," grid gap-1"),children:[(0,h.jsx)(o.OC,{control:g,label:"Invoice No.",options:i.filter((function(e){return e.due})).map((function(e){return{label:"".concat(e.no,". ").concat((0,o._7)(e.dateTime,"DD-MM-YY")," Due: ").concat(e.due),value:e.no,data:e}})),name:"no",formOptions:{required:!0},onChange:function(e){"string"===typeof e||(j("no",e.data.no),j("due",e.data.due),j("net",e.data.net))},type:"number",className:l.itemName}),(0,h.jsx)(o.II,(0,p.Z)((0,p.Z)({label:"Net",type:"number"},x("net")),{},{readOnly:!0})),(0,h.jsx)(o.II,(0,p.Z)((0,p.Z)({label:"Due",type:"number"},x("due")),{},{readOnly:!0})),(0,h.jsx)(o.II,(0,p.Z)((0,p.Z)({label:"Amount",type:"number",step:"0.01",required:!0},x("amount")),{},{error:N.amount})),t?(0,h.jsxs)("div",{className:"flex ".concat(l.btns),children:[(0,h.jsx)("button",{type:"submit",children:(0,h.jsx)(s.l_A,{})}),(0,h.jsx)("button",{type:"button",onClick:function(){return n(null)},children:(0,h.jsx)(s.aHS,{})})]}):(0,h.jsx)("button",{className:"btn",children:t?"Update":"Add"})]})},N=function(e){var t,n=e.invoices,v=e.edit,x=e.items,b=e.setItems,j=e.receipts,N=e.setErr,D=e.onSuccess,I=(0,a.useContext)(r.D),A=I.config,S=I.finPeriod,Z=(0,a.useState)(!(null===v||void 0===v||null===(t=v.invoices)||void 0===t||!t.length)),C=(0,c.Z)(Z,2),Y=C[0],E=C[1],k=(0,a.useState)(null),w=(0,c.Z)(k,2),M=w[0],q=w[1],F=(0,a.useState)("table"),R=(0,c.Z)(F,2),O=R[0],T=R[1],H=(0,f.cI)({resolver:(0,d.y)(_)}),P=H.handleSubmit,z=H.register,Q=H.reset,V=H.setValue,W=H.watch,X=H.control,B=H.formState.errors,J=(0,d.i)(m.Hv.receipts+"/".concat((null===v||void 0===v?void 0:v._id)||"")),L=J.post,G=J.put,U=J.loading,K=(0,a.useCallback)((function(e){if(x.length>0){x.reduce((function(e,t){return e+t.net}),0);var t=x.reduce((function(e,t){return e+t.amount}),0);x.reduce((function(e,t){return e+t.due}),0);if(t>e.amount)return(0,u.N)({type:"error",message:"Adjusted amount (".concat(t,") can not be more than the receipt amount.")})}(v?G:L)({dateTime:e.date,amount:e.amount,type:e.type,customerAccountId:e.customerAccountId,customerAccountName:e.customerAccountName,cashAccountId:e.cashAccountId,cashAccountName:e.cashAccountName,customer:{detail:e.customerDetail},invoices:x.map((function(e){return(0,p.Z)((0,p.Z)({},e),{},{_id:void 0})}))}).then((function(e){var t=e.data;if(!t.success)return(0,u.N)({type:"error",message:t.message});D(t.data)})).catch((function(e){return(0,u.N)({type:"error",message:e.message})}))}),[x]),$=W("customerName");return(0,a.useEffect)((function(){var e,t,n,i,c,a,r,s,u,l=null!==v&&void 0!==v&&v.dateTime?new Date(null===v||void 0===v?void 0:v.dateTime):new Date;S&&l<new Date(S.startDate)?l=S.startDate:S&&l>new Date(S.endDate)&&(l=S.endDate),Q((0,p.Z)((0,p.Z)({},v),{},{date:(0,o._7)(l,"YYYY-MM-DD"),cashAccountId:(null===v||void 0===v||null===(e=v.accountingEntries)||void 0===e||null===(t=e[0])||void 0===t?void 0:t.accountId)||"",cashAccountName:(null===v||void 0===v||null===(n=v.accountingEntries)||void 0===n||null===(i=n[0])||void 0===i?void 0:i.accountName)||"",customerAccountId:(null===v||void 0===v||null===(c=v.accountingEntries)||void 0===c||null===(a=c[1])||void 0===a?void 0:a.accountId)||"",customerAccountName:(null===v||void 0===v||null===(r=v.accountingEntries)||void 0===r||null===(s=r[1])||void 0===s?void 0:s.accountName)||"",customerDetail:(null===v||void 0===v||null===(u=v.customer)||void 0===u?void 0:u.detail)||""}))}),[v]),(0,h.jsxs)("div",{className:"".concat(l.mainForm," grid gap-1"),children:[(0,h.jsxs)("form",{className:"".concat(l.mainFormWrapper," grid gap-1 all-columns"),onSubmit:P(K),children:[(0,h.jsx)(o.II,(0,p.Z)((0,p.Z)((0,p.Z)({label:"Date",type:"date"},S&&{min:(0,o._7)(S.startDate,"YYYY-MM-DD"),max:(0,o._7)(S.endDate,"YYYY-MM-DD")}),z("date")),{},{required:!0,error:B.date})),(0,h.jsx)(o.OC,{label:"Cash/Bank Account",control:X,name:"cashAccountId",formOptions:{required:!0},url:m.Hv.accountingMasters,getQuery:function(e){return{types:"Cash,Bank",isGroup:"false",name:e}},handleData:function(e){return{label:"".concat(e.name).concat(e.type?" - ".concat(e.type):""),value:e._id,account:e}},onChange:function(e){var t;V("cashAccountName",null===(t=e.account)||void 0===t?void 0:t.name)}}),(0,h.jsx)(o.II,(0,p.Z)((0,p.Z)({label:"Amount",type:"number",step:"0.01",required:!0},z("amount")),{},{error:B.amount})),(0,h.jsx)("div",{className:"all-columns",children:(0,h.jsx)("h3",{children:"Account Information"})}),(0,h.jsx)(o.OC,{label:"Customer Account",control:X,name:"customerAccountId",formOptions:{required:!0},url:m.Hv.accountingMasters,getQuery:function(e){return{isGroup:"false",name:e}},handleData:function(e){return{label:"".concat(e.name).concat(e.type?" - ".concat(e.type):""),value:e._id,account:e}},onChange:function(e){var t;V("customerAccountName",null===(t=e.account)||void 0===t?void 0:t.name)}}),(0,h.jsx)(o.gx,(0,p.Z)((0,p.Z)({label:"Detail",required:!0},z("customerDetail")),{},{error:B.customerDetail}))]}),(0,h.jsx)("div",{className:"all-columns flex justify-center",children:(0,h.jsxs)("button",{className:"btn",onClick:function(){E(!Y),b([])},children:[Y?"Clear":"Adjust"," Invoices"]})}),Y&&(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)("h3",{children:"Adjusted Invoices"}),(0,h.jsx)(o.mQ,{secondary:!0,activeTab:O,onChange:function(e){return T(e.value)},tabs:[{label:"Invoice Table",value:"table"},{label:"Search Invoice",value:"search"}]})]}),Y&&"table"===O&&(n.filter((function(e){return e.customer.name===$&&(x.some((function(t){return t.no===e.no}))||e.due)})).length>0?(0,h.jsx)(o.iA,{className:l.invoiceTable,columns:[{label:"Invoice No"},{label:"Date"},{label:"Customer"},{label:"Net",className:"text-right"},{label:"Due",className:"text-right"},{label:"Adjust"}],children:n.filter((function(e){return e.customer.name===$&&(x.some((function(t){return t.no===e.no}))||e.due)})).map((function(e){return(0,h.jsx)(y,{invoice:e,config:A,items:x,setItems:b},e._id)}))}):(0,h.jsx)("p",{className:l.noContent,children:"No pending invoice from selected customer."})),Y&&"search"===O&&(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(g,{invoices:n.filter((function(e){return e.customer.name===$})),edit:M,setEdit:q,receipts:j,onSuccess:function(e){if(N(null),M)b((function(t){return t.map((function(t){return t._id===e._id?e:t}))})),q(null);else{if(x.some((function(t){return t.no.toString()===e.no.toString()})))return(0,u.N)({type:"error",message:"Invoice has already been added."});b((function(t){return[].concat((0,i.Z)(t),[e])}))}}},M?"edit":"add"),x.length>0?(0,h.jsx)(o.iA,{className:l.items,columns:[{label:"Invoice No."},{label:"Amount",className:"text-right"},{label:"Action",action:!0}],children:x.map((function(e,t){return(0,h.jsxs)("tr",{children:[(0,h.jsx)("td",{className:l.name,children:(0,h.jsx)("span",{className:"ellipsis",children:e.no})}),(0,h.jsx)("td",{className:"text-right",children:e.amount.fix(2,null===A||void 0===A?void 0:A.numberSeparator)}),(0,h.jsx)(o.p2,{actions:[{icon:(0,h.jsx)(s.KHI,{}),label:"Edit",onClick:function(){return q(e)}},{icon:(0,h.jsx)(s.lp8,{}),label:"Delete",onClick:function(){return(0,u.N)({type:"confirmation",message:"Are you sure you want to remove this Item?",callback:function(){b((function(t){return t.filter((function(t){return t._id!==e._id}))}))}})}}]})]},t)}))}):(0,h.jsx)("p",{className:l.noContent,children:"No invoices selected."})]}),(0,h.jsx)("form",{className:"".concat(l.btnsWrapper," grid gap-1 all-columns"),onSubmit:P(K),children:(0,h.jsx)("div",{className:"btns",children:(0,h.jsx)("button",{className:"btn",disabled:M||U,children:v?"Update":"Submit"})})})]})},y=function(e){var t,n,r,s=e.invoice,u=e.items,d=e.setItems,m=e.config,p=(0,a.useState)((null===(t=u.find((function(e){return e.no===s.no})))||void 0===t?void 0:t.amount)||""),f=(0,c.Z)(p,2),v=f[0],x=f[1];return(0,a.useEffect)((function(){var e;x((null===(e=u.find((function(e){return e.no===s.no})))||void 0===e?void 0:e.amount)||"")}),[u]),(0,h.jsxs)("tr",{children:[(0,h.jsxs)("td",{children:[s.no,(null===m||void 0===m||null===(n=m.print)||void 0===n?void 0:n.invoiceNoSuffix)||""]}),(0,h.jsx)("td",{className:l.date,children:(0,h.jsx)(o.W7,{format:"DD/MM/YYYY",children:s.date})}),(0,h.jsx)("td",{className:l.customer,children:null===(r=s.customer)||void 0===r?void 0:r.name}),(0,h.jsx)("td",{className:"text-right ".concat(l.net),children:s.net.fix(2,null===m||void 0===m?void 0:m.numberSeparator)}),(0,h.jsx)("td",{className:"text-right ".concat(l.net),children:s.due.fix(2,null===m||void 0===m?void 0:m.numberSeparator)}),(0,h.jsx)("td",{children:(0,h.jsx)(o.II,{placeholder:"Adjust",type:"number",onBlur:function(e){var t=+e.target.value||0;if(t<=0)return e.target.value="",void d((function(e){return(0,i.Z)(e.filter((function(e){return e.no!==s.no})))}));s.due&&d((function(e){return[].concat((0,i.Z)(e.filter((function(e){return e.no!==s.no}))),[{_id:Math.random().toString().substr(-8),no:s.no,due:s.due,net:s.net,amount:Math.min(t,s.due)}])}))},value:v,onChange:function(e){return x(e.target.value)}})})]})},D=function(e){var t,n,i,s,u,f=e.edit,v=e.receipts,_=e.onSuccess,b=(0,a.useContext)(r.D),g=(b.user,b.config),y=b.checkPermission,D=(0,a.useState)(!!f),I=(0,c.Z)(D,2),A=I[0],S=I[1],Z=(0,a.useState)((null===f||void 0===f?void 0:f.invoices)||[]),C=(0,c.Z)(Z,2),Y=C[0],E=C[1],k=(0,a.useState)(null),w=(0,c.Z)(k,2),M=w[0],q=w[1],F=(0,a.useRef)(),R=((0,x.useReactToPrint)({content:function(){return F.current}}),(0,a.useState)([])),O=(0,c.Z)(R,2),T=O[0],H=O[1],P=(0,d.i)(m.Hv.invoices).get;return(0,a.useEffect)((function(){P().then((function(e){var t=e.data;null!==t&&void 0!==t&&t.success&&H(t.data.map((function(e){return(0,p.Z)((0,p.Z)({},e),{},{due:e.due.fix(2),net:e.items.reduce((function(e,t){return e+t.qty*t.price}),0)+e.items.reduce((function(e,t){return e+t.qty*t.price}),0).percent(e.gst)})})))}))}),[]),(0,h.jsxs)("div",{className:"grid gap-1 p-1 ".concat(l.addReceiptForm," ").concat(A?l.viewOnly:""),children:[A&&(0,h.jsxs)("div",{className:"flex wrap gap-1 ".concat(l.receiptDetail),children:[(0,h.jsx)("div",{className:"flex gap-1 all-columns justify-end align-center",children:y("receipt_update")&&(0,h.jsx)("button",{className:"btn",onClick:function(){return S(!1)},children:"Edit"})}),(0,h.jsxs)("div",{className:l.box,children:[(0,h.jsx)("h3",{children:"Customer Information"}),(0,h.jsx)(j,{label:"Name",value:null===(t=f.accountingEntries)||void 0===t||null===(n=t[0])||void 0===n?void 0:n.accountName}),(0,h.jsx)(j,{label:"Detail",value:(null===(i=f.customer)||void 0===i||null===(s=i.detail)||void 0===s?void 0:s.split("\n").map((function(e,t,n){return(0,h.jsxs)("span",{children:[e,n[t+1]&&(0,h.jsx)("br",{})]},t)})))||null})]}),(0,h.jsxs)("div",{className:l.box,children:[(0,h.jsx)("h3",{children:"Receipt Information"}),(0,h.jsx)(j,{label:"Inv No",className:"flex justify-space-between",value:"".concat(f.no).concat((null===g||void 0===g||null===(u=g.print)||void 0===u?void 0:u.receiptNoSuffix)||"")}),(0,h.jsx)(j,{label:"Date",className:"flex justify-space-between",value:(0,o._7)(null===f||void 0===f?void 0:f.dateTime,"DD-MM-YYYY")}),(0,h.jsx)(j,{label:"Amount",value:f.amount.fix(2,null===g||void 0===g?void 0:g.numberSeparator),className:"flex justify-space-between"}),(0,h.jsx)(j,{label:"Adjusted",value:f.invoices.reduce((function(e,t){return e+t.amount}),0).fix(2,null===g||void 0===g?void 0:g.numberSeparator),className:"flex justify-space-between"})]})]}),M&&(0,h.jsx)("p",{className:"error",children:M}),!1,!A&&(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)("h3",{children:"Receipt Information"}),(0,h.jsx)(N,{invoices:T,edit:f,items:Y,setItems:E,receipts:v,setErr:q,onSuccess:_,setViewOnly:S})]})]})},I=n(5804),A=n(657),S=function(e){var t=e.setSidebarOpen,n=(0,a.useContext)(r.D),p=n.config,f=n.checkPermission,v=(0,a.useState)([]),x=(0,c.Z)(v,2),_=x[0],b=x[1],j=(0,a.useState)(null),g=(0,c.Z)(j,2),N=g[0],y=g[1],S=(0,a.useState)(!1),Z=(0,c.Z)(S,2),C=Z[0],Y=Z[1],E=(0,d.i)(m.Hv.receipts),k=E.get,w=E.loading,M=(0,d.i)(m.Hv.receipts+"/{ID}").remove;return(0,a.useEffect)((function(){k().then((function(e){var t=e.data;if(t.success)return b(t.data)})).catch((function(e){return(0,u.N)({type:"error",message:e.message})}))}),[]),(0,h.jsxs)("div",{className:"".concat(l.content," grid gap-1 m-a p-1"),children:[(0,h.jsx)("div",{className:"flex ".concat(l.head),children:(0,h.jsxs)("div",{className:"flex align-center pointer gap_5  ml-1",onClick:function(){return t((function(e){return!e}))},children:[(0,h.jsx)(I.Ps6,{style:{fontSize:"1.75rem"}}),(0,h.jsx)("h2",{children:"All Receipts"}),f("reciept_create")&&(0,h.jsx)("button",{className:"btn clear iconOnly",onClick:function(e){e.stopPropagation(),Y(!0)},children:(0,h.jsx)(A.ueT,{})})]})}),(0,h.jsx)(o.iA,{loading:w,className:l.receipts,columns:[{label:"No."},{label:"Date"},{label:"Account"},{label:"Amount",className:"text-right"},{label:"Action"}],children:_.map((function(e){var t,n,c;return(0,h.jsxs)("tr",{onClick:function(){y(e),Y(!0)},style:{cursor:"pointer"},children:[(0,h.jsxs)("td",{className:l.no,children:[e.no,(null===p||void 0===p||null===(t=p.print)||void 0===t?void 0:t.receiptNoSuffix)||""]}),(0,h.jsx)("td",{className:l.date,children:(0,h.jsx)(o.W7,{format:"DD/MM/YYYY",children:e.dateTime})}),(0,h.jsx)("td",{className:l.customer,children:null===(n=e.accountingEntries)||void 0===n||null===(c=n[0])||void 0===c?void 0:c.accountName}),(0,h.jsx)("td",{className:"text-right ".concat(l.net),children:e.amount.fix(2,null===p||void 0===p?void 0:p.numberSeparator)}),(0,h.jsx)(o.p2,{className:l.actions,actions:[{icon:(0,h.jsx)(s.z5B,{}),label:"View",onClick:function(){y(e),Y(!0)}}].concat((0,i.Z)(f("reciept_delete")?[{icon:(0,h.jsx)(s.lp8,{}),label:"Delete",onClick:function(){return(0,u.N)({type:"confirmation",message:"Are you sure you want to remove this receipt?",callback:function(){M({},{params:{"{ID}":e._id}}).then((function(t){var n=t.data;n.success?b((function(t){return t.filter((function(t){return t._id!==e._id}))})):(0,u.N)({type:"error",message:n.message})}))}})}}]:[]))})]},e._id)}))}),(0,h.jsx)(u.u,{open:C,head:!0,label:"".concat(N?"View / Update":"Add"," Receipt"),className:l.addReceiptFormModal,setOpen:function(){y(null),Y(!1)},children:(0,h.jsx)(D,{edit:N,receipts:_,onSuccess:function(e){N?(b((function(t){return t.map((function(t){return t._id===e._id?e:t}))})),y(null)):b((function(t){return[].concat((0,i.Z)(t),[e])})),Y(!1)}})})]})}}}]);
//# sourceMappingURL=518.1fffaeaf.chunk.js.map