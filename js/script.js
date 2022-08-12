"use strict";

document.addEventListener('DOMContentLoaded', () => {
   
   // Tabs
   
   const tabs = document.querySelectorAll('.tabheader__item'),
         tabsContent = document.querySelectorAll('.tabcontent'),      
         tabsParent = document.querySelector('.tabheader__items');
   
   function hideTabContent() {
      tabsContent.forEach(item => {
         item.classList.add('hide');
         item.classList.remove('show', 'fade');
      });
      tabs.forEach(item => {
         item.classList.remove('tabheader__item_active');
      });
   }
// Параметр по умолчанию в функции showTabContent i = 0 - это параметр по умолчанию

   function showTabContent(i = 0) {
      tabsContent[i].classList.add('show', 'fade');
      tabsContent[i].classList.remove('hide');
      tabs[i].classList.add('tabheader__item_active');
   }

   hideTabContent();
   showTabContent();

   tabsParent.addEventListener('click', (event) => {
      const target = event.target;
      if (target && target.classList.contains('tabheader__item')) {
         tabs.forEach((item, i) => {
            if (target == item) {
               hideTabContent();
               showTabContent(i);
            }
         });
      }
   });

   // Timer

   const deadline = '2022-09-1';

   function getTimeRemaining(endtime) {
      let days, hours, minutes, seconds;
      const t = Date.parse(endtime) - Date.parse(new Date());

      if (t <= 0) {
         days = 0;
         hours = 0;
         minutes = 0;
         seconds = 0;
      } else {
         days = Math.floor(t / (1000 * 60 * 60 * 24));
         hours = Math.floor((t / (1000 * 60 * 60)) % 24);
         minutes = Math.floor((t / 1000 / 60) % 60);
         seconds = Math.floor((t / 1000) % 60);
      }   
      
      return {
         'total': t,
         'days': days,
         'hours': hours,
         'minutes': minutes,
         'seconds': seconds
      };
   }

   function getZero(num) {
      if(num >= 0 && num < 10) {
         return `0${num}`;
      } else {
         return num;
      }
   }

   function setClock(selector, endtime) {
      const timer = document.querySelector(selector),
            days = timer.querySelector('#days'),
            hours = timer.querySelector('#hours'),
            minutes = timer.querySelector('#minutes'),
            seconds = timer.querySelector('#seconds'),
            timeInterval = setInterval(updateClock, 1000);

      updateClock();

      function updateClock() {
         const t = getTimeRemaining(endtime);

         days.innerHTML = getZero(t.days);
         hours.innerHTML = getZero(t.hours);
         minutes.innerHTML = getZero(t.minutes);
         seconds.innerHTML = getZero(t.seconds);

         if (t.total <= 0) {
            clearInterval(timeInterval);
         }
      }
   }

   setClock('.timer', deadline);

   // Modal

   const modalTrigger = document.querySelectorAll('[data-modal]'),
         modal = document.querySelector('.modal');

   function openModal() {
      modal.classList.toggle('show');
      document.body.style.overflow = 'hidden';
      clearInterval(modalTimerId);
   }
   
   modalTrigger.forEach(item => {
      item.addEventListener('click', openModal);
   });

   function closeModal() {
      modal.classList.toggle('show');
      document.body.style.overflow = '';
   }

   modal.addEventListener('click', (e) => {
      const target = e.target;

      if (target === modal || e.target.getAttribute('data-close') == '') {
         closeModal();
      }
   });

   document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && modal.classList.contains('show')) {
         closeModal();
      }
   });

   // const modalTimerId = setTimeout(openModal, 50000);

   function showModalByScroll() {
      if (window.pageYOffset + document.documentElement.clientHeight >= document.documentElement.scrollHeight - 1) {
         openModal();
         window.removeEventListener('scroll', showModalByScroll);
      }
   }

   window.addEventListener('scroll', showModalByScroll);

   // Формирование карточек динамически из сервера

   // const getResource = async (url) => {
   //    const res = await fetch(url);

   //    if(!res.ok) {
   //       throw new Error(`Could not fetch ${url}, status ${res.status}`);
   //    }

   //    return await res.json();
   // };

   // getResource('http://localhost:3000/menu')
   //    .then(data => createCard(data));

   axios.get('http://localhost:3000/menu')
      .then(data => createCard(data.data));

   function createCard(data) {
      data.forEach(({img, altimg, title, descr, price}) => {
         const element = document.createElement('div');

         element.classList.add('menu__item');

         element.innerHTML = `
            <img src=${img} alt=${altimg}>
            <h3 class="menu__item-subtitle">${title}</h3>
            <div class="menu__item-descr">${descr}<div>
            <div class="menu__item-divider"></div>
            <div class="menu__item-price">
               <div class="menu__item-cost">Цена:</div>
               <div class="menu__item-total"><span>${price}</span> грн/день</div>
            </div>
         `;

         document.querySelector('.menu .container').append(element);
      });
   }

   // Forms

   const forms = document.querySelectorAll('form');

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

   const postData = async (url, data) => {
      const res = await fetch(url, {
         method: 'POST',
         headers: {
            'Content-type': 'application/json'
         },
         body: data
      });

      return await res.json();
   };

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
      openModal();

      const thanksModal = document.createElement('div');
      thanksModal.classList.add('modal__dialog');
      thanksModal.innerHTML = `
         <div class="modal__content">
            <div data-close class="modal__close">&times;</div>
            <div class="modal__title">${message}</div>
         </div>
         `;
      
      document.querySelector('.modal').append(thanksModal);
      openModal();

      setTimeout(() => {
         thanksModal.remove();
         prevModalDialog.classList.add('show');
         prevModalDialog.classList.remove('hide');
         closeModal();
      }, 4000);
   }

   // Слайдер-карусель

   const prev = document.querySelector('.offer__slider-prev'),
         next = document.querySelector('.offer__slider-next'), 
         slides = document.querySelectorAll('.offer__slide'), 
         total = document.querySelector('#total'),
         current = document.querySelector('#current'),
         slidesWrapper = document.querySelector('.offer__slider-wrapper'),
         slidesField = document.querySelector('.offer__slider-inner'),
         width = window.getComputedStyle(slidesWrapper).width;
   
   let slideIndex = 1,
       offset = 0;

   if (slides.length < 10) {
      total.textContent = `0${slides.length}`;
      current.textContent = `0${slideIndex}`;
   } else {
      total.textContent = slides.length;
      current.textContent = slideIndex;
   }

   slidesField.style.width = 100 * slides.length + '%';
   slidesField.style.display = 'flex';
   slidesField.style.transition = '0.5s all';
   slidesWrapper.style.overflow = 'hidden';

   slides.forEach(slide => {
      slide.style.width = width;
   });
      
   next.addEventListener('click', () => {
      if (offset == +width.slice(0, width.length - 2) * (slides.length - 1)) {
         offset = 0;
      } else {
         offset += +width.slice(0, width.length - 2);
      }

      slidesField.style.transform = `translateX(-${offset}px)`;

      if (slideIndex == slides.length) {
         slideIndex = 1;
      } else {
         slideIndex++;
      }

      if (slides.length < 10) {
         current.textContent = `0${slideIndex}`;
      } else {
         current.textContent = slideIndex;
      }
   });

   prev.addEventListener('click', () => {
      if (offset == 0) {
         offset = +width.slice(0, width.length - 2) * (slides.length - 1);
      } else {
         offset -= +width.slice(0, width.length - 2);
      }

      slidesField.style.transform = `translateX(-${offset}px)`;

      if (slideIndex == 1) {
         slideIndex = slides.length;
      } else {
         slideIndex--;
      }

      if (slides.length < 10) {
         current.textContent = `0${slideIndex}`;
      } else {
         current.textContent = slideIndex;
      }
   });
   // showSlide();

   // if (slides.length < 10) {
   //    total.textContent = `0${slides.length}`;
   // } else {
   //    total.textContent = slides.length;
   // }

   // function showSlide(n) {
   //    if (n > slides.length) {
   //       slideIndex = 1;
   //    } 
      
   //    if (n < 1) {
   //       slideIndex = slides.length;
   //    }

   //    slides.forEach(item => {
   //       item.style.display = 'none';
   //    });

   //    slides[slideIndex - 1].style.display = 'block';

   //    if (slides.length < 10) {
   //       current.textContent = `0${slideIndex}`;
   //    } else {
   //       current.textContent = slideIndex;
   //    }
   // }

   // function plusSlides(n) {
   //    showSlide(slideIndex += n);
   // }

   // prev.addEventListener('click', () => {
   //    plusSlides(-1);
   // });

   // next.addEventListener('click', () => {
   //    plusSlides(1);
   // });

});