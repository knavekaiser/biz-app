"use strict";(self.webpackChunkcash_app=self.webpackChunkcash_app||[]).push([[594],{1594:function(e,a,n){n.r(a),n.d(a,{default:function(){return N}});var l=n(2982),t=n(885),i=n(2791),r=n(5454),o=n(96),s=n(1080),c=n(3806),u=n(6355),d={content:"payments_content__xnRyH",payments:"payments_payments__9WQ2d",addCollectionForm:"payments_addCollectionForm__ggeoF",purchaseDetail:"payments_purchaseDetail__J3hCj",box:"payments_box__jb+jG",noContent:"payments_noContent__Mmknb",items:"payments_items__dNmiS",name:"payments_name__meRUE",optionsWrapper:"payments_optionsWrapper__DgTfB",options:"payments_options__QwEzd",mainForm:"payments_mainForm__izXEA",detail:"payments_detail__qxtsv",label:"payments_label__qfMnn",viewOnly:"payments_viewOnly__2GAV3",collectionFormModal:"payments_collectionFormModal__UEwrO",dynamicForm:"payments_dynamicForm__MYe86",productVariants:"payments_productVariants__6Tj++",images:"payments_images__m5DmE",selected:"payments_selected__FUPWG",products:"payments_products__H61Kz",product:"payments_product__GSYVJ",thumbnail:"payments_thumbnail__wR+bc",productDetail:"payments_productDetail__l5jSa",price:"payments_price__uI-n-",subtotal:"payments_subtotal__K93Ud",variantForm:"payments_variantForm__Y1Ojh",variantImages:"payments_variantImages__zhz-o",fieldFormWrapper:"payments_fieldFormWrapper__UCXtz",dataDetail:"payments_dataDetail__3D+oD",inputDetail:"payments_inputDetail__OE5Pa",fieldForm:"payments_fieldForm__2tem9",fields:"payments_fields__FPiDJ",nestedObjectFormModal:"payments_nestedObjectFormModal__C0V7x",dynamicFormModal:"payments_dynamicFormModal__uNWii"},m=n(1413),p=n(1134),b=n(1570),f=n(184);b.kM(b.Z_,"noneOf",(function(e,a){return this.test("noneOf",a,(function(n){var l=this.path,t=this.createError;return!e.includes(n)||t({path:l,message:(null===a||void 0===a?void 0:a.replace("{value}",n))||a})}))}));var y=b.Ry({name:b.Z_().required()}),v=b.Ry({label:b.Z_().required(),value:b.Z_().required()}),x=["title","description","images","price","whatsappNumber","category","subcategory"],h=function(e){var a,n,o,s=e.edit,u=e.fields,y=e.editCollection,v=e.collections,h=e.onSuccess,g=e.clear,T=(0,p.cI)({resolver:(0,r.y)(b.Ry({name:b.Z_().noneOf(u.filter((function(e){return!s||s.name!==e.name})).map((function(e){return e.name})),"{value} already exists").required(),dataType:b.Z_().required(),label:b.Z_().required(),fieldType:b.Z_(),inputType:b.Z_(),required:b.O7()}))}),N=T.handleSubmit,F=T.register,Z=T.reset,S=T.watch,C=T.setValue,q=(T.clearErrors,T.control),O=T.formState.errors,D=S("name"),I=S("inputType"),w=S("dataType"),A=S("dataElementType"),E=S("fields"),k=S("collection"),P=S("fieldType"),R=S("optionType"),M=S("options"),L=S("label"),Q=S("multiple"),V=(0,i.useCallback)((function(e){if("Product"===(null===y||void 0===y?void 0:y.name)){var a={};Object.entries(e).forEach((function(e){var n=(0,t.Z)(e,2),l=n[0],i=n[1];("subcategory"===l&&!x.filter((function(e){return"subcategory"!==e})).includes(l)||"subcategory"!==l)&&(a[l]=i)})),h(a)}else h(e);Z({category:"",subcategory:"",name:"",inputType:"",dataType:"",dataElementType:"",dataElements:"",collection:"",fieldType:"",optionType:"",options:[],multiRange:"",label:"",required:"",decimalPlaces:"",unique:""})}),[s]);return(0,i.useEffect)((function(){Z((0,m.Z)({},s))}),[s]),(0,f.jsxs)("div",{className:d.fieldFormWrapper,children:[(0,f.jsxs)("div",{className:d.dataDetail,children:[(0,f.jsxs)("form",{onSubmit:N(V),className:"".concat(d.fieldForm," grid gap-1"),children:[(0,f.jsxs)("div",{className:"flex all-columns gap-1 justify-space-between align-center",children:[(0,f.jsx)("h3",{children:"Data"}),(0,f.jsx)(c.XZ,(0,m.Z)((0,m.Z)({},F("unique")),{},{label:"Unique"}))]}),(0,f.jsx)(c.II,(0,m.Z)((0,m.Z)({label:"Field Name",type:"text",required:!0,disabled:s},F("name")),{},{error:O.name})),(0,f.jsx)(c.hQ,{label:"Data Type",name:"dataType",control:q,formOptions:{required:!0},options:[{label:"String",value:"string"},{label:"Number",value:"number"},{label:"Date",value:"date"},{label:"Boolean",value:"boolean"},{label:"Array",value:"array"},{label:"Variant Array",value:"variantArray"},{label:"Object",value:"object"},{label:"Object ID",value:"objectId"}],disabled:s||Q||"richText"===P}),"objectId"===w&&(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(c.OC,{control:q,label:"Collection",options:v.filter((function(e){return e._id!==(null===y||void 0===y?void 0:y._id)})).map((function(e){return{label:e.name,value:e.name}})),name:"collection",formOptions:{required:!0},className:d.itemName}),k&&(0,f.jsx)(c.hQ,{label:"Foreign Field",name:"foreignField",control:q,formOptions:{required:!0},options:[{label:"ID",value:"_id"}].concat((0,l.Z)((null===(a=v.find((function(e){return e.name===k})))||void 0===a?void 0:a.fields.map((function(e){return{label:e.label,value:e.name}})))||[]))})]}),["array","variantArray"].includes(w)&&(0,f.jsx)(c.hQ,{label:"Data Element Type",name:"dataElementType",control:q,formOptions:{required:!0},options:[{label:"String",value:"string"},{label:"Number",value:"number"},{label:"Date",value:"date"},{label:"Object",value:"object"}]})]}),["array","variantArray"].includes(w)&&"object"===A&&(0,f.jsx)(j,{name:L||D,value:E,setValue:function(e){return C("fields",e)},collection:y,collections:v})]}),(0,f.jsxs)("div",{className:d.inputDetail,children:[(0,f.jsxs)("form",{onSubmit:N(V),className:"".concat(d.fieldForm," grid gap-1"),children:[(0,f.jsxs)("div",{className:"flex all-columns justify-space-between align-center",children:[(0,f.jsx)("h3",{className:"all-columns",children:"Input Field"}),(0,f.jsx)(c.XZ,(0,m.Z)((0,m.Z)({},F("required")),{},{label:"Required"}))]}),(0,f.jsx)(c.II,(0,m.Z)((0,m.Z)({label:"Label",type:"text",required:!0},F("label")),{},{error:O.label})),!(["array","variantArray"].includes(w)&&"object"===A)&&(0,f.jsx)(c.hQ,{label:"Field Type",name:"fieldType",control:q,formOptions:{required:!0},options:[{label:"Input",value:"input"},{label:"Textarea",value:"textarea"},{label:"Rich Text",value:"richText"},{label:"Combobox",value:"combobox"},{label:"Autocomplete",value:"select"},{label:"Date Range",value:"dateRange"},{label:"Collection Filter",value:"collectionFilter"},{label:"None",value:"none"}],onChange:function(e){"richText"===(null===e||void 0===e?void 0:e.value)&&C("dataType","object")}}),!(["combobox","textarea","richText","collectionFilter","none"].includes(P)||["array","variantArray"].includes(w)&&"object"===A||["includeProducts","excludeProducts"].includes(D)&&"object"===w)&&(0,f.jsx)(c.hQ,{label:"Input Type",name:"inputType",control:q,options:"dateRange"===P?[{label:"Calendar",value:"calendar"}]:[{label:"Text",value:"text"},{label:"Number",value:"number"}].concat((0,l.Z)("select"!==P?[{label:"Phone Number",value:"phone"},{label:"Date",value:"date"},{label:"File",value:"file"},{label:"Calendar",value:"calendar"},{label:"Password",value:"password"}]:[]))}),"number"===I&&(0,f.jsx)(c.hQ,{label:"Decimal Places",name:"decimalPlaces",control:q,options:[{label:"1",value:"0"},{label:"1.0",value:"0.0"},{label:"1.00",value:"0.00"},{label:"1.000",value:"0.000"},{label:"1.0000",value:"0.0000"},{label:"1.00000",value:"0.00000"}]}),["combobox","select"].includes(P)&&(0,f.jsx)(c.hQ,{label:"Options type",name:"optionType",control:q,formOptions:{required:!0},options:[{label:"Predefined",value:"array"},{label:"Other Collection",value:"collection",disabled:"combobox"===P}]}),["collection"].includes(R)&&(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(c.OC,{control:q,label:"Collection",options:v.filter((function(e){return e._id!==(null===y||void 0===y?void 0:y._id)})).map((function(e){return{label:e.name,value:e.name}})),name:"collection",formOptions:{required:!0},className:d.itemName}),k&&(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(c.hQ,{label:"Option Label",name:"optionLabel",control:q,formOptions:{required:!0},options:[{label:"ID",value:"_id"}].concat((0,l.Z)((null===(n=v.find((function(e){return e.name===k})))||void 0===n?void 0:n.fields.map((function(e){return{label:e.label,value:e.name}})))||[]))}),(0,f.jsx)(c.hQ,{label:"Option Value",name:"optionValue",control:q,formOptions:{required:!0},options:[{label:"ID",value:"_id"}].concat((0,l.Z)((null===(o=v.find((function(e){return e.name===k})))||void 0===o?void 0:o.fields.map((function(e){return{label:e.label,value:e.name}})))||[]))})]})]})]}),["combobox","select"].includes(P)&&"array"===R&&(0,f.jsxs)(f.Fragment,{children:[(0,f.jsxs)("h3",{children:[L," Options"]}),(0,f.jsx)(_,{dataType:w,options:M,setOptions:function(e){return C("options",e)}})]}),(0,f.jsxs)("form",{onSubmit:N(V),className:"".concat(d.fieldForm," grid gap-1"),children:[(["file"].includes(I)||["select","combobox"].includes(P))&&(0,f.jsx)(c.XZ,(0,m.Z)((0,m.Z)({},F("multiple")),{},{label:"Multiple",onChange:function(e){e.target.checked&&(C("dataType","array"),C("dataElementType","string"))}})),"calendar"===I&&(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(c.hQ,{label:"Date Window",name:"dateWindow",control:q,options:[{label:"All time",value:"allTime"},{label:"Past including Today",value:"pastIncludingToday"},{label:"Past excluding Today",value:"pastExcludingToday"},{label:"Future including Today",value:"futureIncludingToday"},{label:"Future excluding Today",value:"futureExcludingToday"}]}),(0,f.jsx)(c.hQ,{label:"Multiple Range",name:"multipleRanges",control:q,options:[{label:"Yes",value:!0},{label:"No",value:!1}]})]})]}),(0,f.jsxs)("form",{onSubmit:N(V),className:"flex gap-1 justify-center",children:[s&&(0,f.jsx)("button",{className:"btn",type:"button",onClick:g,children:"Clear"}),(0,f.jsxs)("button",{className:"btn",children:[s?"Update":"Add"," Field"]})]})]})]})},j=function(e){var a=e.name,n=e.value,r=void 0===n?[]:n,s=e.setValue,m=e.collection,p=e.collections,b=(0,i.useState)(null),y=(0,t.Z)(b,2),v=y[0],x=y[1],j=(0,i.useState)(null),_=(0,t.Z)(j,2),g=_[0],T=_[1];return(0,f.jsxs)(f.Fragment,{children:[(0,f.jsxs)("div",{className:"flex justify-space-between align-center",children:[(0,f.jsxs)("h3",{children:[a," Fields"]}),(0,f.jsxs)("button",{className:"btn",onClick:function(){return T(!0)},children:["Add ",a," Field"]})]}),(0,f.jsx)(c.iA,{className:d.fields,columns:[{label:"Name"},{label:"Data Type"},{label:"Label"},{label:"Field Type"},{label:"Input Type"},{label:"Required"},{label:"Action",action:!0}],placeholder:"No fields yet.",children:r.map((function(e,a){return(0,f.jsxs)("tr",{children:[(0,f.jsx)("td",{children:(0,f.jsx)("span",{className:"ellipsis",children:e.name})}),(0,f.jsx)("td",{children:e.dataType}),(0,f.jsx)("td",{children:e.label}),(0,f.jsx)("td",{children:e.fieldType}),(0,f.jsx)("td",{children:e.inputType}),(0,f.jsx)("td",{children:e.required?"Yes":"No"}),(0,f.jsx)(c.p2,{actions:[{icon:(0,f.jsx)(u.KHI,{}),label:"Edit",callBack:function(){x(e),T(!0)}},{icon:(0,f.jsx)(u.lp8,{}),label:"Delete",callBack:function(){return(0,o.N)({type:"confirmation",message:"Are you sure you want to remove this Field?",callback:function(){s(r.filter((function(a){return a.name!==e.name})))}})}}]})]},a)}))}),(0,f.jsx)(o.u,{head:!0,label:"".concat(v?"Update":"Add"," ").concat(a," Field"),open:g,setOpen:function(){T(!1),x(null)},className:d.nestedObjectFormModal,children:(0,f.jsx)(h,{edit:v,fields:r,editCollection:m,collections:p,onSuccess:function(e){v?(s(r.map((function(a){return a.name.toLowerCase()===e.name.toLowerCase()?e:a}))),x(null)):s([].concat((0,l.Z)(r),[e])),T(!1)},clear:function(){return x(null)}},v?"edit":"add")})]})},_=function(e){var a=e.dataType,n=e.options,r=e.setOptions,s=(0,i.useState)(null),m=(0,t.Z)(s,2),p=m[0],b=m[1];return(0,f.jsx)("section",{className:d.optionsWrapper,children:(0,f.jsxs)(c.iA,{className:"".concat(d.options),columns:[{label:"Label"},{label:"Value"},{label:"Action"}],children:[(0,f.jsx)("tr",{className:"inlineForm",children:(0,f.jsx)("td",{children:(0,f.jsx)(g,{dataType:a,edit:p,onSuccess:function(e){r(p?(n||[]).map((function(a){return a._id===e._id?e:a})):[e].concat((0,l.Z)(n||[]))),b(null)},clearForm:function(){return b(null)}})})}),null===n||void 0===n?void 0:n.map((function(e,a){var l;return(0,f.jsxs)("tr",{children:[(0,f.jsx)("td",{children:e.label}),(0,f.jsx)("td",{children:null===(l=e.value)||void 0===l?void 0:l.toString()}),(0,f.jsx)(c.p2,{actions:[{icon:(0,f.jsx)(u.KHI,{}),label:"Edit",callBack:function(){b(e)}},{icon:(0,f.jsx)(u.lp8,{}),label:"Delete",callBack:function(){return(0,o.N)({type:"confirmation",message:"Are you sure you want to remove this Option?",callback:function(){r((n||[]).filter((function(a){return a._id!==e._id})))}})}}]})]},a)}))]})})},g=function(e){var a=e.dataType,n=e.edit,l=e.onSuccess,t=e.clearForm,o=(0,p.cI)({resolver:(0,r.y)(v)}),s=o.handleSubmit,d=o.register,b=o.formState.errors,y=o.reset;return(0,i.useEffect)((function(){y({label:(null===n||void 0===n?void 0:n.label)||"",value:(null===n||void 0===n?void 0:n.value)||""})}),[n]),(0,f.jsxs)("form",{onSubmit:s((function(e){"boolean"===a?e.value=["1",1,"true"].includes(e.value.toLowerCase()):"number"===a&&(e.value=+e.value),l((0,m.Z)((0,m.Z)({},e),{},{_id:(null===n||void 0===n?void 0:n._id)||Math.random().toString(36).substr(-8)})),y()})),children:[(0,f.jsx)(c.II,(0,m.Z)((0,m.Z)({},d("label")),{},{placeholder:"Label",error:b.label})),(0,f.jsx)(c.II,(0,m.Z)((0,m.Z)({},d("value")),{},{placeholder:"Value",error:b.value})),(0,f.jsxs)("section",{className:"btns",children:[(0,f.jsx)("button",{className:"btn clear border iconOnly",type:"submit",children:n?(0,f.jsx)(u.l_A,{}):(0,f.jsx)(u.wEH,{})}),n&&(0,f.jsx)("button",{className:"btn clear border iconOnly",type:"button",onClick:function(){t()},children:(0,f.jsx)(u.aHS,{})})]})]})},T=function(e){var a=e.edit,n=e.collections,b=e.onSuccess,v=(0,i.useState)((null===a||void 0===a?void 0:a.fields)||[{name:"title",required:!0,label:"Title",dataType:"string",fieldType:"input",inputType:"text"},{name:"description",inputType:"text",dataType:"string",fieldType:"textarea",label:"Description",required:!0},{name:"images",required:!0,label:"Images",dataType:"array",fieldType:"input",inputType:"file",dataElementType:"string",multiple:!0},{name:"price",inputType:"number",dataType:"number",fieldType:"input",label:"Price",required:!0,decimalPlaces:"0.00"},{name:"whatsappNumber",required:!0,label:"WhatsApp",dataType:"string",fieldType:"input",inputType:"phone"}]),x=(0,t.Z)(v,2),j=x[0],_=x[1],g=(0,i.useState)(null),T=(0,t.Z)(g,2),N=T[0],F=T[1],Z=(0,i.useState)(null),S=(0,t.Z)(Z,2),C=S[0],q=S[1],O=(0,p.cI)({resolver:(0,r.y)(y)}),D=O.handleSubmit,I=O.register,w=O.reset,A=O.control,E=O.watch,k=O.setValue,P=O.clearErrors,R=O.formState.errors,M=O.setError,L=(0,r.i)(s.Hv.adSchemas+"/".concat((null===a||void 0===a?void 0:a._id)||"")),Q=L.post,V=L.put,H=(L.loading,E("name")),W=E("category"),B=(0,i.useCallback)((function(e){if(!e.name&&H&&(e.name=H),!e.category&&W&&(e.category=W),e.name){if(e.category)return j.length<1?q("Add at least one field"):j.find((function(e){return"images"===e.name}))?j.find((function(e){return"title"===e.name}))?j.find((function(e){return"price"===e.name}))?j.find((function(e){return"whatsappNumber"===e.name}))?void(a?V:Q)({name:e.name,category:e.category,fields:j.map((function(e){return(0,m.Z)((0,m.Z)({},e),{},{_id:void 0})}))}).then((function(e){var a=e.data;if(!a.success)return(0,o.N)({type:"error",message:a.message});b(a.data)})).catch((function(e){return(0,o.N)({type:"error",message:e.message})})):q('"whatsappNumber" is a required field'):q('"price" is a required field'):q('"title" is a required field'):q('"images" is a required field');M("category",{type:"required",message:"Category is required"})}else M("name",{type:"required",message:"Subcategory name is required"})}),[j,H,W]);return(0,i.useEffect)((function(){j.length>0&&JSON.stringify(j)!==JSON.stringify((null===a||void 0===a?void 0:a.fields)||[])&&B({name:(null===a||void 0===a?void 0:a.name)||""})}),[j,a]),(0,i.useEffect)((function(){w((0,m.Z)({},a))}),[a]),(0,f.jsxs)("div",{className:"grid gap-1 p-1 ".concat(d.addCollectionForm),children:[(0,f.jsxs)("form",{onSubmit:D(B),className:"".concat(d.mainForm," grid gap-1"),children:[(0,f.jsx)(c.OC,{disabled:null===a||void 0===a?void 0:a._id,label:"Category",control:A,url:s.Hv.adminDynamic+"/Category",getQuery:function(e,a){return(0,m.Z)({},e&&{name:[e].concat((0,l.Z)(a||[]))})},handleData:function(e){return{label:e.name,value:e.name}},name:"category",onChange:function(e){k("category",e.value),P("category")},formOptions:{required:!0}}),(0,f.jsx)(c.II,(0,m.Z)((0,m.Z)({label:"Subcategory name",type:"text"},I("name")),{},{required:!0,readOnly:a,error:R.name}))]}),(0,f.jsx)("h3",{children:"Fields"}),(0,f.jsx)(c.iA,{className:d.fields,columns:[{label:"Name"}].concat((0,l.Z)("Product"===(null===a||void 0===a?void 0:a.name)?[{label:"Subcategory"}]:[]),[{label:"Data Type"},{label:"Label"},{label:"Field Type"},{label:"Input Type"},{label:"Required"},{label:"Action",action:!0}]),placeholder:"No fields yet.",children:j.map((function(e,n){return(0,f.jsxs)("tr",{children:[(0,f.jsx)("td",{children:(0,f.jsx)("span",{className:"ellipsis",children:e.name})}),"Product"===(null===a||void 0===a?void 0:a.name)&&(0,f.jsx)("td",{children:e.subcategory}),(0,f.jsx)("td",{children:e.dataType}),(0,f.jsx)("td",{children:e.label}),(0,f.jsx)("td",{children:e.fieldType}),(0,f.jsx)("td",{children:e.inputType}),(0,f.jsx)("td",{children:e.required?"Yes":"No"}),(0,f.jsx)(c.p2,{actions:[{icon:(0,f.jsx)(u.KHI,{}),label:"Edit",callBack:function(){return F(e)}},{icon:(0,f.jsx)(u.lp8,{}),label:"Delete",callBack:function(){return(0,o.N)({type:"confirmation",message:"Are you sure you want to remove this Field?",callback:function(){_((function(a){return a.filter((function(a){return a.name!==e.name}))}))}})}}]})]},n)}))}),C&&(0,f.jsx)("p",{className:"error",children:C}),(0,f.jsx)(h,{edit:N,editCollection:a,fields:j,collections:n,onSuccess:function(e){q(null),N?(_((function(a){return a.map((function(a){return a.name.toLowerCase()===e.name.toLowerCase()?e:a}))})),F(null)):_((function(a){return[].concat((0,l.Z)(a),[e])}))},clear:function(){return F(null)}},N?"edit":"add"),(0,f.jsx)("form",{onSubmit:D(B),className:"".concat(d.mainForm," grid gap-1")})]})},N=(n(4581),function(){var e=(0,i.useState)(null),a=(0,t.Z)(e,2),n=a[0],m=a[1],p=(0,i.useState)([]),b=(0,t.Z)(p,2),y=b[0],v=b[1],x=(0,i.useState)([]),h=(0,t.Z)(x,2),j=h[0],_=h[1],g=(0,r.i)(s.Hv.adminCollections).get,N=(0,r.i)(s.Hv.adSchemas),F=N.get,Z=N.loading,S=(0,r.i)(s.Hv.adSchemas+"/{ID}"),C=S.remove,q=S.loading,O=(0,i.useCallback)((function(){F().then((function(e){var a=e.data;if(a.success)return _(a.data)})).catch((function(e){return(0,o.N)({type:"error",message:e.message})}))}),[]);return(0,i.useEffect)((function(){O(),g().then((function(e){var a=e.data;if(a.success)return v(a.data)})).catch((function(e){return(0,o.N)({type:"error",message:e.message})}))}),[]),(0,f.jsxs)("div",{className:"".concat(d.content," grid gap-1 m-a p-1"),children:[(0,f.jsxs)("div",{className:"flex justify-space-between",children:[(0,f.jsx)("h2",{children:"All Sub Categories"}),(0,f.jsx)("div",{className:"flex gap-1",children:(0,f.jsx)("button",{className:"btn m-a mr-0",onClick:function(){return m(!0)},children:"Add Sub Categories"})})]}),(0,f.jsx)(c.iA,{loading:Z,className:d.collections,columns:[{label:"Name"},{label:"Action"}],children:j.map((function(e,a){return(0,f.jsxs)("tr",{children:[(0,f.jsx)("td",{children:e.name}),(0,f.jsx)(c.p2,{actions:[{icon:(0,f.jsx)(u.KHI,{}),label:"Edit",callBack:function(){m(e)}},{icon:(0,f.jsx)(u.lp8,{}),label:"Delete",disabled:q,callBack:function(){return(0,o.N)({type:"confirmation",message:"Are you sure you want to remove this Subcategory?",callback:function(){C({},{params:{"{ID}":e._id}}).then((function(a){var n=a.data;null!==n&&void 0!==n&&n.success&&_((function(a){return a.filter((function(a){return a._id!==e._id}))}))})).catch((function(e){return(0,o.N)({type:"error",message:e.message})}))}})}}]})]},a)}))}),(0,f.jsx)(o.u,{head:!0,label:"".concat(null!==n&&void 0!==n&&n._id?"Update":"Add"," Subcategory"),open:!!n,setOpen:function(){m(null)},className:d.collectionFormModal,children:(0,f.jsx)(T,{collections:y.filter((function(e){return"Category"!==e.name})),edit:null!==n&&void 0!==n&&n._id?n:null,onSuccess:function(e){null!==n&&void 0!==n&&n._id?(_((function(a){return a.map((function(a){return a._id.toLowerCase()===n._id.toLowerCase()?e:a}))})),m(e)):(m(e),_((function(a){return[].concat((0,l.Z)(a),[e])})))}})})]})})}}]);
//# sourceMappingURL=594.9779ab43.chunk.js.map