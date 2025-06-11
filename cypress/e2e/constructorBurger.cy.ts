const API = 'https://norma.nomoreparties.space/api';
const SELECTORS = {
  bun: `[data-cy="643d69a5c3f7b9001cfa093c"]`,
  altBun: `[data-cy="643d69a5c3f7b9001cfa093d"]`,
  filling: `[data-cy="643d69a5c3f7b9001cfa0941"]`,
  orderBtn: `[data-cy="order-button"]`,
  overlay: `[data-cy='overlay']`,
  constructor: `[data-cy="constructor"]`
};

beforeEach(() => {
  cy.intercept('GET', `${API}/ingredients`, { fixture: 'ingredients.json' }).as('ingredients');
  cy.intercept('POST', `${API}/auth/login`, { fixture: 'user.json' });
  cy.intercept('GET', `${API}/auth/user`, { fixture: 'user.json' }).as('getUser');
  cy.intercept('POST', `${API}/orders`, { fixture: 'orderResponse.json' }).as('postOrder');
  cy.viewport(1440, 800);
  cy.visit('/');
  cy.get('#modals').as('modalContainer');
});

context('Ингредиенты и конструктор', () => {
  it('Добавление начинки увеличивает счётчик', () => {
    cy.get(SELECTORS.filling).find('button').click();
    cy.get(SELECTORS.filling).find('.counter__num').should('have.text', '1');
    cy.get(SELECTORS.constructor).should('contain.text', 'марсианской Магнолии');
  });

  it('Можно собрать бургер с булкой и начинкой', () => {
    cy.get(SELECTORS.bun).find('button').click();
    cy.get(SELECTORS.filling).find('button').click();
    cy.get(SELECTORS.constructor).should('contain.text', 'верх');
    cy.get(SELECTORS.constructor).should('contain.text', 'низ');
    cy.get(SELECTORS.orderBtn).should('not.be.disabled');
  });

  it('Можно сначала положить начинку, а потом булку', () => {
    cy.get(SELECTORS.filling).find('button').click();
    cy.get(SELECTORS.bun).find('button').click();
    cy.get(SELECTORS.constructor).should('contain.text', 'марсианской Магнолии');
  });

  it('Замена булки без начинки работает корректно', () => {
    cy.get(SELECTORS.bun).find('button').click();
    cy.get(SELECTORS.altBun).find('button').click();
    cy.get(SELECTORS.constructor).should('contain.text', 'верх');
    cy.get(SELECTORS.constructor).should('contain.text', 'низ');
    cy.get(SELECTORS.constructor).should('contain.text', 'Флюоресцентная булка R2-D3'); // проверка альтернативной булки
  });

  it('Замена булки при наличии начинки работает', () => {
    cy.get(SELECTORS.bun).find('button').click();
    cy.get(SELECTORS.filling).find('button').click();
    cy.get(SELECTORS.altBun).find('button').click();
    cy.get(SELECTORS.constructor).should('contain.text', 'верх');
    cy.get(SELECTORS.constructor).should('contain.text', 'низ');
    cy.get(SELECTORS.constructor).should('contain.text', 'марсианской Магнолии');
  });
});

context('Оформление заказа', () => {
  beforeEach(() => {
    localStorage.setItem('refreshToken', 'mock-refresh');
    cy.setCookie('accessToken', 'mock-access');
  });

  afterEach(() => {
    localStorage.clear();
    cy.clearCookies();
  });

  it('Успешная отправка заказа с моком', () => {
    cy.get(SELECTORS.bun).find('button').click();
    cy.get(SELECTORS.filling).find('button').click();
    cy.get(SELECTORS.orderBtn).click();
    cy.wait('@postOrder');
    cy.get('@modalContainer').find('h2').should('contain.text', '888999');
    cy.get('@modalContainer').find('button').click(); // закрыть модалку
    cy.get('@modalContainer').should('be.empty');

    // Проверка, что конструктор очистился
    cy.get(SELECTORS.constructor).should('contain.text', 'Выберите булки');
    cy.get(SELECTORS.constructor).should('contain.text', 'Выберите начинку');
  });
});

context('Модальные окна ингредиентов', () => {
  it('Открытие карточки ингредиента и проверка URL', () => {
    cy.get('@modalContainer').should('be.empty');
    cy.get(SELECTORS.filling).find('a').click();
    cy.get('@modalContainer').should('not.be.empty');
    cy.url().should('include', '643d69a5c3f7b9001cfa0941');
    cy.get('@modalContainer').should('contain.text', 'Биокотлета из марсианской Магнолии');
  });

  it('Закрытие модального окна через кнопку ✕', () => {
    cy.get(SELECTORS.filling).find('a').click();
    cy.get('@modalContainer').should('not.be.empty');
    cy.get('@modalContainer').find('button').click();
    cy.get('@modalContainer').should('be.empty');
  });

  it('Закрытие модалки по клику на оверлей', () => {
    cy.get(SELECTORS.filling).find('a').click();
    cy.get('@modalContainer').should('not.be.empty');
    cy.get(SELECTORS.overlay).click({ force: true });
    cy.get('@modalContainer').should('be.empty');
  });

  it('Закрытие по клавише Escape', () => {
    cy.get(SELECTORS.filling).find('a').click();
    cy.get('@modalContainer').should('not.be.empty');
    cy.get('body').type('{esc}');
    cy.get('@modalContainer').should('be.empty');
  });
});
