const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const mainScreen = document.getElementById('app');


const priceScreen = document.getElementById('price-screen');


const openPriceBtn = document.getElementById('open-price');
const backFromPriceBtn = document.getElementById('back-from-price');


openPriceBtn.onclick = () => {
  mainScreen.classList.add('hidden');
  priceScreen.classList.remove('hidden');
  tg.expand(); 
};


backFromPriceBtn.onclick = () => {
  priceScreen.classList.add('hidden');
  mainScreen.classList.remove('hidden');
};