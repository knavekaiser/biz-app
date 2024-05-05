"use strict";(self.webpackChunkcash_app=self.webpackChunkcash_app||[]).push([[370],{7370:function(e,a,n){n.r(a),n.d(a,{default:function(){return v}});var s=n(2982),t=n(885),r=n(2791),c=n(4581),l=n(6884),o=n(6355),i=n(96),d={content:"roles_content__7vddl",roles:"roles_roles__IXgwH",addRoleForm:"roles_addRoleForm__gw1ju",roleDetail:"roles_roleDetail__Ns1JZ",box:"roles_box__c7xQ0",noContent:"roles_noContent__TV7sS",permissions:"roles_permissions__eDI5R",name:"roles_name__-FVjs",mainForm:"roles_mainForm__PfIjB",detail:"roles_detail__9YIVy",label:"roles_label__vRLQk",itemForm:"roles_itemForm__5GcJC",itemName:"roles_itemName__Ox8V2"},u=n(5454),m=n(1080),_=n(1413),f=n(1134),p=n(1570),h=n(184),b=p.Ry({name:p.Z_().required(),permissions:p.IX().of(p.Z_())}),x=function(e){var a=e.edit,n=e.dynamicTables,t=e.onSuccess,o=(0,r.useContext)(c.D).user,p=(0,f.cI)({resolver:(0,u.y)(b)}),x=p.handleSubmit,v=p.register,g=p.reset,N=p.watch,j=p.setValue,Z=p.formState.errors,y=(0,u.i)(m.Hv.roles+"/".concat((null===a||void 0===a?void 0:a._id)||"")),k=y.post,S=y.put,C=y.loading,I=N("permissions");return(0,r.useEffect)((function(){g({name:(null===a||void 0===a?void 0:a.name)||"",permissions:(null===a||void 0===a?void 0:a.permissions)||[]})}),[a]),(0,h.jsx)("div",{className:"grid gap-1 p-1 ".concat(d.addRoleForm),children:(0,h.jsxs)("form",{onSubmit:x((function(e){(a?S:k)(e).then((function(e){var a=e.data;if(!a.success)return(0,i.N)({type:"error",message:a.message});t(a.data)})).catch((function(e){return(0,i.N)({type:"error",message:e.message})}))})),className:"".concat(d.mainForm," grid gap-1"),children:[(0,h.jsx)("div",{className:d.box,children:(0,h.jsx)(l.II,(0,_.Z)((0,_.Z)({label:"Name"},v("name")),{},{required:!0,error:Z.name}))}),(0,h.jsxs)("div",{className:"".concat(d.box," all-columns"),children:[(0,h.jsx)("h3",{children:"Permissions"}),(0,h.jsx)(l.iA,{className:d.permissions,columns:[{label:"Table"},{label:"Read",className:"align-center"},{label:"Create",className:"align-center"},{label:"Update",className:"align-center"},{label:"Delete",className:"align-center"}],children:[].concat((0,s.Z)(m.EY),(0,s.Z)(n)).map((function(e,a){return(0,h.jsxs)("tr",{children:[(0,h.jsx)("td",{className:d.name,children:e.label}),e.actions.map((function(a,n){var t="".concat(e.value,"_").concat(a||n),r=(0,h.jsx)("td",{className:"align-center",children:(0,h.jsx)(l.XZ,{checked:(I||[]).includes(t),disabled:"dynamic_table_read"===t&&(I||[]).some((function(e){return e.startsWith(o._id)}))||t.endsWith("_read")&&(I||[]).some((function(e){return e!==t&&e.startsWith(t.replace("_read",""))})),onChange:function(e){(I||[]).includes(t)?j("permissions",I.filter((function(e){return e!==t}))):j("permissions",(0,s.Z)(new Set([].concat((0,s.Z)(I||[]),(0,s.Z)(t.startsWith(o._id)?["dynamic_table_read"]:[]),(0,s.Z)(/^(.*)(create|update|delete)$/.test(t)?[t.replace(/(create|update|delete)$/,"read")]:[]),[t]))))}})},t);return 0===n&&"read"===a||1===n&&"create"===a||2===n&&"update"===a||3===n&&"delete"===a?r:(0,h.jsx)("td",{},"".concat(e.value,"_").concat(n))}))]},e.value)}))})]}),(0,h.jsx)("div",{className:"btns",children:(0,h.jsx)("button",{className:"btn",disabled:C,children:a?"Update":"Submit"})})]})})},v=function(){var e=(0,r.useContext)(c.D).checkPermission,a=(0,r.useState)([]),n=(0,t.Z)(a,2),_=n[0],f=n[1],p=(0,r.useState)([]),b=(0,t.Z)(p,2),v=b[0],g=b[1],N=(0,r.useState)(null),j=(0,t.Z)(N,2),Z=j[0],y=j[1],k=(0,r.useState)(!1),S=(0,t.Z)(k,2),C=S[0],I=S[1],R=(0,u.i)(m.Hv.collections).get,F=(0,u.i)(m.Hv.roles),w=F.get,D=F.loading,A=(0,u.i)(m.Hv.roles+"/{ID}").remove;return(0,r.useEffect)((function(){R().then((function(e){var a=e.data;a.success&&f(a.data.map((function(e){return{label:e.name,value:"".concat(e.user,"_").concat(e.name),actions:["read","create","update","delete"]}})))})),w().then((function(e){var a=e.data;if(a.success)return g(a.data)})).catch((function(e){console.log(e),(0,i.N)({type:"error",message:e.message})}))}),[]),(0,h.jsxs)("div",{className:"".concat(d.content," grid gap-1 m-a p-1"),children:[(0,h.jsxs)("div",{className:"flex",children:[(0,h.jsx)("h2",{children:"All Roles"}),e("role_create")&&(0,h.jsx)("button",{className:"btn m-a mr-0",onClick:function(){return I(!0)},children:"Add Role"})]}),(0,h.jsx)(l.iA,{loading:D,className:d.roles,columns:[{label:"Name"},{label:"Action"}],children:v.map((function(a){return(0,h.jsxs)("tr",{onClick:function(){y(a),I(!0)},style:{cursor:"pointer"},children:[(0,h.jsx)("td",{className:d.date,children:a.name}),(0,h.jsx)(l.p2,{className:d.actions,actions:[].concat((0,s.Z)(e("role_update")?[{icon:(0,h.jsx)(o.KHI,{}),label:"View",callBack:function(){y(a),I(!0)}}]:[]),(0,s.Z)(e("role_delete")?[{icon:(0,h.jsx)(o.lp8,{}),label:"Delete",callBack:function(){return(0,i.N)({type:"confirmation",message:"Are you sure you want to remove this role?",callback:function(){A({},{params:{"{ID}":a._id}}).then((function(e){var n=e.data;n.success?g((function(e){return e.filter((function(e){return e._id!==a._id}))})):(0,i.N)({type:"error",message:n.message})}))}})}}]:[]))})]},a._id)}))}),(0,h.jsx)(i.u,{open:C,head:!0,label:"".concat(Z?"View / Update":"Add"," Role"),className:d.addRoleFormModal,setOpen:function(){y(null),I(!1)},children:(0,h.jsx)(x,{edit:Z,dynamicTables:_,onSuccess:function(e){Z?(g((function(a){return a.map((function(a){return a._id===e._id?e:a}))})),y(null)):g((function(a){return[].concat((0,s.Z)(a),[e])})),I(!1)}})})]})}}}]);
//# sourceMappingURL=370.fbd1077b.chunk.js.map