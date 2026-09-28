/*
 * Данные сайта «Территория красоты».
 * Источник: territoria-krasoty-svodka.md (прайс-листы от 9 января).
 * 7 позиций со статусом «Обсудить» в демо не выводятся (решение заказчика).
 *
 * Цены: d — у врача-косметолога, e — у косметолога-эстетиста.
 * null — этот уровень процедуру не выполняет.
 * from: true — цена «от». note — примечание из прайса как есть.
 * zones — только зоны, названные в наименовании процедуры, её категории или примечании прайса.
 */

window.TK = {
  salon: {
    name: 'Территория красоты',
    type: 'Медицинский салон косметологии',
    city: 'г. Старый Оскол',
    address: 'м-н Лесной, 10',
    priceSource: 'прайс-листы от 9 января',
    // Нет в сводке — выводятся как «нужно от заказчика»
    phone: null,
    email: null,
    hours: null,
    vk: null,
    messengers: null,
    requisites: null,
    license: null,
  },

  categories: [
    { id: 'cleaning', name: 'Чистки лица', plate: 'face' },
    { id: 'peeling', name: 'Пилинги', plate: 'both' },
    { id: 'hw-face', name: 'Аппаратная косметология — лицо', plate: 'face' },
    { id: 'injection', name: 'Инъекционная косметология', plate: 'both' },
    { id: 'laser', name: 'Лазерные процедуры', plate: 'both' },
    { id: 'epilation', name: 'Лазерная эпиляция', plate: 'body' },
    { id: 'hw-body', name: 'Аппаратный массаж и коррекция фигуры', plate: 'body' },
    { id: 'massage', name: 'Ручной массаж', plate: 'both' },
    { id: 'other', name: 'Прочее', plate: 'both' },
  ],

  zones: {
    face: [
      { id: 'face', name: 'Лицо целиком' },
      { id: 'scalp', name: 'Кожа головы' },
      { id: 'eyes', name: 'Глаза' },
      { id: 'nasolabial', name: 'Носогубные складки' },
      { id: 'lips', name: 'Губы' },
      { id: 'upperlip', name: 'Над губой и подбородок' },
      { id: 'ears', name: 'Уши' },
    ],
    body: [
      { id: 'body', name: 'Тело целиком' },
      { id: 'arms', name: 'Руки' },
      { id: 'underarms', name: 'Подмышки' },
      { id: 'back', name: 'Спина' },
      { id: 'bikini', name: 'Бикини' },
      { id: 'legs', name: 'Ноги' },
    ],
  },

  procedures: [
    // Чистки лица (6)
    { id: 'P01', cat: 'cleaning', name: 'Механическая (глубокая, ручная) чистка', d: 4000, e: null, from: true, zones: ['face'] },
    { id: 'P02', cat: 'cleaning', name: 'Комбинированная чистка', d: 4000, e: null, from: true, zones: ['face'] },
    { id: 'P03', cat: 'cleaning', name: 'Алмазная чистка', d: 4000, e: 3000, zones: ['face'] },
    { id: 'P04', cat: 'cleaning', name: 'Ультразвуковая чистка', d: null, e: 3000, zones: ['face'] },
    { id: 'P05', cat: 'cleaning', name: 'Aqua-чистка', d: 4000, e: 3000, zones: ['face'] },
    { id: 'P06', cat: 'cleaning', name: 'Атравматическая чистка', d: null, e: 3500, zones: ['face'] },

    // Пилинги (2)
    { id: 'P07', cat: 'peeling', name: 'Химический пилинг', d: 3000, e: 3000, note: '3 000–5 000 ₽, зависит от препарата', zones: [] },
    { id: 'P08', cat: 'peeling', name: 'Жёлтый (ретиноевый) пилинг', d: 5000, e: null, zones: [] },

    // Аппаратная косметология — лицо (12 из 13, без дермапена)
    { id: 'P09', cat: 'hw-face', name: 'RF-лифтинг', d: null, e: 2500, zones: ['face'] },
    { id: 'P10', cat: 'hw-face', name: 'RF-лифтинг лазерный', d: 4500, e: 3500, zones: ['face'] },
    { id: 'P11', cat: 'hw-face', name: 'Игольчатый RF-лифтинг (Morpheus 8)', d: 10000, e: 10000, zones: ['face'], device: 'D02' },
    { id: 'P12', cat: 'hw-face', name: 'Микротоки', d: null, e: 2000, zones: ['face'] },
    { id: 'P13', cat: 'hw-face', name: 'Электрофорез', d: null, e: 500, zones: ['face'] },
    { id: 'P14', cat: 'hw-face', name: 'Фонофорез', d: null, e: 1000, note: '+ стоимость сыворотки', zones: ['face'] },
    { id: 'P15', cat: 'hw-face', name: 'LED-маска', d: null, e: 500, zones: ['face'] },
    { id: 'P17', cat: 'hw-face', name: 'ELOS-омоложение', d: 3500, e: 2500, zones: ['face'] },
    { id: 'P18', cat: 'hw-face', name: 'Фото-лечение (IPL)', d: 3500, e: 2500, zones: ['face'] },
    { id: 'P19', cat: 'hw-face', name: 'SMAS-лифтинг', d: 15000, e: null, note: '15 000–30 000 ₽; зона по телу 15 000 ₽', zones: ['face'], device: 'D03' },
    { id: 'P20', cat: 'hw-face', name: 'INDIBA-терапия', d: 4000, e: 3500, note: 'зона лечебная 1 500 ₽; зона похудения 2 500 / 2 000 ₽', zones: ['face'], device: 'D04' },
    { id: 'P21', cat: 'hw-face', name: 'Карбоновый пилинг', d: 2500, e: 1500, zones: ['face'] },

    // Лазерные процедуры (7 из 9, без удаления папиллом и интимного омоложения)
    { id: 'P22', cat: 'laser', name: 'Лазерная шлифовка CO2 (Fotona)', d: 5000, e: 5000, note: 'по зонам: лицо 5 000, + шея 6 000, + декольте 7 000, лоб 2 000, глаза 3 000, щёки 3 000, нос 1 000, подбородок 1 000, декольте 5 000, кисти 4 000 ₽', zones: ['face', 'eyes'], device: 'D01' },
    { id: 'P23', cat: 'laser', name: 'Удаление тату и татуажа', d: 1500, e: 1500, from: true, zones: [], device: 'D01' },
    { id: 'P24', cat: 'laser', name: 'Удаление шрамов и рубцов', d: 700, e: null, note: '700 ₽ за 1 кв. см', zones: [] },
    { id: 'P25', cat: 'laser', name: 'Удаление растяжек', d: 1000, e: null, note: '1 000–5 000 ₽', zones: [] },
    { id: 'P26', cat: 'laser', name: 'Удаление сосудов', d: 2000, e: 1500, from: true, zones: [], device: 'D01' },
    { id: 'P27', cat: 'laser', name: 'Лечение пигмента лазером', d: 2500, e: null, from: true, zones: [], device: 'D01' },
    { id: 'P30', cat: 'laser', name: 'Ударно-волновая терапия', d: 1500, e: 1500, note: 'у врача 1 500–2 500 ₽, у эстетиста 1 500–2 000 ₽', zones: [] },

    // Инъекционная косметология (19 из 21, без карбокси- и озонотерапии)
    { id: 'P31', cat: 'injection', name: 'Мезотерапия лица', d: 5000, e: null, from: true, zones: ['face'] },
    { id: 'P32', cat: 'injection', name: 'Мезотерапия глаз', d: 5000, e: null, from: true, zones: ['eyes'] },
    { id: 'P33', cat: 'injection', name: 'Мезотерапия рук', d: 5000, e: null, from: true, zones: ['arms'] },
    { id: 'P34', cat: 'injection', name: 'Мезотерапия головы', d: 3000, e: null, from: true, zones: ['scalp'] },
    { id: 'P35', cat: 'injection', name: 'Биоревитализация лица', d: 5000, e: null, from: true, zones: ['face'] },
    { id: 'P36', cat: 'injection', name: 'Биоревитализация рук', d: 5000, e: null, from: true, zones: ['arms'] },
    { id: 'P37', cat: 'injection', name: 'Реовитализация', d: 6000, e: null, note: '6 000–20 000 ₽', zones: [] },
    { id: 'P40', cat: 'injection', name: 'Ботокс / мезоботокс', d: 150, e: null, note: '150 ₽ за единицу', zones: [] },
    { id: 'P41', cat: 'injection', name: 'Липолитики — лицо', d: 3000, e: null, from: true, zones: ['face'] },
    { id: 'P42', cat: 'injection', name: 'Липолитики — тело', d: 2000, e: null, from: true, zones: ['body'] },
    { id: 'P43', cat: 'injection', name: 'Нити моно', d: 7000, e: null, from: true, note: 'за упаковку', zones: [] },
    { id: 'P44', cat: 'injection', name: 'Нити спиральные', d: 700, e: null, note: '700–2 000 ₽ за 1 нить', zones: [] },
    { id: 'P45', cat: 'injection', name: 'Нити Коги', d: 2000, e: null, note: '2 000–5 000 ₽ за 1 нить', zones: [] },
    { id: 'P46', cat: 'injection', name: 'Жидкие нити', d: 20000, e: null, from: true, zones: [] },
    { id: 'P47', cat: 'injection', name: 'Плазмолифтинг', d: 3000, e: null, note: '3 000–5 000 ₽', zones: [] },
    { id: 'P48', cat: 'injection', name: 'Контурная пластика губ', d: 6000, e: null, from: true, zones: ['lips'] },
    { id: 'P49', cat: 'injection', name: 'Коррекция носогубных складок', d: 6000, e: null, from: true, zones: ['nasolabial'] },
    { id: 'P50', cat: 'injection', name: 'Коллагенотерапия', d: 15000, e: null, note: '15 000–20 000 ₽', zones: [] },
    { id: 'P51', cat: 'injection', name: 'Полимолочная кислота', d: 20000, e: null, from: true, zones: [] },

    // Лазерная эпиляция (10)
    { id: 'P53', cat: 'epilation', name: 'Глубокое бикини', d: null, e: 1500, zones: ['bikini'] },
    { id: 'P54', cat: 'epilation', name: 'Классическое бикини', d: null, e: 1200, zones: ['bikini'] },
    { id: 'P55', cat: 'epilation', name: 'Ноги полностью', d: null, e: 2500, zones: ['legs'] },
    { id: 'P56', cat: 'epilation', name: 'Ноги до колен', d: null, e: 1500, zones: ['legs'] },
    { id: 'P57', cat: 'epilation', name: 'Руки полностью', d: null, e: 2000, zones: ['arms'] },
    { id: 'P58', cat: 'epilation', name: 'Руки до локтя', d: null, e: 1500, zones: ['arms'] },
    { id: 'P59', cat: 'epilation', name: 'Подмышки', d: null, e: 800, zones: ['underarms'] },
    { id: 'P60', cat: 'epilation', name: 'Усы', d: null, e: 300, zones: ['upperlip'] },
    { id: 'P61', cat: 'epilation', name: 'Усы и подбородок', d: null, e: 600, zones: ['upperlip'] },
    { id: 'P62', cat: 'epilation', name: 'Всё тело', d: null, e: 5000, zones: ['body'] },

    // Аппаратный массаж и коррекция фигуры (15 из 16, без массажа электропечатками)
    { id: 'P63', cat: 'hw-body', name: 'LPG-массаж', d: null, e: 1300, zones: ['body'], device: 'D05' },
    { id: 'P64', cat: 'hw-body', name: 'RF-вакуумный массаж тела', d: null, e: 1500, zones: ['body'] },
    { id: 'P65', cat: 'hw-body', name: 'RF-вакуумный массаж (1 зона)', d: null, e: 1000, zones: [] },
    { id: 'P66', cat: 'hw-body', name: 'RF-лифтинг тела', d: null, e: 3000, zones: ['body'] },
    { id: 'P67', cat: 'hw-body', name: 'RF-лифтинг (1 зона)', d: null, e: 1500, zones: [] },
    { id: 'P68', cat: 'hw-body', name: 'Вибро-вакуумный массаж тела', d: null, e: 1500, zones: ['body'] },
    { id: 'P69', cat: 'hw-body', name: 'Вибро-вакуумный массаж (1 зона)', d: null, e: 1000, zones: [] },
    { id: 'P70', cat: 'hw-body', name: 'Вибро-вакуумный массаж лица', d: null, e: 1000, zones: ['face'] },
    { id: 'P71', cat: 'hw-body', name: 'Термо-вакуумный массаж тела', d: null, e: 1500, zones: ['body'] },
    { id: 'P72', cat: 'hw-body', name: 'Термо-вакуумный массаж (1 зона)', d: null, e: 1000, zones: [] },
    { id: 'P73', cat: 'hw-body', name: 'Эндосфера-терапия', d: null, e: 2500, note: 'тело 2 500 ₽, антицеллюлитная зона 1 500 ₽', zones: ['body'], device: 'D06' },
    { id: 'P74', cat: 'hw-body', name: 'Кавитация (1 зона)', d: null, e: 1300, zones: [] },
    { id: 'P75', cat: 'hw-body', name: 'Миостимуляция (1 зона)', d: null, e: 700, zones: [] },
    { id: 'P76', cat: 'hw-body', name: 'Биофотон', d: null, e: 1500, note: '1 зона 1 500 ₽, общий 2 500 ₽', zones: [] },
    { id: 'P77', cat: 'hw-body', name: 'EMS-стимуляция (1 зона)', d: null, e: 1000, zones: [] },

    // Ручной массаж (7)
    { id: 'P80', cat: 'massage', name: 'Пластифицирующий массаж лица', d: 2000, e: 1500, zones: ['face'] },
    { id: 'P81', cat: 'massage', name: 'Классический массаж лица', d: 2000, e: 1500, zones: ['face'] },
    { id: 'P82', cat: 'massage', name: 'Общий массаж тела', d: 3500, e: null, zones: ['body'] },
    { id: 'P83', cat: 'massage', name: 'Массаж спины', d: 2500, e: 2000, zones: ['back'] },
    { id: 'P84', cat: 'massage', name: 'Медовый массаж спины', d: null, e: 2000, zones: ['back'] },
    { id: 'P85', cat: 'massage', name: 'Медовый массаж (1 зона)', d: null, e: 2000, zones: [] },
    { id: 'P86', cat: 'massage', name: 'Медовый массаж лица', d: null, e: 2500, zones: ['face'] },

    // Прочее (1 из 2, без хиджамы)
    { id: 'P87', cat: 'other', name: 'Прокол ушей', d: 2000, e: null, note: '2 000 ₽ + серьги 700 ₽', zones: ['ears'] },
  ],

  // Аппараты. Дермапен и электропечатки скрыты вместе с их процедурами («Обсудить»).
  devices: [
    { id: 'D01', name: 'Fotona', maker: 'Fotona', country: 'Словения', flagship: true, procedures: 'Лазерная шлифовка CO2, удаление тату, сосудов, пигмента' },
    { id: 'D02', name: 'Morpheus 8', maker: 'InMode', country: 'Израиль', flagship: true, procedures: 'Игольчатый RF-лифтинг' },
    { id: 'D03', name: 'Альтера (Ulthera)', maker: 'Merz', country: 'США', flagship: true, procedures: 'SMAS-лифтинг', pending: 'Подтвердить, что используется именно этот аппарат' },
    { id: 'D04', name: 'INDIBA', maker: 'INDIBA', country: 'Испания', flagship: true, procedures: 'INDIBA-терапия' },
    { id: 'D05', name: 'LPG', maker: 'LPG Systems', country: 'Франция', flagship: true, procedures: 'LPG-массаж', pending: 'Уточнить модель' },
    { id: 'D06', name: 'Эндосфера', maker: 'Fenix Group', country: 'Италия', flagship: true, procedures: 'Эндосфера-терапия', pending: 'Уточнить модель' },
    { id: 'D07', name: 'EMSZERO', maker: null, country: null, procedures: 'EMS-стимуляция' },
    { id: 'D08', name: 'Аппарат ELOS / IPL', maker: null, country: null, procedures: 'ELOS-омоложение, фото-лечение', pending: 'Уточнить: один аппарат или два' },
    { id: 'D09', name: 'Аппарат лазерной эпиляции', maker: null, country: null, procedures: 'Лазерная эпиляция, все зоны', pending: 'Уточнить модель и тип лазера' },
    { id: 'D10', name: 'Аппарат RF', maker: null, country: null, procedures: 'RF-лифтинг лица и тела, RF-вакуумный массаж', pending: 'Уточнить модель' },
    { id: 'D11', name: 'Аппарат вакуумного массажа', maker: null, country: null, procedures: 'Вибро- и термо-вакуумный массаж', pending: 'Уточнить модель' },
    { id: 'D12', name: 'Аппарат кавитации', maker: null, country: null, procedures: 'Кавитация', pending: 'Уточнить модель' },
    { id: 'D13', name: 'Миостимулятор', maker: null, country: null, procedures: 'Миостимуляция', pending: 'Уточнить модель' },
    { id: 'D15', name: 'LED-маска', maker: null, country: null, procedures: 'LED-терапия', pending: 'Уточнить модель' },
    { id: 'D16', name: 'Аппарат ударно-волновой терапии', maker: null, country: null, procedures: 'Ударно-волновая терапия', pending: 'Уточнить модель' },
    { id: 'D17', name: 'Аппарат электрофореза и фонофореза', maker: null, country: null, procedures: 'Электрофорез, фонофорез', pending: 'Уточнить модель' },
    { id: 'D18', name: 'Биофотон', maker: null, country: null, procedures: 'Биофотон', pending: 'Уточнить, что это за аппарат' },
  ],

  specialists: [
    {
      id: 'alena',
      name: 'Алёна',
      level: 'd',
      role: 'Врач-косметолог',
      focus: 'Инъекционные методики, лазерные процедуры, аппаратное омоложение',
      scope: 'Весь спектр процедур, включая инъекции и назначение препаратов',
    },
    {
      id: 'zlata',
      name: 'Злата',
      level: 'e',
      role: 'Косметолог-эстетист',
      focus: 'Аппаратная косметология, коррекция фигуры, лазерная эпиляция',
      scope: 'Аппаратные и уходовые процедуры',
    },
    {
      id: 'polina',
      name: 'Полина',
      level: 'e',
      role: 'Косметолог-эстетист',
      focus: 'Аппаратная косметология, коррекция фигуры, лазерная эпиляция',
      scope: 'Аппаратные и уходовые процедуры',
    },
  ],

  // Поля, которых нет в сводке ни по одному специалисту
  specialistMissing: ['Фамилия', 'Стаж', 'Образование', 'Сертификаты', 'Фото и согласие на публикацию'],
};
