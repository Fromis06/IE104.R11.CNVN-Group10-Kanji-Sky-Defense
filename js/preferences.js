(function () {
  'use strict';
  /* Dùng chung tùy chọn với game; phần ngôn ngữ mới có tiếng Việt. */
  const key='ksd-prototype-preferences';
  const defaults={theme:'dark',language:'vi',reduceMotion:false,showShortcuts:true,confirmBeforeDelete:true};
  let current={...defaults};
  
  function apply() {
    document.documentElement.dataset.theme=current.theme;
    document.documentElement.dataset.reduceMotion=String(current.reduceMotion);
    document.documentElement.dataset.showShortcuts=String(current.showShortcuts);
  }
  function t(source, vars={}) { return source.replace(/\{(\w+)\}/g,(all,k)=>vars[k]??all); }
  function update(changes) { current={...current,...changes,language:'vi'};  apply(); window.dispatchEvent(new CustomEvent('kanji-preferences-change')); return {...current}; }
  apply();
  window.KanjiPreferences={get:()=>({...current}),locale:()=> 'vi-VN',t,translate:()=>{},update};
})();
