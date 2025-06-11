import reducer, {
  addIngredient,
  removeIngredient,
  moveIngredientUp,
  moveIngredientDown,
  orderBurger,
  initialState as defaultState
} from './constructorSlice';
import { describe, test, expect } from '@jest/globals';

describe('Reducer: constructorSlice', () => {
  describe('Action: addIngredient', () => {
    const baseState = {
      constructorItems: {
        bun: null,
        ingredients: []
      },
      isLoading: false,
      orderRequest: false,
      orderData: null,
      errorMessage: null
    };

    const bunItem = {
      _id: '123bun456',
      name: 'Mega Bun Classic',
      type: 'bun',
      proteins: 90,
      fat: 30,
      carbohydrates: 60,
      calories: 450,
      price: 1300,
      image: 'https://example.com/bun.png',
      image_mobile: 'https://example.com/bun-mobile.png',
      image_large: 'https://example.com/bun-large.png'
    };

    const sauceItem = {
      _id: '789sauce012',
      name: 'Special Sauce',
      type: 'sauce',
      proteins: 40,
      fat: 20,
      carbohydrates: 10,
      calories: 15,
      price: 70,
      image: 'https://example.com/sauce.png',
      image_mobile: 'https://example.com/sauce-mobile.png',
      image_large: 'https://example.com/sauce-large.png'
    };

    test('Добавляет ингредиент типа sauce в ingredients', () => {
      const nextState = reducer(baseState, addIngredient(sauceItem));

      expect(nextState.constructorItems.ingredients).toHaveLength(1);
      expect(nextState.constructorItems.ingredients[0]).toMatchObject({
        ...sauceItem,
        id: expect.any(String)
      });
    });

    test('Добавляет булку в поле bun', () => {
      const nextState = reducer(baseState, addIngredient(bunItem));

      expect(nextState.constructorItems.bun).toMatchObject({
        ...bunItem,
        id: expect.any(String)
      });
    });

    test('Заменяет существующую булку новой', () => {
      const stateWithBun = {
        ...baseState,
        constructorItems: {
          ...baseState.constructorItems,
          bun: { ...bunItem, id: 'oldbun123' }
        }
      };

      const newBun = {
        _id: '456bun789',
        name: 'Ultra Bun Deluxe',
        type: 'bun',
        proteins: 50,
        fat: 25,
        carbohydrates: 55,
        calories: 400,
        price: 1100,
        image: 'https://example.com/bun2.png',
        image_mobile: 'https://example.com/bun2-mobile.png',
        image_large: 'https://example.com/bun2-large.png'
      };

      const nextState = reducer(stateWithBun, addIngredient(newBun));

      expect(nextState.constructorItems.bun).toMatchObject({
        ...newBun,
        id: expect.any(String)
      });
    });
  });

  describe('Action: removeIngredient', () => {
    const stateWithIngredients = {
      ...defaultState,
      constructorItems: {
        bun: null,
        ingredients: [
          {
            id: 'toRemove',
            _id: '111ing222',
            name: 'Galaxy Sauce',
            type: 'sauce',
            proteins: 30,
            fat: 15,
            carbohydrates: 20,
            calories: 50,
            price: 40,
            image: 'https://example.com/galaxy-sauce.png',
            image_mobile: 'https://example.com/galaxy-sauce-mobile.png',
            image_large: 'https://example.com/galaxy-sauce-large.png'
          }
        ]
      }
    };

    test('Удаляет ингредиент по id из массива ingredients', () => {
      const nextState = reducer(
        stateWithIngredients,
        removeIngredient('toRemove')
      );

      expect(nextState.constructorItems.ingredients).toHaveLength(0);
    });
  });

  describe('Actions: moveIngredientUp & moveIngredientDown', () => {
    const stateWithMultipleIngredients = {
      ...defaultState,
      constructorItems: {
        bun: {
          id: 'bunId123',
          _id: 'bun_001',
          name: 'Classic Bun',
          type: 'bun',
          proteins: 80,
          fat: 25,
          carbohydrates: 50,
          calories: 400,
          price: 1200,
          image: 'https://example.com/bun.png',
          image_mobile: 'https://example.com/bun-mobile.png',
          image_large: 'https://example.com/bun-large.png'
        },
        ingredients: [
          {
            id: 'ing1',
            _id: 'ing_001',
            name: 'Space Sauce',
            type: 'sauce',
            proteins: 40,
            fat: 22,
            carbohydrates: 10,
            calories: 20,
            price: 60,
            image: 'https://example.com/sauce1.png',
            image_mobile: 'https://example.com/sauce1-mobile.png',
            image_large: 'https://example.com/sauce1-large.png'
          },
          {
            id: 'ing2',
            _id: 'ing_002',
            name: 'Crunchy Rings',
            type: 'main',
            proteins: 700,
            fat: 650,
            carbohydrates: 600,
            calories: 900,
            price: 280,
            image: 'https://example.com/rings.png',
            image_mobile: 'https://example.com/rings-mobile.png',
            image_large: 'https://example.com/rings-large.png'
          },
          {
            id: 'ing3',
            _id: 'ing_003',
            name: 'Fallenian Fruit',
            type: 'main',
            proteins: 18,
            fat: 6,
            carbohydrates: 60,
            calories: 80,
            price: 850,
            image: 'https://example.com/fruit.png',
            image_mobile: 'https://example.com/fruit-mobile.png',
            image_large: 'https://example.com/fruit-large.png'
          }
        ]
      }
    };

    test('Перемещает ингредиент вверх по списку', () => {
      const nextState = reducer(
        stateWithMultipleIngredients,
        moveIngredientUp(2)
      );

      expect(nextState.constructorItems.ingredients[1].id).toBe('ing3');
      expect(nextState.constructorItems.ingredients[2].id).toBe('ing2');
    });

    test('Перемещает ингредиент вниз по списку', () => {
      const nextState = reducer(
        stateWithMultipleIngredients,
        moveIngredientDown(1)
      );

      expect(nextState.constructorItems.ingredients[1].id).toBe('ing3');
      expect(nextState.constructorItems.ingredients[2].id).toBe('ing2');
    });
  });

  describe('Async action: orderBurger', () => {
    const actionTypes = {
      pending: { type: orderBurger.pending.type },
      rejected: {
        type: orderBurger.rejected.type,
        error: { message: 'Test error' }
      },
      fulfilled: {
        type: orderBurger.fulfilled.type,
        payload: { order: { number: 101 } }
      }
    };

    test('Обработка orderBurger.pending', () => {
      const state = reducer(defaultState, actionTypes.pending);
      expect(state.isLoading).toBe(true);
      expect(state.orderRequest).toBe(true);
      expect(state.errorMessage).toBeNull();
    });

    test('Обработка orderBurger.rejected', () => {
      const state = reducer(defaultState, actionTypes.rejected);
      expect(state.isLoading).toBe(false);
      expect(state.orderRequest).toBe(false);
      expect(state.errorMessage).toBe('Test error');
    });

    test('Обработка orderBurger.fulfilled', () => {
      const state = reducer(defaultState, actionTypes.fulfilled);
      expect(state.isLoading).toBe(false);
      expect(state.orderRequest).toBe(false);
      expect(state.errorMessage).toBeNull();
      expect(state.orderData).toEqual({ number: 101 });
      expect(state.constructorItems.bun).toBeNull();
      expect(state.constructorItems.ingredients).toHaveLength(0);
    });
  });
});
