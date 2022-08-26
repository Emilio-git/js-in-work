function tabs(tadbsSelector, tabsContentSelector, tabsParentSelector, activeClass) {
   // Tabs
   
   const tabs = document.querySelectorAll(tadbsSelector),
         tabsContent = document.querySelectorAll(tabsContentSelector),      
         tabsParent = document.querySelector(tabsParentSelector);
   
   function hideTabContent() {
      tabsContent.forEach(item => {
         item.classList.add('hide');
         item.classList.remove('show', 'fade');
      });
      tabs.forEach(item => {
         item.classList.remove(activeClass);
      });
   }

   // Параметр по умолчанию в функции showTabContent i = 0 - это параметр по умолчанию

   function showTabContent(i = 0) {
      tabsContent[i].classList.add('show', 'fade');
      tabsContent[i].classList.remove('hide');
      tabs[i].classList.add(activeClass);
   }

   hideTabContent();
   showTabContent();

   tabsParent.addEventListener('click', (event) => {
      const target = event.target;
      if (target && target.classList.contains(tadbsSelector.slice(1))) {
         tabs.forEach((item, i) => {
            if (target == item) {
               hideTabContent();
               showTabContent(i);
            }
         });
      }
   });
}

export default tabs;