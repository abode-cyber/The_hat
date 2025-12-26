import { MenuItem } from './store';

export const MENU_ITEMS: MenuItem[] = [
  // هات ستيك
  { id: '1', name: 'ستيك لحم', price: 13, category: 'hat_steak', image: '/images/steak-meat.jpg' },
  { id: '2', name: 'ستيك دجاج', price: 13, category: 'hat_steak', image: '/images/steak-chicken.jpg' },
  { id: '3', name: 'مكس (لحم ودجاج)', price: 23, category: 'hat_steak', image: '/images/mix-steak.jpg' },
  
  // هات حسني
  { id: '4', name: 'هات حسني', price: 16, category: 'hat_hosni', image: '/images/hosni.jpg' },
  { id: '5', name: 'سبيشل حسني', price: 18, category: 'hat_hosni', image: '/images/special-hosni.jpg' },

  // هات وجبة
  { id: '6', name: 'وجبة لحم', price: 23, category: 'hat_meal', image: '/images/meal-meat.jpg' },
  { id: '7', name: 'وجبة دجاج', price: 21, category: 'hat_meal', image: '/images/meal-chicken.jpg' },

  // ساندوتشات وبرجر
  { id: '8', name: 'شوس لحم', price: 16, category: 'sandwiches', image: '/images/shos-meat.jpg' },
  { id: '9', name: 'شوس دجاج', price: 14, category: 'sandwiches', image: '/images/shos-chicken.jpg' },
  { id: '10', name: 'برجر لحم', price: 14, category: 'sandwiches', image: '/images/burger-meat.jpg' },
  { id: '11', name: 'برجر دجاج', price: 12, category: 'sandwiches', image: '/images/burger-chicken.jpg' },

  // بطاطس
  { id: '12', name: 'بصل مقرمش', price: 11, category: 'fries', image: '/images/fries-onion.jpg' },
  { id: '13', name: 'ودجز', price: 9, category: 'fries', image: '/images/wedges.jpg' },
  { id: '14', name: 'مكعبات', price: 10, category: 'fries', image: '/images/cubes.jpg' },
  { id: '15', name: 'لحم مفروم', price: 12, category: 'fries', image: '/images/fries-meat.jpg' },
  { id: '16', name: 'دجاج مفروم', price: 12, category: 'fries', image: '/images/fries-chicken.jpg' },

  // مشروبات
  { id: '17', name: 'مشروب غازي', price: 4, category: 'drinks', image: '/images/soft-drink.jpg' },
  { id: '18', name: 'ماء', price: 1, category: 'drinks', image: '/images/water.jpg' },
];

export const CATEGORIES = [
  { id: 'hat_steak', name: 'هات ستيك' },
  { id: 'hat_hosni', name: 'هات حسني' },
  { id: 'hat_meal', name: 'هات وجبة' },
  { id: 'sandwiches', name: 'ساندوتشات وبرجر' },
  { id: 'fries', name: 'بطاطس' },
  { id: 'drinks', name: 'مشروبات' },
];
