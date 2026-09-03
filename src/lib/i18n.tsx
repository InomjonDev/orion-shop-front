'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { Lang } from './types'

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'uz', label: "O‘zbekcha" },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' }
]

type Dict = Record<string, string>

const en: Dict = {
  'nav.catalog': 'Catalog',
  'nav.orders': 'My orders',
  'nav.cart': 'Cart',
  'nav.login': 'Sign in',
  'nav.logout': 'Sign out',
  'nav.tagline': 'Security & CCTV equipment',

  'common.all': 'All',
  'common.search': 'Search',
  'common.loading': 'Loading…',
  'common.back': 'Back',
  'common.cancel': 'Cancel',
  'common.optional': 'optional',
  'common.currencyNote': 'Prices in USD',

  'catalog.title': 'Catalog',
  'catalog.resultsOne': '1 product',
  'catalog.results': '{n} products',
  'catalog.brand': 'Brand',
  'catalog.category': 'Category',
  'catalog.allBrands': 'All brands',
  'catalog.allCategories': 'All categories',
  'catalog.searchPh': 'Search cameras, NVRs, brands…',
  'catalog.none': 'No products match your filters',
  'catalog.noneHint': 'Try clearing the search or filters.',
  'catalog.clear': 'Clear filters',
  'catalog.sort': 'Sort',
  'catalog.sortNew': 'Newest',
  'catalog.sortLow': 'Price: low to high',
  'catalog.sortHigh': 'Price: high to low',

  'stock.in': 'In stock',
  'stock.out': 'Out of stock',
  'stock.left': 'Only {n} left',

  'product.addToCart': 'Add to cart',
  'product.description': 'Description',
  'product.brand': 'Brand',
  'product.category': 'Category',
  'product.back': 'Back to catalog',
  'product.added': 'Added to cart',
  'product.notFound': 'Product not found',
  'product.notFoundHint': 'It may have been removed from the shop.',

  'cart.title': 'Your cart',
  'cart.empty': 'Your cart is empty',
  'cart.emptyHint': 'Browse the catalog and add products.',
  'cart.each': '{price} each',
  'cart.remove': 'Remove',
  'cart.subtotal': 'Subtotal',
  'cart.total': 'Total',
  'cart.checkout': 'Checkout',
  'cart.keepShopping': 'Keep shopping',
  'cart.itemsOne': '1 item',
  'cart.items': '{n} items',

  'checkout.title': 'Checkout',
  'checkout.signInFirst': 'Sign in to place your order',
  'checkout.signInHint': 'We use your phone number to confirm the order.',
  'checkout.contact': 'Contact',
  'checkout.name': 'Your name',
  'checkout.namePh': 'e.g. Aziz Karimov',
  'checkout.phone': 'Phone',
  'checkout.fulfillment': 'How would you like to receive it?',
  'checkout.pickup': 'Pick up in store',
  'checkout.pickupHint': 'Collect from the shop, pay on arrival.',
  'checkout.delivery': 'Delivery',
  'checkout.deliveryHint': 'We deliver and you pay on arrival.',
  'checkout.address': 'Delivery address',
  'checkout.addressPh': 'Street, house, district, city',
  'checkout.note': 'Note',
  'checkout.notePh': 'Anything we should know (optional)',
  'checkout.payment': 'Payment',
  'checkout.cod': 'Cash on pickup / delivery',
  'checkout.codHint': 'Pay when you receive the order.',
  'checkout.card': 'Card (Visa / Mastercard)',
  'checkout.cardSoon': 'Coming soon',
  'checkout.summary': 'Order summary',
  'checkout.place': 'Place order',
  'checkout.placing': 'Placing order…',
  'checkout.nameReq': 'Please enter your name.',
  'checkout.phoneReq': 'Please enter a valid phone number.',
  'checkout.addressReq': 'Please enter a delivery address.',
  'checkout.emptyCart': 'Your cart is empty.',

  'order.thankYou': 'Thank you! Your order is placed.',
  'order.confirmHint': 'We’ll call {phone} to confirm. Pay on pickup or delivery.',
  'order.number': 'Order {id}',
  'order.placedOn': 'Placed {date}',
  'order.total': 'Total',
  'order.items': 'Items',
  'order.fulfillment': 'Fulfillment',
  'order.payment': 'Payment',
  'order.viewOrders': 'View my orders',
  'order.backToShop': 'Back to shop',
  'order.cancel': 'Cancel order',
  'order.cancelConfirm': 'Cancel this order?',
  'order.keep': 'Keep order',
  'order.cancelled': 'Your order was cancelled.',
  'profile.title': 'Complete your profile',
  'profile.subtitle': 'Add your name and location so we can process your orders.',
  'profile.location': 'Location / address',
  'profile.save': 'Save & continue',
  'profile.saved': 'Profile saved.',
  'order.view': 'View',
  'orders.title': 'My orders',
  'orders.empty': 'No orders yet',
  'orders.emptyHint': 'Your orders will appear here after checkout.',
  'orders.signInHint': 'Sign in to see your orders.',

  'status.new': 'New',
  'status.confirmed': 'Confirmed',
  'status.fulfilled': 'Completed',
  'status.cancelled': 'Cancelled',

  'auth.title': 'Sign in',
  'auth.subtitle': 'Log in with Telegram — fast, free, no SMS needed.',
  'auth.telegramHint': 'One tap with your Telegram account.',
  'auth.demoContinue': 'Continue',
  'auth.phone': 'Phone number',
  'auth.phonePh': '+998 90 123 45 67',
  'auth.sendCode': 'Send code',
  'auth.sending': 'Sending…',
  'auth.codeSent': 'We sent a code to {phone}.',
  'auth.code': 'SMS code',
  'auth.codePh': '6-digit code',
  'auth.verify': 'Verify & sign in',
  'auth.verifying': 'Verifying…',
  'auth.change': 'Change number',
  'auth.invalidPhone': 'Enter a valid phone number.',
  'auth.invalidCode': 'Enter the 6-digit code.',
  'auth.failed': 'Could not verify the code. Try again.',
  'auth.demoNote': 'Demo mode: enter any 6 digits to sign in.',

  'footer.contact': 'Contact',
  'footer.builtWith': 'Online shop for'
}

