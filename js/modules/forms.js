import {closeModal, openModal} from './modal';
import {postData} from '../services/services';

function forms (formSelector, modalTimerId){
   // Forms

   const forms = document.querySelectorAll(formSelector);

   const message = {
      loading: 'img/form/spinner.svg',
      success: 'Спасибо! Скоро мы с вами свяжемся',
      failure: 'Что-то пошло не так'
   };

   forms.forEach(item => {
      bindPostData(item);
   });

// Мы знаем что ниже асинхронный код, так как идет обращение к серверу, 
// здесь необходимо применение в связке операторов async/await

   function bindPostData(form) {
      form.addEventListener('submit', (e) => {
         e.preventDefault();

         const statusMessage = document.createElement('img');
         statusMessage.src = message.loading;
         statusMessage.style.cssText = `
            display: block;
            margin: 0 auto;
         `;
         
         form.append(statusMessage);
         
         const formData = new FormData(form);
         
         const json = JSON.stringify(Object.fromEntries(formData.entries()));

         // Использование fetch API

         postData('http://localhost:3000/requests', json)
         .then((data) => {
            console.log(data);
            showThanksModal(message.success);
            statusMessage.remove();
         }).catch(() => {
            showThanksModal(message.failure);
         }).finally(() => {
            form.reset();
         });
      });
   }
   
// Добавление красивого оповещения

   function showThanksModal(message) {
      const prevModalDialog = document.querySelector('.modal__dialog');
      
      prevModalDialog.classList.add('hide');
      openModal('.modal', modalTimerId);

      const thanksModal = document.createElement('div');
      thanksModal.classList.add('modal__dialog');
      thanksModal.innerHTML = `
         <div class="modal__content">
            <div data-close class="modal__close">&times;</div>
            <div class="modal__title">${message}</div>
         </div>
         `;
      
      document.querySelector('.modal').append(thanksModal);
      openModal('.modal', modalTimerId);

      setTimeout(() => {
         thanksModal.remove();
         prevModalDialog.classList.add('show');
         prevModalDialog.classList.remove('hide');
         closeModal('.modal');
      }, 4000);
   }
}

export default forms;