"use strict";(self.webpackChunkcash_app=self.webpackChunkcash_app||[]).push([[132],{3132:function(e,n,t){t.r(n),t.d(n,{default:function(){return S}});var a=t(1413),r=t(885),i=t(6884),c=t(96),l=t(3750),o=t(1080),s=t(5454),u=t(2791),d={landingPage:"home_landingPage__PGhRk",allProducts:"home_allProducts__375Ny",store:"home_store__wGYk6",featured:"home_featured__G3PDC",products:"home_products__qc9X5",sidebar:"home_sidebar__tYk+c",filterBtn:"home_filterBtn__24Ikb",categories:"home_categories__j8-l5",subCategories:"home_subCategories__Moeme",section:"home_section__+YX1m",head:"home_head__O5-Gv",sectionContent:"home_sectionContent__IXOOI",filterList:"home_filterList__PpK91"},m=t(4373),p={productThumb:"productThumbnail_productThumb__V9Ct+",thumbnailWrapper:"productThumbnail_thumbnailWrapper__2BIgB",productDetail:"productThumbnail_productDetail__DlvWc",productSeller:"productThumbnail_productSeller__P7FdJ",productFavorite:"productThumbnail_productFavorite__1M38B",details:"productThumbnail_details__+icdg",price:"productThumbnail_price__PiKoh",currentPrice:"productThumbnail_currentPrice__GccL-",originalPrice:"productThumbnail_originalPrice__Ubn48",rating:"productThumbnail_rating__HyVh3",value:"productThumbnail_value__EqLla",stars:"productThumbnail_stars__M28CJ",chev:"productThumbnail_chev__7Jtwh",reviewCount:"productThumbnail_reviewCount__iSVO+",breakdown:"productThumbnail_breakdown__dFsqw",subtitle:"productThumbnail_subtitle__zT-wA",title:"productThumbnail_title__iymoy",graph:"productThumbnail_graph__vMGMg",bar:"productThumbnail_bar__eOvp-",fill:"productThumbnail_fill__jAQqS",percent:"productThumbnail_percent__SjcIM",whatsappBtn:"productThumbnail_whatsappBtn__c0cdK"},f=t(184);var h=function(e){var n=e.order,t=e.business,a=e.product,r=(null===a||void 0===a?void 0:a.url)||(t.domain?"http://"+t.domain:null);return(0,f.jsxs)("div",{className:"".concat(p.productThumb),children:[(0,f.jsx)("div",{className:p.thumbnailWrapper,children:(0,f.jsx)("a",{href:r,onClick:function(){if(!r)return(0,c.N)({type:"error",message:"The domain set up is in progress"})},children:(0,f.jsx)("img",{src:a.image})})}),(0,f.jsxs)("div",{className:p.productDetail,children:[(0,f.jsx)("a",{href:r,onClick:function(){if(!r)return(0,c.N)({type:"error",message:"The domain set up is in progress"})},children:(0,f.jsx)("h4",{children:a.title})}),null===n||void 0===n?void 0:n.map((function(e){return"whatsappNumber"===e?(0,f.jsx)("button",{style:{width:"min-content"},className:p.whatsappBtn,onClick:function(e){e.preventDefault();var n=document.createElement("a");n.href="whatsapp://send/?".concat(new URLSearchParams({phone:a.whatsappNumber,text:"I am interested to know more about this ".concat(a.title,"\n").concat(window.location.origin,"/item/").concat(a._id)}).toString()),n.rel="noreferrer",n.target="_blank",document.querySelector("body").append(n),n.click(),n.remove()},children:(0,f.jsx)(m.ff9,{})},e):["string","number"].includes(typeof a[e])?"price"===e?(0,f.jsxs)("span",{className:p.price,children:[(0,f.jsxs)("span",{className:p.currentPrice,children:[null===t||void 0===t||null===(n=t.siteConfig)||void 0===n?void 0:n.currency," ",a.price.toLocaleString()]}),a.originalPrice>a.price&&(0,f.jsxs)("span",{className:p.originalPrice,children:[null===t||void 0===t||null===(r=t.siteConfig)||void 0===r?void 0:r.currency," ",a.originalPrice.toLocaleString()]})]},e):(0,f.jsx)("span",{className:p.description,children:a[e]},e):Array.isArray(a[e])&&a[e].length?(0,f.jsxs)("span",{className:p.description,children:[(0,f.jsxs)("strong",{children:[(i=e,i.replace(/([a-z])([A-Z])/g,"$1 $2").replace(/([A-Z])([A-Z][a-z])/g,"$1 $2").replace(/\b(\w)(\w*)/g,(function(e,n,t){return n.toUpperCase()+t.toLowerCase()}))),":"]})," ",a[e].join(", ")]},e):"seller"===e&&a.seller?(0,f.jsxs)("div",{className:p.productSeller,children:[(0,f.jsx)("img",{src:a.seller.logo||a.seller.profileImg}),(0,f.jsx)("span",{className:p.productSeller,children:a.seller.name})]},e):null;var n,r,i}))]})]})},g=t(9126),b=t(3853),_=t(7692),x=t(2982),v=t(4942),j=t(8617),y=t(1134),Z=t(3504),N=t(6871),C=function(e){var n=e.field,t=e.setFilters,c=e.sidebarItem,l=e.control,m=(0,u.useState)([]),p=(0,r.Z)(m,2),h=p[0],g=p[1],b=(0,u.useState)([]),_=(0,r.Z)(b,2),j=_[0],y=_[1],Z=(0,s.i)(o.Hv.elements+"/".concat((null===n||void 0===n?void 0:n.collection)||"")).get;return(0,u.useEffect)((function(){"list"===c.filterStyle&&t((function(e){return(0,a.Z)((0,a.Z)({},e),{},(0,v.Z)({},n.name,null!==h&&void 0!==h&&h.length?h:""))}))}),[h]),(0,u.useEffect)((function(){"collection"===n.optionType&&Z().then((function(e){var t=e.data;if(null!==t&&void 0!==t&&t.success)return y(t.data.map((function(e){return{label:e[n.optionLabel],value:e[n.optionValue]}})))})).catch((function(e){return console.log(e)}))}),[]),"list"===c.filterStyle?(0,f.jsx)(T,{label:n.label,children:(0,f.jsx)("ul",{className:d.filterList,children:("array"===n.optionType?n.options:j).map((function(e,t){return(0,f.jsxs)("li",{children:[(0,f.jsx)("input",{id:"".concat(n.name,"_").concat(e.label),type:"checkbox",checked:h.includes(e.value),onChange:function(n){h.includes(e.value)?g((function(n){return n.filter((function(n){return n!==e.value}))})):g((function(n){return[].concat((0,x.Z)(n),[e.value])}))}})," ",(0,f.jsx)("label",{htmlFor:"".concat(n.name,"_").concat(e.label),children:e.label})]},t)}))})}):"dropdown"===c.filterStyle?(0,f.jsx)(T,{label:n.label,children:(0,f.jsx)(i.OC,(0,a.Z)((0,a.Z)((0,a.Z)({control:l},"array"===n.optionType&&{options:n.options}),"collection"===n.optionType&&{url:"".concat(o.Hv.elements,"/").concat(n.collection),getQuery:function(e,t){return(0,a.Z)((0,a.Z)({},e&&(0,v.Z)({},n.optionLabel,e)),t&&(0,v.Z)({},n.optionValue,t))},handleData:function(e){return{label:e[n.optionLabel],value:e[n.optionValue]}}}),{},{multiple:!0,name:n.name,formOptions:{required:n.required},className:d.itemName,onChange:function(e){t((function(t){return(0,a.Z)((0,a.Z)({},t),{},(0,v.Z)({},n.name,e.length?e.map((function(e){return e.value})):""))}))}}))}):null},T=function(e){var n=e.label,t=e.children,a=e.className;return(0,f.jsxs)("div",{className:"".concat(d.section," ").concat(a||""),children:[(0,f.jsx)("div",{className:d.head,children:n}),(0,f.jsx)("div",{className:d.sectionContent,onClick:function(e){return e.stopPropagation()},children:t})]})},w=function(e){var n=e.schema,t=e.fields,c=(e.filters,e.setFilters),l=(0,u.useRef)(!1),o=(0,u.useRef)({}),s=(0,Z.lr)(),m=(0,r.Z)(s,2),p=m[0],h=(m[1],(0,N.TH)().pathname),g=(0,N.s0)(),b=(0,y.cI)({defaultValues:{sort:"price-asc"}}),_=b.handleSubmit,x=b.control,w=b.reset,k=(b.watch,b.getValues),S=b.setValue;return(0,u.useEffect)((function(){if(t.length&&!l.current){var e={};t.forEach((function(n){p[n.fieldName]?e[n.fieldName]=p[n.fieldName]:(p[n.fieldName+"-min"]||p[n.fieldName+"-max"])&&("range"===n.filterType?e[n.fieldName+"-range"]={min:+p[n.fieldName+"-min"],max:+p[n.fieldName+"-max"]}:(e[n.fieldName+"-min"]=+p[n.fieldName+"-min"],e[n.fieldName+"-max"]=+p[n.fieldName+"-max"]))})),w(e),l.current=!0}}),[t,p]),(0,f.jsxs)("form",{className:"all-columns",onSubmit:_((function(e){})),children:[Object.keys(p).length>1&&(0,f.jsx)("div",{className:d.clearFilters,children:(0,f.jsxs)("button",{className:"btn",type:"button",onClick:function(){w(o.current),g({pathname:h,query:{sort:p.sort}},void 0,{shallow:!0,replace:!0})},children:[(0,f.jsx)(j.fMW,{}),"Clear All Filters"]})}),n&&(t||[]).map((function(e){var t,r=n.find((function(n){return n.name===e.fieldName}));return r?"textSearch"===e.filterType||"match"===e.filterType?(o.current=(0,a.Z)((0,a.Z)({},o.current),{},(0,v.Z)({},r.name,"")),(0,f.jsx)(T,{label:r.label,children:(0,f.jsx)(i.II,{control:x,name:r.name,type:r.inputType,onChange:function(e){c((function(n){return(0,a.Z)((0,a.Z)({},n),{},(0,v.Z)({},r.name,e.target.value||""))}))}})},e.fieldName)):"minMax"===e.filterType?(o.current=(0,a.Z)((0,a.Z)({},o.current),{},(t={},(0,v.Z)(t,"".concat(r.name,"-min"),""),(0,v.Z)(t,"".concat(r.name,"-max"),""),t)),(0,f.jsxs)(T,{label:r.label,children:[(0,f.jsx)(i.II,{control:x,name:"".concat(r.name,"-min"),type:r.inputType,placeholder:"MIN",onChange:function(e){var n=k("".concat(r.name,"-max"));+e.target.value<=+n?c((function(t){var i;return(0,a.Z)((0,a.Z)({},t),{},(i={},(0,v.Z)(i,"".concat(r.name,"-min"),+e.target.value),(0,v.Z)(i,"".concat(r.name,"-max"),+n),i))})):c((function(e){var n;return(0,a.Z)((0,a.Z)({},e),{},(n={},(0,v.Z)(n,"".concat(r.name,"-min"),""),(0,v.Z)(n,"".concat(r.name,"-max"),""),n))}))}}),(0,f.jsx)(i.II,{control:x,name:"".concat(r.name,"-max"),type:r.inputType,placeholder:"MAX",onChange:function(e){var n=k("".concat(r.name,"-min"));+e.target.value>=+n?c((function(t){var i;return(0,a.Z)((0,a.Z)({},t),{},(i={},(0,v.Z)(i,"".concat(r.name,"-max"),+e.target.value),(0,v.Z)(i,"".concat(r.name,"-min"),+n),i))})):c((function(e){var n;return(0,a.Z)((0,a.Z)({},e),{},(n={},(0,v.Z)(n,"".concat(r.name,"-max"),""),(0,v.Z)(n,"".concat(r.name,"-min"),""),n))}))}}),+k("".concat(r.name,"-max"))<+k("".concat(r.name,"-min"))&&(0,f.jsx)("p",{className:"subtitle1",children:"Max must be greater then Min"})]},e.fieldName)):"range"===e.filterType?(0,f.jsx)(T,{label:r.label,children:(0,f.jsx)(i.e6,{control:x,name:"".concat(r.name,"-range"),setValue:S,type:r.inputType,placeholder:"".concat(r.label," range"),onChange:function(e){var n=e.min,t=e.max;c(n<=t?function(e){var i;return(0,a.Z)((0,a.Z)({},e),{},(i={},(0,v.Z)(i,"".concat(r.name,"-min"),n),(0,v.Z)(i,"".concat(r.name,"-max"),t),i))}:function(e){var n;return(0,a.Z)((0,a.Z)({},e),{},(n={},(0,v.Z)(n,"".concat(r.name,"-min"),""),(0,v.Z)(n,"".concat(r.name,"-max"),""),n))})},min:+e.min,max:+e.max})},e.fieldName):["list","dropdown"].includes(e.filterStyle)?(o.current=(0,a.Z)((0,a.Z)({},o.current),{},(0,v.Z)({},r.name,[])),(0,f.jsx)(C,{field:r,sidebarItem:e,setFilters:c,control:x},e.fieldName)):void 0:null})),(0,f.jsx)("button",{hidden:!0,type:"submit",disabled:!0})]})},k=function(e){var n,t,l,m,p,h=e.filters,x=e.setFilters,v=e.config,j=(0,u.useRef)(window.innerWidth<=480),y=(0,u.useState)(!j.current),Z=(0,r.Z)(y,2),N=Z[0],C=Z[1],T=(0,u.useState)(null),k=(0,r.Z)(T,2),S=k[0],P=k[1],F=(0,u.useState)([]),I=(0,r.Z)(F,2),L=I[0],M=I[1],B=(0,s.i)(o.Hv.homeCategories).get;return(0,u.useEffect)((function(){B().then((function(e){var n=e.data;n.success?M(n.data):(0,c.N)({type:"error",message:n.message})})).catch((function(e){return(0,c.N)({type:"error",message:e.message})}))}),[]),N?(0,f.jsx)("div",{className:d.sidebar,children:S&&(null===v||void 0===v||null===(n=v.sidebarFilters)||void 0===n||null===(t=n.find((function(e){return e.category===h.category&&e.subCategory===h.subCategory})))||void 0===t||null===(l=t.filters)||void 0===l?void 0:l.length)>0?(0,f.jsxs)("div",{className:"flex align-center gap_5 ".concat(j.current?"justify-space-between":""," pointer wrap"),onClick:function(){P(null),x((function(e){return{category:e.category,subCategory:void 0}}))},children:[(0,f.jsx)(g.And,{style:{fontSize:"1.3em"}})," ",(0,f.jsx)("div",{className:"flex align-center gap_5",children:(0,f.jsxs)("p",{className:"flex align-center gap_5",children:[h.category," ",(0,f.jsx)(b.Tfp,{})," ",h.subCategory]})}),(0,f.jsx)("button",{className:"".concat(d.filterBtn," btn clear"),onClick:function(){return C(!1)},children:(0,f.jsx)(_.Ol$,{})}),(0,f.jsx)(w,{filters:h,setFilters:x,schema:S,fields:(null===v||void 0===v||null===(m=v.sidebarFilters)||void 0===m||null===(p=m.find((function(e){return e.category===h.category&&e.subCategory===h.subCategory})))||void 0===p?void 0:p.filters)||[]})]}):(0,f.jsxs)(f.Fragment,{children:[(0,f.jsxs)("div",{className:"flex align-center justify-space-between gap_5 pb-1",children:[(0,f.jsx)("p",{children:(0,f.jsx)("strong",{children:"Categories"})}),j.current&&(0,f.jsx)("button",{className:"".concat(d.filterBtn," btn clear"),onClick:function(){return C(!1)},children:(0,f.jsx)(_.Ol$,{})})]}),(0,f.jsx)("ul",{className:d.categories,children:L.map((function(e){var n;return(0,f.jsxs)("li",{children:[(0,f.jsx)(i.XZ,{label:e.name,checked:h.category===e.name,onChange:function(n){h.category===e.name?x((function(e){return(0,a.Z)((0,a.Z)({},e),{},{category:void 0})})):x((function(n){return(0,a.Z)((0,a.Z)({},n),{},{category:e.name})}))}}),(null===(n=e.subCategories)||void 0===n?void 0:n.length)>0&&(0,f.jsx)("ul",{className:d.subCategories,children:e.subCategories.map((function(n){return(0,f.jsx)("li",{children:(0,f.jsx)(i.XZ,{label:n.name,checked:h.subCategory===n.name,onChange:function(t){h.subCategory===n.name?x((function(e){return(0,a.Z)((0,a.Z)({},e),{},{subCategory:void 0})})):x((function(t){return(0,a.Z)((0,a.Z)({},t),{},{category:e.name,subCategory:n.name})})),P(t.target.checked?n.fields:null)}})},n.name)}))})]},e.name)}))})]})}):(0,f.jsx)("div",{className:"".concat(d.sidebar," flex justify-end"),children:(0,f.jsx)("button",{className:"".concat(d.filterBtn," btn clear"),onClick:function(){return C(!0)},children:(0,f.jsx)(_.Ol$,{})})})},S=function(){var e=(0,u.useState)({}),n=(0,r.Z)(e,2),t=n[0],a=n[1],i=(0,u.useState)(null),m=(0,r.Z)(i,2),p=m[0],g=m[1],b=(0,u.useState)([]),_=(0,r.Z)(b,2),x=_[0],v=_[1],j=(0,s.i)(o.Hv.homeStores),y=j.get,Z=(j.loading,(0,s.i)(o.Hv.homeConfig).get),N=(0,u.useCallback)((function(){y({query:t}).then((function(e){var n=e.data;n.success?v(n.data):(0,c.N)({type:"error",message:n.message})})).catch((function(e){return(0,c.N)({type:"error",message:e.message})}))}),[t]);return(0,u.useEffect)((function(){N()}),[t]),(0,u.useEffect)((function(){Z().then((function(e){var n=e.data;n.success?g(n.data):(0,c.N)({type:"error",message:n.message})})).catch((function(e){return(0,c.N)({type:"error",message:e.message})}))}),[]),(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(l.h,{home:!0,filters:t,setFilters:a}),(0,f.jsxs)("div",{className:d.landingPage,children:[(0,f.jsx)(k,{filters:t,config:p,setFilters:a}),(0,f.jsxs)("div",{className:d.allProducts,children:[0===x.length&&(0,f.jsx)("p",{className:"all-columns text-center p-2",children:"Nothing for now."}),x.map((function(e){return e.featured?(0,f.jsxs)("div",{className:"".concat(d.store," ").concat(e.featured?d.featured:""),children:[(0,f.jsx)("h2",{children:e.business.name}),(0,f.jsx)("div",{className:d.products,children:e.products.map((function(n){return(0,f.jsx)(h,{order:e.order,business:e.business,product:n},n._id)}))})]},e._id):(0,f.jsx)(h,{order:e.order,business:e.business,product:e.products[0]},e._id)}))]})]}),(0,f.jsx)(l.$,{})]})}}}]);
//# sourceMappingURL=132.6623022b.chunk.js.map