const ru: Dict = {
  'nav.catalog': 'Каталог',
  'nav.orders': 'Мои заказы',
  'nav.cart': 'Корзина',
  'nav.login': 'Войти',
  'nav.logout': 'Выйти',
  'nav.tagline': 'Системы видеонаблюдения',

  'common.all': 'Все',
  'common.search': 'Поиск',
  'common.loading': 'Загрузка…',
  'common.back': 'Назад',
  'common.cancel': 'Отмена',
  'common.optional': 'необязательно',
  'common.currencyNote': 'Цены в USD',

  'catalog.title': 'Каталог',
  'catalog.resultsOne': '1 товар',
  'catalog.results': 'Товаров: {n}',
  'catalog.brand': 'Бренд',
  'catalog.category': 'Категория',
  'catalog.allBrands': 'Все бренды',
  'catalog.allCategories': 'Все категории',
  'catalog.searchPh': 'Поиск камер, регистраторов, брендов…',
  'catalog.none': 'Ничего не найдено',
  'catalog.noneHint': 'Попробуйте изменить поиск или фильтры.',
  'catalog.clear': 'Сбросить фильтры',
  'catalog.sort': 'Сортировка',
  'catalog.sortNew': 'Новые',
  'catalog.sortLow': 'Цена: по возрастанию',
  'catalog.sortHigh': 'Цена: по убыванию',

  'stock.in': 'В наличии',
  'stock.out': 'Нет в наличии',
  'stock.left': 'Осталось {n}',

  'product.addToCart': 'В корзину',
  'product.description': 'Описание',
  'product.brand': 'Бренд',
  'product.category': 'Категория',
  'product.back': 'Назад в каталог',
  'product.added': 'Добавлено в корзину',
  'product.notFound': 'Товар не найден',
  'product.notFoundHint': 'Возможно, он снят с продажи.',

  'cart.title': 'Корзина',
  'cart.empty': 'Корзина пуста',
  'cart.emptyHint': 'Откройте каталог и добавьте товары.',
  'cart.each': '{price} за шт.',
  'cart.remove': 'Удалить',
  'cart.subtotal': 'Промежуточный итог',
  'cart.total': 'Итого',
  'cart.checkout': 'Оформить',
  'cart.keepShopping': 'Продолжить покупки',
  'cart.itemsOne': '1 товар',
  'cart.items': 'Товаров: {n}',

  'checkout.title': 'Оформление',
  'checkout.signInFirst': 'Войдите, чтобы оформить заказ',
  'checkout.signInHint': 'Мы используем номер телефона для подтверждения.',
  'checkout.contact': 'Контакты',
  'checkout.name': 'Ваше имя',
  'checkout.namePh': 'напр. Азиз Каримов',
  'checkout.phone': 'Телефон',
  'checkout.fulfillment': 'Как вы хотите получить заказ?',
  'checkout.pickup': 'Самовывоз',
  'checkout.pickupHint': 'Забрать из магазина, оплата при получении.',
  'checkout.delivery': 'Доставка',
  'checkout.deliveryHint': 'Доставим, оплата при получении.',
  'checkout.address': 'Адрес доставки',
  'checkout.addressPh': 'Улица, дом, район, город',
  'checkout.note': 'Комментарий',
  'checkout.notePh': 'Что нам нужно знать (необязательно)',
  'checkout.payment': 'Оплата',
  'checkout.cod': 'Наличными при получении',
  'checkout.codHint': 'Оплата при получении заказа.',
  'checkout.card': 'Карта (Visa / Mastercard)',
  'checkout.cardSoon': 'Скоро',
  'checkout.summary': 'Ваш заказ',
  'checkout.place': 'Оформить заказ',
  'checkout.placing': 'Оформляем…',
  'checkout.nameReq': 'Введите имя.',
  'checkout.phoneReq': 'Введите корректный номер телефона.',
  'checkout.addressReq': 'Введите адрес доставки.',
  'checkout.emptyCart': 'Корзина пуста.',

  'order.thankYou': 'Спасибо! Заказ оформлен.',
  'order.confirmHint': 'Мы позвоним на {phone} для подтверждения. Оплата при получении.',
  'order.number': 'Заказ {id}',
  'order.placedOn': 'Оформлен {date}',
  'order.total': 'Итого',
  'order.items': 'Товары',
  'order.fulfillment': 'Получение',
  'order.payment': 'Оплата',
  'order.viewOrders': 'Мои заказы',
  'order.backToShop': 'В магазин',
  'order.cancel': 'Отменить заказ',
  'order.cancelConfirm': 'Отменить этот заказ?',
  'order.keep': 'Оставить',
  'order.cancelled': 'Ваш заказ отменён.',
  'profile.title': 'Заполните профиль',
  'profile.subtitle': 'Укажите имя и адрес, чтобы мы могли обработать заказы.',
  'profile.location': 'Адрес / местоположение',
  'profile.save': 'Сохранить и продолжить',
  'profile.saved': 'Профиль сохранён.',
  'order.view': 'Открыть',
  'orders.title': 'Мои заказы',
  'orders.empty': 'Заказов пока нет',
  'orders.emptyHint': 'Ваши заказы появятся здесь после оформления.',
  'orders.signInHint': 'Войдите, чтобы увидеть заказы.',

  'status.new': 'Новый',
  'status.confirmed': 'Подтверждён',
  'status.fulfilled': 'Завершён',
  'status.cancelled': 'Отменён',

  'auth.title': 'Вход',
  'auth.subtitle': 'Войдите через Telegram — быстро, бесплатно, без SMS.',
  'auth.telegramHint': 'Один тап через ваш аккаунт Telegram.',
  'auth.demoContinue': 'Продолжить',
  'auth.phone': 'Номер телефона',
  'auth.phonePh': '+998 90 123 45 67',
  'auth.sendCode': 'Отправить код',
  'auth.sending': 'Отправка…',
  'auth.codeSent': 'Мы отправили код на {phone}.',
  'auth.code': 'Код из SMS',
  'auth.codePh': '6-значный код',
  'auth.verify': 'Подтвердить и войти',
  'auth.verifying': 'Проверка…',
  'auth.change': 'Изменить номер',
  'auth.invalidPhone': 'Введите корректный номер.',
  'auth.invalidCode': 'Введите 6-значный код.',
  'auth.failed': 'Не удалось проверить код. Попробуйте снова.',
  'auth.demoNote': 'Демо-режим: введите любые 6 цифр для входа.',

  'footer.contact': 'Контакты',
  'footer.builtWith': 'Интернет-магазин'
}

