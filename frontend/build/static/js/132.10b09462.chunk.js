"use strict";(self.webpackChunkcash_app=self.webpackChunkcash_app||[]).push([[132],{4132:function(e,t,r){r.r(t),r.d(t,{default:function(){return q}});var n=r(2982),s=r(885),a=r(2791),i=r(4581),l=r(5470),o=r(2202),c=r(8750),d={content:"orders_content__0maeJ",orders:"orders_orders__M1WI6",addOrderForm:"orders_addOrderForm__b8qQB",orderDetail:"orders_orderDetail__emus2",box:"orders_box__e+Od2",noContent:"orders_noContent__JRvE8",items:"orders_items__0tplX",name:"orders_name__fBHjv",itemForm:"orders_itemForm__9AM9v",mainForm:"orders_mainForm__kCez3",detail:"orders_detail__s8bL4",label:"orders_label__2Rb59",viewOnly:"orders_viewOnly__XFP1Y",print:"orders_print__1CmQf",logo:"orders_logo__VW3dK",taxes:"orders_taxes__tvA5T",totalAmount:"orders_totalAmount__6Da0x",word:"orders_word__jc4MS",digit:"orders_digit__cmRoV",sign:"orders_sign__1OprF",signature:"orders_signature__V-faS",head:"orders_head__eyhRW",date:"orders_date__IM8-T",customer:"orders_customer__dE0AH",net:"orders_net__YxGLP",actions:"orders_actions__UO2gj",itemName:"orders_itemName__x6ZBL"},u=r(5454),m=r(1080),x=r(1413),h=r(1134),p=r(1570),f=r(1146),v=r(184),j=function(e){var t=e.label,r=e.value;return(0,v.jsxs)("p",{className:d.detail,children:[(0,v.jsx)("span",{className:d.label,children:t}),":"," ",(0,v.jsx)("span",{className:d.value,children:r})]})},b=(0,a.forwardRef)((function(e,t){var r,o,c,u,m,h,p,f,b,g=e.order,_=e.user,N=(0,a.useContext)(i.D).config,y=(0,a.useState)(null),S=(0,s.Z)(y,2),D=S[0],C=S[1];return(0,a.useEffect)((function(){if(null!==N&&void 0!==N&&N.print){var e=["no","product","qty","unit","total"],t=(0,n.Z)(N.print.itemColumns.sort((function(t,r){return e.indexOf(t)>e.indexOf(r)?1:-1})).filter((function(e){return!["no","product"].includes(e)})));C({gridTemplateColumns:"".concat(N.print.itemColumns.includes("no")?"3rem":""," ").concat(N.print.itemColumns.includes("product")?42-6*t.length+"rem":""," repeat(auto-fit, minmax(86px, 1fr))")})}}),[g]),null!==N&&void 0!==N&&N.print?(0,v.jsxs)("div",{className:d.print,ref:t,children:[(0,v.jsxs)("header",{children:[_.logo&&(0,v.jsx)("img",{className:d.logo,src:_.logo}),(0,v.jsxs)("div",{children:[(0,v.jsx)("h2",{children:_.name}),_.motto&&(0,v.jsx)("p",{children:_.motto})]}),(0,v.jsx)("h4",{children:"Invoice"})]}),(0,v.jsxs)("div",{className:"".concat(d.info," flex wrap gap-1 mt-1"),children:[(0,v.jsxs)("div",{className:"".concat(d.box," flex-1"),children:[(0,v.jsx)("p",{children:"To:"}),(0,v.jsx)(j,{label:"Name",value:null===(r=g.vendor)||void 0===r?void 0:r.name}),(0,v.jsx)(j,{label:"Detail",value:(null===(o=g.vendor)||void 0===o||null===(c=o.detail)||void 0===c?void 0:c.split("\n").map((function(e,t,r){return(0,v.jsxs)("span",{children:[e,r[t+1]&&(0,v.jsx)("br",{})]},t)})))||null})]}),(0,v.jsxs)("div",{className:"".concat(d.box," flex-1"),children:[(0,v.jsx)(j,{label:"Date",value:(0,l._7)(null===g||void 0===g?void 0:g.date,"DD-MM-YYYY")}),(0,v.jsx)(j,{label:"GSTIN",value:_.gstin}),(0,v.jsx)(j,{label:"PAN",value:_.pan}),_.bankDetails&&(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(j,{label:"Bank",value:_.bankDetails.bankName}),(0,v.jsx)(j,{label:"Branch",value:_.bankDetails.branch}),(0,v.jsx)(j,{label:"A/C No.",value:_.bankDetails.accNo})]}),(0,v.jsx)(j,{label:"IFSC",value:_.ifsc}),(0,v.jsx)(j,{label:"Address",value:(null===(u=_.address)||void 0===u?void 0:u.street)||""}),(0,v.jsx)(j,{label:"Phone",value:_.phone}),(0,v.jsx)(j,{label:"Email",value:_.email})]})]}),N.print.itemColumns.length>0&&(0,v.jsx)(l.iA,{className:"".concat(d.items," mt-1"),theadTrStyle:(0,x.Z)({},D),columns:N.print.itemColumns.map((function(e){return"no"===e?{label:"No"}:"product"===e?{label:"Product"}:"price"===e?{label:"Price",className:"text-right"}:"qty"===e?{label:"QTY",className:"text-right"}:"unit"===e?{label:"Unit"}:"total"===e?{label:"Total (".concat(N.print.currency,")"),className:"text-right"}:void 0})),children:g.items.map((function(e,t){return(0,v.jsxs)("tr",{style:(0,x.Z)({},D),children:[N.print.itemColumns.includes("no")&&(0,v.jsx)("td",{children:t+1}),N.print.itemColumns.includes("product")&&(0,v.jsx)("td",{children:(0,v.jsx)("span",{className:"ellipsis",children:e.name})}),N.print.itemColumns.includes("price")&&(0,v.jsx)("td",{className:"text-right",children:e.price.fix(2,null===N||void 0===N?void 0:N.numberSeparator)}),N.print.itemColumns.includes("qty")&&(0,v.jsx)("td",{className:"text-right",children:e.qty}),N.print.itemColumns.includes("unit")&&(0,v.jsx)("td",{children:e.unit}),N.print.itemColumns.includes("total")&&(0,v.jsx)("td",{className:"text-right",children:(e.price*e.qty).fix(2,null===N||void 0===N?void 0:N.numberSeparator)})]},t)}))}),g.gst&&(0,v.jsx)(l.iA,{className:"".concat(d.taxes," mt-1"),columns:[{label:"No."},{label:"Description of Tax"},{label:"Rate of Tax",className:"text-right"},{label:"Taxable Amount (".concat(N.print.currency,")"),className:"text-right"},{label:"Tax Amount (".concat(N.print.currency,")"),className:"text-right"}],children:(0,v.jsxs)("tr",{children:[(0,v.jsx)("td",{children:"1"}),(0,v.jsx)("td",{children:"Integrated GST"}),(0,v.jsx)("td",{className:"text-right",children:g.gst.fix(2,null===N||void 0===N?void 0:N.numberSeparator)}),(0,v.jsx)("td",{className:"text-right",children:g.items.reduce((function(e,t){return e+t.qty*t.price}),0).fix(2,null===N||void 0===N?void 0:N.numberSeparator)}),(0,v.jsx)("td",{className:"text-right",children:g.items.reduce((function(e,t){return e+t.qty*t.price}),0).percent(g.gst).fix(2,null===N||void 0===N?void 0:N.numberSeparator)})]})}),(0,v.jsxs)("div",{className:"".concat(d.totalAmount," mt-1"),children:[(0,v.jsxs)("p",{className:d.word,children:["Total:"," ",g.items.reduce((function(e,t){return e+t.qty*t.price}),0).toWords()]}),(0,v.jsx)("p",{className:d.digit,children:(g.items.reduce((function(e,t){return e+t.qty*t.price}),0)+g.items.reduce((function(e,t){return e+t.qty*t.price}),0).percent(g.gst||0)).fix(2,null===N||void 0===N?void 0:N.numberSeparator)})]}),((null===(m=_.terms)||void 0===m?void 0:m.length)||(null===(h=_.ownerDetails)||void 0===h?void 0:h.name))&&(0,v.jsxs)("footer",{className:"flex gap-1 align-end mt-1",children:[(null===(p=_.terms)||void 0===p?void 0:p.length)>0&&(0,v.jsxs)("div",{className:"".concat(d.box," flex-1 mb-2"),children:[(0,v.jsx)("strong",{children:"Terms & Conditions:"})," ",(0,v.jsx)("ol",{className:"ml-2 mt-1",children:null===(f=_.terms)||void 0===f?void 0:f.map((function(e,t){return(0,v.jsx)("li",{children:e},t)}))})]}),(null===(b=_.ownerDetails)||void 0===b?void 0:b.name)&&(0,v.jsxs)("div",{className:d.sign,children:[(0,v.jsxs)("p",{children:["For ",_.name]}),_.ownerDetails.signature&&(0,v.jsx)("img",{className:d.signature,src:_.ownerDetails.signature}),(0,v.jsx)("p",{children:(0,v.jsx)("strong",{children:_.ownerDetails.name})})]})]})]}):(0,v.jsx)("div",{className:d.print,ref:t,children:(0,v.jsx)("p",{children:"Please update print configuration in the settings."})})})),g=p.Ry({dateTime:p.Z_().required(),customerName:p.Z_().required(),customerDetail:p.Z_().required()}),_=p.Ry({name:p.Z_().required(),price:p.Rx().min(0,"Price can not be less than 0").required().typeError("Enter a valid Number"),qty:p.Rx().min(1,"Qty can not be less than 1").required().typeError("Enter a valid Number"),unit:p.Vo((function(e){switch(typeof e){case"object":return p.Ry().typeError("Select a unit").required();case"string":return p.Z_().required();default:return p.nK().required()}}))}),N=function(e){var t=e.label,r=e.value,n=e.className;return(0,v.jsxs)("p",{className:"".concat(d.detail," ").concat(n||""),children:[(0,v.jsxs)("span",{className:d.label,children:[t,":"]})," ",(0,v.jsx)("span",{className:d.value,children:r})]})},y=function(e){var t=e.edit,r=e.orders,s=e.onSuccess,o=(0,a.useContext)(i.D).config,c=(0,h.cI)({defaultValues:{unit:"Piece"},resolver:(0,u.y)(_)}),m=c.handleSubmit,p=c.register,f=c.reset,j=c.watch,b=c.setValue,g=c.control,N=c.formState.errors;return(0,a.useEffect)((function(){f((0,x.Z)({},t))}),[t]),(0,v.jsxs)("form",{onSubmit:m((function(e){t||(e._id=Math.random().toString().substr(-8)),s(e),f()})),className:"".concat(d.itemForm," grid gap-1"),children:[(0,v.jsx)(l.Um,{label:"Product",data:r.reduce((function(e,t){return[].concat((0,n.Z)(e),(0,n.Z)(t.items))}),[]).map((function(e){return{label:e.name,value:e.name,data:e}})),register:p,name:"name",formOptions:{required:!0},renderListItem:function(e){return(0,v.jsx)(v.Fragment,{children:e.label})},watch:j,setValue:b,onChange:function(e){"string"===typeof e?b("name",e):(b("name",e.name),b("price",e.price))},error:N.name,className:d.itemName}),(0,v.jsx)(l.II,(0,x.Z)((0,x.Z)({label:"Price",type:"number",required:!0},p("price")),{},{error:N.price})),(0,v.jsx)(l.II,(0,x.Z)((0,x.Z)({label:"Qty",type:"number",required:!0},p("qty")),{},{error:N.qty})),(0,v.jsx)(l.hQ,{label:"Unit",control:g,name:"unit",formOptions:{required:!0},options:o.unitsOfMeasure.map((function(e){return{label:e,value:e}}))}),(0,v.jsx)("button",{className:"btn",children:t?"Update":"Add"})]})},S=function(e){var t=e.disabled,r=e.edit,s=e.items,i=e.orders,o=e.setErr,p=e.onSuccess,f=(0,h.cI)({resolver:(0,u.y)(g)}),j=f.handleSubmit,b=f.register,_=f.reset,N=f.setValue,y=f.watch,S=f.control,D=f.formState.errors,C=(0,u.i)(m.Hv.orders+"/".concat((null===r||void 0===r?void 0:r._id)||"")),Z=C.post,q=C.put,w=C.loading;return(0,a.useEffect)((function(){var e,t;_((0,x.Z)((0,x.Z)({},r),{},{status:(null===r||void 0===r?void 0:r.status)||"pending",dateTime:(0,l._7)(null===r||void 0===r?void 0:r.dateTime,"YYYY-MM-DD"),customerName:(null===r||void 0===r||null===(e=r.customer)||void 0===e?void 0:e.name)||"",customerDetail:(null===r||void 0===r||null===(t=r.customer)||void 0===t?void 0:t.detail)||""}))}),[r]),(0,v.jsxs)("form",{onSubmit:j((function(e){if(s.length<1)return o("Add at least one item");(r?q:Z)({dateTime:e.dateTime,status:e.status,customer:{name:e.customerName,detail:e.customerDetail},items:s.map((function(e){return(0,x.Z)((0,x.Z)({},e),{},{_id:void 0})}))}).then((function(e){var t=e.data;if(!t.success)return(0,c.N)({type:"error",message:t.message});p(t.data)})).catch((function(e){return(0,c.N)({type:"error",message:e.message})}))})),className:"".concat(d.mainForm," grid gap-1"),children:[(0,v.jsx)(l.II,(0,x.Z)((0,x.Z)({label:"Date",type:"date"},b("dateTime")),{},{required:!0,error:D.dateTime})),(0,v.jsx)(l.hQ,{label:"Status",name:"status",control:S,options:[{label:"Pending",value:"pending"},{label:"Complete",value:"complete"},{label:"Cancelled",value:"cancelled"}]}),(0,v.jsx)("div",{className:"all-columns",children:(0,v.jsx)("h3",{children:"Customer Information"})}),(0,v.jsx)(l.Um,{label:"Name",data:(0,n.Z)(new Set(i.map((function(e){return e.customer.name})))).map((function(e){var t;return{label:e,value:e,data:null===(t=i.find((function(t){return t.customer.name===e})))||void 0===t?void 0:t.customer}})),register:b,name:"customerName",formOptions:{required:!0},renderListItem:function(e){return(0,v.jsx)(v.Fragment,{children:e.label})},watch:y,setValue:N,onChange:function(e){"string"===typeof e?N("customerName",e):(N("customerName",e.name),N("customerDetail",e.detail))},error:D.customerName}),(0,v.jsx)(l.gx,(0,x.Z)((0,x.Z)({label:"Detail"},b("customerDetail")),{},{required:!0,error:D.customerDetail})),(0,v.jsx)("div",{className:"btns",children:(0,v.jsx)("button",{className:"btn medium",disabled:t||w,children:r?"Update":"Submit"})})]})},D=function(e){var t,r,u,m=e.edit,x=e.orders,h=e.onSuccess,p=(0,a.useContext)(i.D),j=p.user,g=p.config,_=p.checkPermission,D=(0,a.useState)(!!m),C=(0,s.Z)(D,2),Z=C[0],q=C[1],w=(0,a.useState)((null===m||void 0===m?void 0:m.items)||[]),T=(0,s.Z)(w,2),I=T[0],A=T[1],O=(0,a.useState)(null),k=(0,s.Z)(O,2),Y=k[0],F=k[1],P=(0,a.useState)(null),E=(0,s.Z)(P,2),M=E[0],R=E[1],V=(0,a.useRef)();(0,f.useReactToPrint)({content:function(){return V.current}});return(0,v.jsxs)("div",{className:"grid gap-1 ".concat(d.addOrderForm," ").concat(Z?d.viewOnly:""),children:[(0,v.jsxs)("div",{className:"grid gap-1 p-1",children:[Z&&(0,v.jsxs)("div",{className:"flex wrap gap-1 ".concat(d.orderDetail),children:[(0,v.jsxs)("div",{className:d.box,children:[(0,v.jsx)("h3",{children:"Customer Information"}),(0,v.jsx)(N,{label:"Name",value:null===(t=m.customer)||void 0===t?void 0:t.name}),(0,v.jsx)(N,{label:"Detail",value:(null===(r=m.customer)||void 0===r||null===(u=r.detail)||void 0===u?void 0:u.split("\n").map((function(e,t,r){return(0,v.jsxs)("span",{children:[e,r[t+1]&&(0,v.jsx)("br",{})]},t)})))||null})]}),(0,v.jsxs)("div",{className:d.box,children:[(0,v.jsx)("h3",{children:"Order Information"}),(0,v.jsx)(N,{label:"Status",value:m.status,className:"flex justify-space-between"}),(0,v.jsx)(N,{label:"Date",value:(0,l._7)(null===m||void 0===m?void 0:m.dateTime,"DD-MM-YYYY"),className:"flex justify-space-between"}),(0,v.jsx)(N,{label:"Total",value:m.items.reduce((function(e,t){return e+t.qty*t.price}),0).fix(2,null===g||void 0===g?void 0:g.numberSeparator),className:"flex justify-space-between"})]})]}),(0,v.jsx)("h3",{children:"Items"}),I.length>0?(0,v.jsx)(l.iA,{className:d.items,columns:[{label:"Product"},{label:"Qty",className:"text-right"},{label:"Unit"},{label:"Rate",className:"text-right"},{label:"Total",className:"text-right"}].concat((0,n.Z)(Z?[]:[{label:"Action",action:!0}])),children:I.map((function(e,t){return(0,v.jsxs)("tr",{children:[(0,v.jsx)("td",{className:d.name,children:(0,v.jsx)("span",{className:"ellipsis",children:e.name})}),(0,v.jsx)("td",{className:"text-right",children:e.qty}),(0,v.jsx)("td",{children:e.unit}),(0,v.jsx)("td",{className:"text-right",children:e.price.fix(2,null===g||void 0===g?void 0:g.numberSeparator)}),(0,v.jsx)("td",{className:"text-right",children:(e.price*e.qty).fix(2,null===g||void 0===g?void 0:g.numberSeparator)}),!Z&&(0,v.jsx)(l.p2,{actions:[{icon:(0,v.jsx)(o.KHI,{}),label:"Edit",onClick:function(){return F(e)}},{icon:(0,v.jsx)(o.lp8,{}),label:"Delete",onClick:function(){return(0,c.N)({type:"confirmation",message:"Are you sure you want to remove this Item?",callback:function(){A((function(t){return t.filter((function(t){return t._id!==e._id}))}))}})}}]})]},t)}))}):(0,v.jsx)("p",{className:d.noContent,children:"No items yet."}),M&&(0,v.jsx)("p",{className:"error",children:M}),m&&(0,v.jsx)("div",{style:{display:"none"},children:(0,v.jsx)(b,{ref:V,order:m,user:j})}),!Z&&(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(y,{edit:Y,orders:x,onSuccess:function(e){R(null),Y?(A((function(t){return t.map((function(t){return t._id===e._id?e:t}))})),F(null)):A((function(t){return[].concat((0,n.Z)(t),[e])}))}},Y?"edit":"add"),(0,v.jsx)("h3",{className:"mt-1",children:"Other Information"}),(0,v.jsx)(S,{disabled:Y,edit:m,items:I,orders:x,setErr:R,onSuccess:h,setViewOnly:q})]})]}),Z&&(0,v.jsx)("div",{className:"flex gap-1 all-columns border-t p-1 align-center",children:_("order_update")&&(0,v.jsx)("button",{className:"btn medium",onClick:function(){return q(!1)},children:"Edit"})})]})},C=r(5804),Z=r(657),q=function(e){var t=e.setSidebarOpen,r=(0,a.useContext)(i.D),x=r.config,h=r.checkPermission,p=(0,a.useState)([]),f=(0,s.Z)(p,2),j=f[0],b=f[1],g=(0,a.useState)(null),_=(0,s.Z)(g,2),N=_[0],y=_[1],S=(0,a.useState)(!1),q=(0,s.Z)(S,2),w=q[0],T=q[1],I=(0,u.i)(m.Hv.orders),A=I.get,O=I.loading,k=(0,u.i)(m.Hv.orders+"/{ID}").remove;return(0,a.useEffect)((function(){A().then((function(e){var t=e.data;if(t.success)return b(t.data)})).catch((function(e){return(0,c.N)({type:"error",message:e.message})}))}),[]),(0,v.jsxs)("div",{className:"".concat(d.content," grid gap-1 m-a"),children:[(0,v.jsx)("div",{className:"flex ".concat(d.head),children:(0,v.jsxs)("div",{className:"flex align-center pointer gap_5  ml-1",onClick:function(){return t((function(e){return!e}))},children:[(0,v.jsx)(C.Ps6,{style:{fontSize:"1.75rem"}}),(0,v.jsx)("h2",{children:"All Orders"}),h("order_create")&&(0,v.jsx)("button",{className:"btn clear iconOnly",onClick:function(e){e.stopPropagation(),T(!0)},children:(0,v.jsx)(Z.ueT,{})})]})}),(0,v.jsx)(l.iA,{loading:O,className:d.orders,columns:[{label:"Date"},{label:"Customer"},{label:"Status"},{label:"Net Amount",className:"text-right"},{label:"Action"}],children:j.map((function(e){var t;return(0,v.jsxs)("tr",{onClick:function(t){y(e),T(!0)},style:{cursor:"pointer"},children:[(0,v.jsx)("td",{className:d.date,children:(0,v.jsx)(l.W7,{format:"DD/MM/YYYY",children:e.dateTime})}),(0,v.jsx)("td",{className:d.customer,children:null===(t=e.customer)||void 0===t?void 0:t.name}),(0,v.jsx)("td",{children:e.status}),(0,v.jsx)("td",{className:"text-right ".concat(d.net),children:e.items.reduce((function(e,t){return e+t.qty*t.price}),0).fix(2,null===x||void 0===x?void 0:x.numberSeparator)}),(0,v.jsx)(l.p2,{className:d.actions,actions:[{icon:(0,v.jsx)(o.z5B,{}),label:"View",onClick:function(){y(e),T(!0)}}].concat((0,n.Z)(h("order_delete")?[{icon:(0,v.jsx)(o.lp8,{}),label:"Delete",onClick:function(){return(0,c.N)({type:"confirmation",message:"Are you sure you want to remove this order?",callback:function(){k({},{params:{"{ID}":e._id}}).then((function(t){var r=t.data;r.success?b((function(t){return t.filter((function(t){return t._id!==e._id}))})):(0,c.N)({type:"error",message:r.message})}))}})}}]:[]))})]},e._id)}))}),(0,v.jsx)(c.u,{open:w,head:!0,label:"".concat(N?"View / Update":"Add"," Order"),className:d.addOrderFormModal,setOpen:function(){y(null),T(!1)},children:(0,v.jsx)(D,{edit:N,orders:j,onSuccess:function(e){N?(b((function(t){return t.map((function(t){return t._id===e._id?e:t}))})),y(null)):b((function(t){return[].concat((0,n.Z)(t),[e])})),T(!1)}})})]})}}}]);
//# sourceMappingURL=132.10b09462.chunk.js.map