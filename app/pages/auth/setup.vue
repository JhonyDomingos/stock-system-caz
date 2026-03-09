<script setup lang="ts">
definePageMeta({
  layout: false,
});

const { setup } = useAuth();
const router = useRouter();

// If setup is not needed, redirect to login
onMounted(async () => {
  const result = await $fetch<{ needsSetup: boolean }>('/api/auth/check');
  if (!result.needsSetup) {
    router.replace('/auth/login');
  }
});

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const error = ref('');
const isLoading = ref(false);

async function handleSubmit() {
  error.value = '';

  if (!form.name.trim()) {
    error.value = 'Nome é obrigatório';
    return;
  }

  if (!form.email.trim()) {
    error.value = 'Email é obrigatório';
    return;
  }

  if (form.password.length < 8) {
    error.value = 'A palavra-passe deve ter pelo menos 8 caracteres';
    return;
  }

  if (form.password !== form.confirmPassword) {
    error.value = 'As palavras-passe não coincidem';
    return;
  }

  isLoading.value = true;

  try {
    await setup(form.email, form.password, form.name);
    await router.push('/');
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } };
    error.value = err.data?.message || 'Falha ao criar conta';
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-lg shadow-md border border-gray-200 p-8">
        <div class="text-center mb-8">
          <div
            class="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary-50 mb-4"
          >
            <Icon name="lucide:package" class="w-6 h-6 text-primary-600" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Bem-vindo ao OpenStock</h1>
          <p class="text-sm text-gray-500 mt-2">
            Crie a sua conta de administrador para começar
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div
            v-if="error"
            class="p-3 rounded-md bg-red-50 border border-red-200"
          >
            <p class="text-sm text-red-600 flex items-center gap-2">
              <Icon name="lucide:alert-circle" class="w-4 h-4" />
              {{ error }}
            </p>
          </div>

          <UiInput
            v-model="form.name"
            label="Nome Completo"
            placeholder="João Silva"
            icon="lucide:user"
            :disabled="isLoading"
          />

          <UiInput
            v-model="form.email"
            type="email"
            label="Endereço de Email"
            placeholder="admin@empresa.com"
            icon="lucide:mail"
            :disabled="isLoading"
          />

          <UiInput
            v-model="form.password"
            type="password"
            label="Palavra-passe"
            placeholder="••••••••"
            icon="lucide:lock"
            :disabled="isLoading"
          />

          <UiInput
            v-model="form.confirmPassword"
            type="password"
            label="Confirmar Palavra-passe"
            placeholder="••••••••"
            icon="lucide:lock"
            :disabled="isLoading"
          />

          <UiButton
            type="submit"
            block
            :loading="isLoading"
            :disabled="isLoading"
          >
            <Icon v-if="!isLoading" name="lucide:rocket" class="w-4 h-4 mr-2" />
            Criar Conta de Administrador
          </UiButton>
        </form>

        <p class="text-xs text-gray-400 text-center mt-6">
          Esta será a conta de administrador com acesso total a todas as
          funcionalidades.
        </p>
      </div>
    </div>
  </div>
</template>