const uz: Dict = {
  'nav.catalog': 'Katalog',
  'nav.orders': 'Buyurtmalarim',
  'nav.cart': 'Savat',
  'nav.login': 'Kirish',
  'nav.logout': 'Chiqish',
  'nav.tagline': 'Xavfsizlik va videokuzatuv',

  'common.all': 'Barchasi',
  'common.search': 'Qidirish',
  'common.loading': 'Yuklanmoqda…',
  'common.back': 'Orqaga',
  'common.cancel': 'Bekor qilish',
  'common.optional': 'ixtiyoriy',
  'common.currencyNote': 'Narxlar USD',

  'catalog.title': 'Katalog',
  'catalog.resultsOne': '1 ta mahsulot',
  'catalog.results': '{n} ta mahsulot',
  'catalog.brand': 'Brend',
  'catalog.category': 'Turkum',
  'catalog.allBrands': 'Barcha brendlar',
  'catalog.allCategories': 'Barcha turkumlar',
  'catalog.searchPh': 'Kamera, NVR, brend qidiring…',
  'catalog.none': 'Filtrlarga mos mahsulot yo‘q',
  'catalog.noneHint': 'Qidiruv yoki filtrlarni tozalab ko‘ring.',
  'catalog.clear': 'Filtrlarni tozalash',
  'catalog.sort': 'Saralash',
  'catalog.sortNew': 'Yangi',
  'catalog.sortLow': 'Narx: arzondan',
  'catalog.sortHigh': 'Narx: qimmatdan',

  'stock.in': 'Mavjud',
  'stock.out': 'Tugagan',
  'stock.left': 'Faqat {n} ta qoldi',

  'product.addToCart': 'Savatga',
  'product.description': 'Tavsif',
  'product.brand': 'Brend',
  'product.category': 'Turkum',
  'product.back': 'Katalogga qaytish',
  'product.added': 'Savatga qo‘shildi',
  'product.notFound': 'Mahsulot topilmadi',
  'product.notFoundHint': 'Ehtimol, sotuvdan olib tashlangan.',

  'cart.title': 'Savatingiz',
  'cart.empty': 'Savat bo‘sh',
  'cart.emptyHint': 'Katalogdan mahsulot qo‘shing.',
  'cart.each': 'donasi {price}',
  'cart.remove': 'O‘chirish',
  'cart.subtotal': 'Oraliq jami',
  'cart.total': 'Jami',
  'cart.checkout': 'Rasmiylashtirish',
  'cart.keepShopping': 'Xaridni davom ettirish',
  'cart.itemsOne': '1 ta mahsulot',
  'cart.items': '{n} ta mahsulot',

  'checkout.title': 'Rasmiylashtirish',
  'checkout.signInFirst': 'Buyurtma berish uchun kiring',
  'checkout.signInHint': 'Buyurtmani tasdiqlash uchun telefon raqamingizdan foydalanamiz.',
  'checkout.contact': 'Aloqa',
  'checkout.name': 'Ismingiz',
  'checkout.namePh': 'masalan, Aziz Karimov',
  'checkout.phone': 'Telefon',
  'checkout.fulfillment': 'Buyurtmani qanday olasiz?',
  'checkout.pickup': 'Do‘kondan olib ketish',
  'checkout.pickupHint': 'Do‘kondan olib keting, olganda to‘lang.',
  'checkout.delivery': 'Yetkazib berish',
  'checkout.deliveryHint': 'Yetkazamiz, olganda to‘laysiz.',
  'checkout.address': 'Yetkazish manzili',
  'checkout.addressPh': 'Ko‘cha, uy, tuman, shahar',
  'checkout.note': 'Izoh',
  'checkout.notePh': 'Bilishimiz kerak bo‘lgan narsa (ixtiyoriy)',
  'checkout.payment': 'To‘lov',
  'checkout.cod': 'Olib ketish / yetkazishda naqd',
  'checkout.codHint': 'Buyurtmani olganingizda to‘laysiz.',
  'checkout.card': 'Karta (Visa / Mastercard)',
  'checkout.cardSoon': 'Tez orada',
  'checkout.summary': 'Buyurtma tafsiloti',
  'checkout.place': 'Buyurtma berish',
  'checkout.placing': 'Yuborilmoqda…',
  'checkout.nameReq': 'Ismingizni kiriting.',
  'checkout.phoneReq': 'To‘g‘ri telefon raqamini kiriting.',
  'checkout.addressReq': 'Yetkazish manzilini kiriting.',
  'checkout.emptyCart': 'Savat bo‘sh.',

  'order.thankYou': 'Rahmat! Buyurtmangiz qabul qilindi.',
  'order.confirmHint': 'Tasdiqlash uchun {phone} raqamiga qo‘ng‘iroq qilamiz. To‘lov olib ketish yoki yetkazishda.',
  'order.number': 'Buyurtma {id}',
  'order.placedOn': '{date} da berilgan',
  'order.total': 'Jami',
  'order.items': 'Mahsulotlar',
  'order.fulfillment': 'Olish usuli',
  'order.payment': 'To‘lov',
  'order.viewOrders': 'Buyurtmalarim',
  'order.backToShop': 'Do‘konga qaytish',
  'order.cancel': 'Buyurtmani bekor qilish',
  'order.cancelConfirm': 'Bu buyurtma bekor qilinsinmi?',
  'order.keep': 'Qoldirish',
  'order.cancelled': 'Buyurtmangiz bekor qilindi.',
  'profile.title': 'Profilingizni to‘ldiring',
  'profile.subtitle': 'Buyurtmalarni qayta ishlashimiz uchun ism va manzilingizni kiriting.',
  'profile.location': 'Manzil / joylashuv',
  'profile.save': 'Saqlash va davom etish',
  'profile.saved': 'Profil saqlandi.',
  'order.view': 'Ochish',
  'orders.title': 'Buyurtmalarim',
  'orders.empty': 'Hozircha buyurtma yo‘q',
  'orders.emptyHint': 'Rasmiylashtirgach, buyurtmalar shu yerda chiqadi.',
  'orders.signInHint': 'Buyurtmalarni ko‘rish uchun kiring.',

  'status.new': 'Yangi',
  'status.confirmed': 'Tasdiqlangan',
  'status.fulfilled': 'Yakunlangan',
  'status.cancelled': 'Bekor qilingan',

  'auth.title': 'Kirish',
  'auth.subtitle': 'Telegram orqali kiring — tez, bepul, SMS shart emas.',
  'auth.telegramHint': 'Telegram akkauntingiz bilan bir teginish.',
  'auth.demoContinue': 'Davom etish',
  'auth.phone': 'Telefon raqami',
  'auth.phonePh': '+998 90 123 45 67',
  'auth.sendCode': 'Kod yuborish',
  'auth.sending': 'Yuborilmoqda…',
  'auth.codeSent': '{phone} raqamiga kod yubordik.',
  'auth.code': 'SMS kod',
  'auth.codePh': '6 xonali kod',
  'auth.verify': 'Tasdiqlash va kirish',
  'auth.verifying': 'Tekshirilmoqda…',
  'auth.change': 'Raqamni o‘zgartirish',
  'auth.invalidPhone': 'To‘g‘ri telefon raqamini kiriting.',
  'auth.invalidCode': '6 xonali kodni kiriting.',
  'auth.failed': 'Kodni tasdiqlab bo‘lmadi. Qayta urining.',
  'auth.demoNote': 'Demo rejim: kirish uchun istalgan 6 raqamni kiriting.',

  'footer.contact': 'Aloqa',
  'footer.builtWith': 'Onlayn do‘kon'
}

const DICTS: Record<Lang, Dict> = { uz, ru, en }

export type TFunc = (key: string, vars?: Record<string, string | number>) => string

interface I18nCtx {
  lang: Lang
  setLang: (l: Lang) => void
  t: TFunc
}

const Ctx = createContext<I18nCtx | null>(null)

function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str
  return str.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`))
}

export function I18nProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [lang, setLangState] = useState<Lang>('uz')

  useEffect(() => {
    try {
      const s = localStorage.getItem('orion.shop.lang') as Lang | null
      if (s && s in DICTS) setLangState(s)
    } catch {
      /* ignore */
    }
  }, [])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem('orion.shop.lang', l)
    } catch {
      /* ignore */
    }
    document.documentElement.lang = l
  }, [])

  const t = useCallback<TFunc>(
    (key, vars) => interpolate(DICTS[lang][key] ?? DICTS.en[key] ?? key, vars),
    [lang]
  )

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>
}

export function useI18n(): I18nCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
