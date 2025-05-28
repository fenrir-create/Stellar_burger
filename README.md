# Stellar Burger — Проектная работа 11-го спринта

## 🧾 Описание проекта

«Stellar Burgers» — это веб-приложение для создания космических бургеров. Проект разработан с использованием современных технологий React, Redux Toolkit, TypeScript и поддержкой авторизации, роутинга и функционального тестирования.

🔗 [Макет в Figma](https://www.figma.com/file/vIywAvqfkOIRWGOkfOnReY/React-Fullstack_-Проектные-задачи-(3-месяца)_external_link?type=design&node-id=0-1&mode=design)  
📋 [Чеклист проекта](https://www.notion.so/praktikum/0527c10b723d4873aa75686bad54b32e?pvs=4)

---

## 🚀 Используемые технологии

- **Create React App** — стартовая сборка приложения
- **Redux Toolkit** — удобное и мощное управление состоянием
- **React Router** — маршрутизация и защищённые маршруты
- **TypeScript** — строгая типизация
- **JWT авторизация** — через cookie
- **Cypress** — функциональное end-to-end тестирование
- **Jest / RTL** — юнит-тестирование редьюсеров

---

## 🧪 Функциональные особенности

- 🔐 Авторизация и регистрация с валидацией
- 🛠️ Редактирование профиля
- 🍔 Конструктор бургеров
- 📦 Отображение истории заказов и ленты заказов
- 🔄 Модальные окна и переходы по id заказа/ингредиента
- 🧭 Навигация с подсветкой активных ссылок
- ✅ Защищённые маршруты
- 💬 Информация об ошибках и лоадерах

---

## 🔧 Установка и запуск

```bash
npm install
npm start
```
## 🗂️ Структура роутинга
| Маршрут                    | Компонент                   | Защита |
|----------------------------|-----------------------------|--------|
| `/`                        | ConstructorPage             | ❌     |
| `/feed`                    | Feed                        | ❌     |
| `/login`                   | Login                       | ✅     |
| `/register`                | Register                    | ✅     |
| `/forgot-password`         | ForgotPassword              | ✅     |
| `/reset-password`          | ResetPassword               | ✅     |
| `/profile`                 | Profile                     | ✅     |
| `/profile/orders`          | ProfileOrders               | ✅     |
| `/ingredients/:id`         | IngredientsDetails (Modal)  | ❌     |
| `/feed/:number`            | OrderInfo (Modal)           | ❌     |
| `/profile/orders/:number`  | OrderInfo (Modal)           | ✅     |
| `*`                        | NotFound404                 | ❌     |
