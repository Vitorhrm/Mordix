import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateRegistration, validCpf, validEmail } from '../src/features/auth/validation';
import { deliveryFee, validateCoupon } from '../src/features/cart/cartRules';

const validForm = {
  firstName: 'Ana',
  lastName: 'Souza',
  cpf: '529.982.247-25',
  email: 'ana@example.com',
  password: 'SenhaDeTeste123',
  confirmation: 'SenhaDeTeste123',
};
test('cadastro aceita dados válidos e nomes compostos', () => {
  assert.deepEqual(
    validateRegistration({ ...validForm, firstName: ' Ana-Maria ', lastName: "D'Ávila" }),
    {},
  );
});
test('nome e sobrenome com espaços são rejeitados', () => {
  const errors = validateRegistration({ ...validForm, firstName: '  ', lastName: '' });
  assert.ok(errors.firstName);
  assert.ok(errors.lastName);
});
test('e-mail, CPF e senhas inválidos impedem o cadastro', () => {
  const errors = validateRegistration({
    ...validForm,
    email: 'sem-formato',
    cpf: '11111111111',
    password: 'curta',
    confirmation: 'diferente',
  });
  assert.ok(errors.email);
  assert.ok(errors.cpf);
  assert.ok(errors.password);
  assert.ok(errors.confirmation);
});
test('validação de CPF confere os dois dígitos e o formato do e-mail', () => {
  assert.equal(validCpf(validForm.cpf), true);
  assert.equal(validCpf('52998224726'), false);
  assert.equal(validCpf('00000000000'), false);
  assert.equal(validEmail('ana@'), false);
  assert.equal(validEmail('ana@example.com'), true);
});
const address = {
  label: 'Casa',
  street: 'Rua de teste',
  number: '1',
  city: 'Ouro Branco',
  district: 'Siderurgia',
};
test('frete respeita loja, bairro e retirada', () => {
  assert.equal(deliveryFee('brasa', address, false), 300);
  assert.equal(deliveryFee('forno', address, false), 500);
  assert.equal(deliveryFee('brasa', { ...address, district: 'Pioneiros' }, false), 500);
  assert.equal(deliveryFee('brasa', { ...address, district: 'Cristais' }, false), null);
  assert.equal(deliveryFee('brasa', { ...address, district: 'Cristais' }, true), 0);
  assert.equal(deliveryFee('brasa', { ...address, city: 'Outra' }, false), null);
  assert.equal(deliveryFee('brasa', address, true), 0);
});
test('cupons têm regras exclusivas por loja', () => {
  assert.equal(validateCoupon('brasa', 'BEMVINDO10', 4500, 300, false).discount, 1000);
  assert.equal(validateCoupon('forno', 'BEMVINDO10', 6200, 500, false).discount, 620);
  assert.ok(validateCoupon('forno', 'ENTREGAZERO', 6200, 500, false).error);
  assert.ok(validateCoupon('brasa', 'ENTREGAZERO', 4500, 0, true).error);
});
