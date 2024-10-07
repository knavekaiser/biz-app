"use strict";(self.webpackChunkcash_app=self.webpackChunkcash_app||[]).push([[731],{4731:function(e,t,a){a.r(t),a.d(t,{default:function(){return v}});var n=a(2982),r=a(885),s=a(2791),i=a(5470),l=a(2202),d=a(8750),c={content:"style_content__Oj8it",emps:"style_emps__m2DET",addFormModal:"style_addFormModal__mwoE3",addForm:"style_addForm__KgwCr",empDetail:"style_empDetail__tRHTS",box:"style_box__lXoE1",mainForm:"style_mainForm__-zjJ0",head:"style_head__IlMrD"},o=a(1413),u=a(1134),m=a(5454),_=a(1570),p=a(1080),f=a(184),D=_.Ry({label:_.Z_().required("Label is required."),startDate:_.Z_().required("Start Date is required."),endDate:_.Z_().required("End Date is required.")}),b=function(e){var t=e.edit,a=e.onSuccess,n=(0,u.cI)({resolver:(0,m.y)(D)}),r=n.handleSubmit,l=n.reset,_=n.register,b=n.formState.errors,h=(0,m.i)(p.Hv.finPeriods+"/".concat((null===t||void 0===t?void 0:t._id)||"")),x=h.post,j=h.put,v=h.loading;return(0,s.useEffect)((function(){l({label:(null===t||void 0===t?void 0:t.label)||"",startDate:null!==t&&void 0!==t&&t.startDate?(0,i._7)(t.startDate,"YYYY-MM-DD"):"",endDate:null!==t&&void 0!==t&&t.endDate?(0,i._7)(t.endDate,"YYYY-MM-DD"):""})}),[t]),(0,f.jsx)("div",{className:"grid gap-1 p-1 ".concat(c.addForm),children:(0,f.jsxs)("form",{onSubmit:r((function(e){(t?j:x)(e).then((function(e){var t=e.data;if(!t.success)return(0,d.N)({type:"error",message:t.message});a(t.data)})).catch((function(e){return(0,d.N)({type:"error",message:e.message})}))})),className:"".concat(c.mainForm," grid gap-1"),children:[(0,f.jsx)(i.II,(0,o.Z)((0,o.Z)({label:"Label"},_("label")),{},{required:!0,error:b.label})),(0,f.jsx)(i.II,(0,o.Z)((0,o.Z)({label:"Start Date",type:"date"},_("startDate")),{},{error:b.startDate,required:!0})),(0,f.jsx)(i.II,(0,o.Z)((0,o.Z)({label:"End Date",type:"date"},_("endDate")),{},{required:!0,error:b.endDate})),(0,f.jsx)("div",{className:"btns",children:(0,f.jsx)("button",{className:"btn",disabled:v,children:t?"Update":"Submit"})})]})})},h=a(4581),x=a(5804),j=a(657),v=function(e){var t=e.setSidebarOpen,a=(0,s.useContext)(h.D),o=a.finPeriods,u=a.setFinPeriods,m=a.checkPermission,_=(0,s.useState)(null),p=(0,r.Z)(_,2),D=p[0],v=p[1],y=(0,s.useState)(!1),g=(0,r.Z)(y,2),Y=g[0],M=g[1];return(0,f.jsxs)("div",{className:"".concat(c.content," grid gap-1 m-a p-1"),children:[(0,f.jsx)("div",{className:"flex ".concat(c.head),children:(0,f.jsxs)("div",{className:"flex align-center pointer gap_5  ml-1",onClick:function(){return t((function(e){return!e}))},children:[(0,f.jsx)(x.Ps6,{style:{fontSize:"1.75rem"}}),(0,f.jsx)("h2",{children:"Financial Periods"}),m("fin_period_create")&&(0,f.jsx)("button",{className:"btn clear iconOnly",onClick:function(e){e.stopPropagation(),M(!0)},children:(0,f.jsx)(j.ueT,{})})]})}),(0,f.jsx)(i.iA,{className:c.emps,columns:[{label:"Label"},{label:"Start Date"},{label:"End Date"},{label:"Action"}],children:o.map((function(e){return(0,f.jsxs)("tr",{onClick:function(){v(e),M(!0)},style:{cursor:"pointer"},children:[(0,f.jsx)("td",{children:e.label}),(0,f.jsx)("td",{children:(0,f.jsx)(i.W7,{format:"DD MMM YYYY",children:e.startDate})}),(0,f.jsx)("td",{children:(0,f.jsx)(i.W7,{format:"DD MMM YYYY",children:e.endDate})}),(0,f.jsx)(i.p2,{className:c.actions,actions:(0,n.Z)(m("fin_period_update")?[{icon:(0,f.jsx)(l.KHI,{}),label:"Update",onClick:function(){v(e),M(!0)}}]:[])})]},e._id)}))}),(0,f.jsx)(d.u,{open:Y,head:!0,label:"".concat(D?"Update":"Add"," Financial Period"),className:c.addFormModal,setOpen:function(){v(null),M(!1)},children:(0,f.jsx)(b,{edit:D,onSuccess:function(e){D?(u((function(t){return e?t.map((function(t){return t._id===e._id?e:t})):t.filter((function(e){return e._id!==D._id}))})),v(null)):u((function(t){return[].concat((0,n.Z)(t),[e])})),M(!1)}})})]})}}}]);
//# sourceMappingURL=731.ccad8905.chunk.js.map