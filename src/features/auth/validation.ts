export type Registration = {
  firstName: string;
  lastName: string;
  cpf: string;
  email: string;
  password: string;
  confirmation: string;
};
export type FormErrors = Partial<Record<keyof Registration, string>>;
export const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

// Confere os dígitos do CPF, sem consultar ou comprovar a identidade da pessoa.
export function validCpf(value: string) {
  const cpf = value.replace(/\D/g, '');
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  const checkDigit = (size: number) => {
    const sum = [...cpf.slice(0, size)].reduce(
      (total, digit, index) => total + Number(digit) * (size + 1 - index),
      0,
    );
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  return checkDigit(9) === Number(cpf[9]) && checkDigit(10) === Number(cpf[10]);
}

// Valida os campos antes de enviar o cadastro para o Supabase.
export function validateRegistration(form: Registration): FormErrors {
  const errors: FormErrors = {};
  if (!form.firstName.trim()) errors.firstName = 'Informe seu nome';
  if (!form.lastName.trim()) errors.lastName = 'Informe seu sobrenome';
  if (!validCpf(form.cpf)) errors.cpf = 'Informe um CPF válido';
  if (!validEmail(form.email)) errors.email = 'Informe um e-mail válido';
  if (form.password.length < 8) errors.password = 'A senha deve ter pelo menos 8 caracteres';
  if (!form.confirmation) errors.confirmation = 'Confirme sua senha';
  else if (form.password !== form.confirmation) errors.confirmation = 'As senhas não coincidem';
  return errors;
}
