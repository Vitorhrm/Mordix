import * as SecureStore from 'expo-secure-store';

const CHUNK_SIZE = 1800;

// Divide a sessão em partes pequenas e guarda no armazenamento protegido do Android.
export const sessionStorage = {
  async getItem(key: string): Promise<string | null> {
    const count = Number(await SecureStore.getItemAsync(`${key}.count`));
    if (!count || count > 100) return null;
    const chunks = await Promise.all(
      Array.from({ length: count }, (_, index) => SecureStore.getItemAsync(`${key}.${index}`)),
    );
    return chunks.some((chunk) => chunk === null) ? null : chunks.join('');
  },
  async setItem(key: string, value: string) {
    const oldCount = Number(await SecureStore.getItemAsync(`${key}.count`)) || 0;
    const count = Math.ceil(value.length / CHUNK_SIZE);
    for (let index = 0; index < count; index++) {
      await SecureStore.setItemAsync(
        `${key}.${index}`,
        value.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE),
      );
    }
    await SecureStore.setItemAsync(`${key}.count`, String(count));
    for (let index = count; index < oldCount; index++)
      await SecureStore.deleteItemAsync(`${key}.${index}`);
  },
  async removeItem(key: string) {
    const count = Number(await SecureStore.getItemAsync(`${key}.count`)) || 0;
    await SecureStore.deleteItemAsync(`${key}.count`);
    for (let index = 0; index < count; index++)
      await SecureStore.deleteItemAsync(`${key}.${index}`);
  },
};
