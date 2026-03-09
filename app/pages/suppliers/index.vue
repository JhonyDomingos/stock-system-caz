<script setup lang="ts">
import type { Supplier } from "~~/server/database/schema";

const toast = useToast();

const { data: suppliers, pending, refresh } = await useFetch("/api/suppliers");

const isModalOpen = ref(false);
const editingSupplier = ref<Supplier | null>(null);
const isSubmitting = ref(false);

const form = reactive({
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
  country: "Brazil",
  notes: "",
});

const columns = [
  { key: "name", label: "Fornecedor" },
  { key: "contact", label: "Contacto" },
  { key: "location", label: "Localização" },
  { key: "status", label: "Estado" },
  { key: "actions", label: "", class: "w-24" },
];

function openCreateModal() {
  editingSupplier.value = null;
  resetForm();
  isModalOpen.value = true;
}

function openEditModal(supplier: Supplier) {
  editingSupplier.value = supplier;
  Object.assign(form, {
    name: supplier.name,
    email: supplier.email || "",
    phone: supplier.phone || "",
    address: supplier.address || "",
    city: supplier.city || "",
    postalCode: supplier.postalCode || "",
    country: supplier.country || "Brazil",
    notes: supplier.notes || "",
  });
  isModalOpen.value = true;
}

function resetForm() {
  Object.assign(form, {
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Brazil",
    notes: "",
  });
}

async function saveSupplier() {
  if (!form.name.trim()) {
    toast.warning("Por favor, insira o nome do fornecedor");
    return;
  }

  isSubmitting.value = true;
  try {
    if (editingSupplier.value) {
      await $fetch(`/api/suppliers/${editingSupplier.value.id}`, {
        method: "PUT",
        body: form,
      });
      toast.success("Fornecedor atualizado");
    } else {
      await $fetch("/api/suppliers", {
        method: "POST",
        body: form,
      });
      toast.success("Fornecedor adicionado");
    }
    isModalOpen.value = false;
    refresh();
  } catch (error) {
    console.error("Failed to save supplier:", error);
    toast.error("Erro ao salvar fornecedor");
  } finally {
    isSubmitting.value = false;
  }
}

async function deleteSupplier(id: string, name: string) {
  if (!confirm(`Tem certeza que deseja excluir "${name}"?`)) return;

  try {
    await $fetch(`/api/suppliers/${id}`, { method: "DELETE" });
    toast.success("Fornecedor excluído");
    refresh();
  } catch (error) {
    console.error("Failed to delete supplier:", error);
    toast.error("Erro ao excluir fornecedor");
  }
}

const totalSuppliers = computed(() => suppliers.value?.length ?? 0);
const activeSuppliers = computed(
  () => suppliers.value?.filter((s) => s.isActive).length ?? 0,
);
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-semibold text-gray-900">Fornecedores</h1>
        <p class="text-xs text-gray-500">
          Gerencie os fornecedores de produtos
        </p>
      </div>
      <button class="btn-primary" @click="openCreateModal">
        <Icon name="lucide:plus" class="h-3.5 w-3.5" />
        Adicionar
      </button>
    </div>

    <div class="flex gap-3">
      <div
        class="flex items-center gap-2 rounded border border-gray-200 bg-white px-3 py-1.5"
      >
        <Icon name="lucide:truck" class="h-3.5 w-3.5 text-gray-400" />
        <span class="text-xs">
          <span class="font-medium font-mono">{{ totalSuppliers }}</span>
          <span class="text-gray-500"> total</span>
        </span>
      </div>
      <div
        class="flex items-center gap-2 rounded border border-green-200 bg-green-50 px-3 py-1.5"
      >
        <Icon name="lucide:check-circle" class="h-3.5 w-3.5 text-green-600" />
        <span class="text-xs">
          <span class="font-medium font-mono text-green-700">{{
            activeSuppliers
          }}</span>
          <span class="text-green-600"> ativos</span>
        </span>
      </div>
    </div>

    <div class="card overflow-hidden">
      <UiDataTable
        :columns="columns"
        :data="suppliers || []"
        :loading="pending"
        empty-title="Nenhum fornecedor"
        empty-description="Adicione fornecedores para rastrear origens."
        empty-icon="lucide:truck"
        hoverable
      >
        <template #name="{ item }">
          <div class="flex items-center gap-2.5">
            <div
              class="flex h-7 w-7 items-center justify-center rounded bg-gray-100"
            >
              <Icon
                name="lucide:building-2"
                class="h-3.5 w-3.5 text-gray-500"
              />
            </div>
            <div>
              <p class="text-xs font-medium text-gray-900">{{ item.name }}</p>
              <p
                v-if="item.notes"
                class="max-w-[180px] truncate text-xs text-gray-500"
              >
                {{ item.notes }}
              </p>
            </div>
          </div>
        </template>

        <template #contact="{ item }">
          <div class="space-y-0.5">
            <p
              v-if="item.email"
              class="flex items-center gap-1.5 text-xs text-gray-500"
            >
              <Icon name="lucide:mail" class="h-3 w-3" />
              {{ item.email }}
            </p>
            <p
              v-if="item.phone"
              class="flex items-center gap-1.5 text-xs text-gray-500"
            >
              <Icon name="lucide:phone" class="h-3 w-3" />
              {{ item.phone }}
            </p>
            <span v-if="!item.email && !item.phone" class="text-gray-400"
              >—</span
            >
          </div>
        </template>

        <template #location="{ item }">
          <div
            v-if="item.city || item.country"
            class="flex items-center gap-1.5"
          >
            <Icon name="lucide:map-pin" class="h-3 w-3 text-gray-400" />
            <div>
              <p class="text-xs text-gray-600">
                {{ [item.city, item.country].filter(Boolean).join(", ") }}
              </p>
              <p v-if="item.postalCode" class="text-xs text-gray-400">
                {{ item.postalCode }}
              </p>
            </div>
          </div>
          <span v-else class="text-gray-400">—</span>
        </template>

        <template #status="{ item }">
          <span :class="['badge', item.isActive ? 'badge-success' : 'badge']">
            {{ item.isActive ? "Ativo" : "Inativo" }}
          </span>
        </template>

        <template #actions="{ item }">
          <div
            class="flex justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <button
              class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              @click="openEditModal(item)"
              aria-label="Editar"
            >
              <Icon name="lucide:pencil" class="h-3.5 w-3.5" />
            </button>
            <button
              class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              @click="deleteSupplier(item.id, item.name)"
              aria-label="Excluir"
            >
              <Icon name="lucide:trash-2" class="h-3.5 w-3.5" />
            </button>
          </div>
        </template>
      </UiDataTable>
    </div>

    <UiModal
      v-model:open="isModalOpen"
      :title="editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'"
      size="lg"
    >
      <form id="supplier-form" class="space-y-4" @submit.prevent="saveSupplier">
        <div class="rounded border border-gray-200 bg-gray-50 p-3">
          <h3
            class="mb-3 flex items-center gap-1.5 text-xs font-medium text-gray-700 uppercase tracking-wide"
          >
            <Icon name="lucide:building-2" class="h-3.5 w-3.5" />
            Informações Básicas
          </h3>
          <div>
            <label class="label"
              >Nome <span class="text-red-500">*</span></label
            >
            <UiInput
              v-model="form.name"
              placeholder="Nome do fornecedor"
              autofocus
            />
          </div>
        </div>

        <div class="rounded border border-gray-200 bg-gray-50 p-3">
          <h3
            class="mb-3 flex items-center gap-1.5 text-xs font-medium text-gray-700 uppercase tracking-wide"
          >
            <Icon name="lucide:contact" class="h-3.5 w-3.5" />
            Contacto
          </h3>
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label class="label">Email</label>
              <UiInput
                v-model="form.email"
                type="email"
                placeholder="email@fornecedor.com"
              />
            </div>
            <div>
              <label class="label">Telefone</label>
              <UiInput v-model="form.phone" placeholder="+351 912 345 678" />
            </div>
          </div>
        </div>

        <div class="rounded border border-gray-200 bg-gray-50 p-3">
          <h3
            class="mb-3 flex items-center gap-1.5 text-xs font-medium text-gray-700 uppercase tracking-wide"
          >
            <Icon name="lucide:map-pin" class="h-3.5 w-3.5" />
            Endereço
          </h3>
          <div class="space-y-3">
            <div>
              <label class="label">Rua</label>
              <UiInput
                v-model="form.address"
                placeholder="Rua Principal, 123"
              />
            </div>
            <div class="grid gap-3 sm:grid-cols-3">
              <div>
                <label class="label">Cidade</label>
                <UiInput v-model="form.city" placeholder="Lisboa" />
              </div>
              <div>
                <label class="label">Código Postal</label>
                <UiInput v-model="form.postalCode" placeholder="1000-001" />
              </div>
              <div>
                <label class="label">País</label>
                <UiInput v-model="form.country" placeholder="Portugal" />
              </div>
            </div>
          </div>
        </div>

        <div class="rounded border border-gray-200 bg-gray-50 p-3">
          <h3
            class="mb-3 flex items-center gap-1.5 text-xs font-medium text-gray-700 uppercase tracking-wide"
          >
            <Icon name="lucide:file-text" class="h-3.5 w-3.5" />
            Observações
          </h3>
          <textarea
            v-model="form.notes"
            class="input min-h-[80px] w-full resize-none p-3"
            placeholder="Notas adicionais sobre o fornecedor..."
          />
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          class="btn-secondary"
          :disabled="isSubmitting"
          @click="isModalOpen = false"
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="supplier-form"
          class="btn-primary"
          :disabled="isSubmitting"
        >
          <Icon
            v-if="isSubmitting"
            name="lucide:loader-2"
            class="h-3.5 w-3.5 animate-spin"
          />
          {{ editingSupplier ? "Atualizar" : "Adicionar" }}
        </button>
      </template>
    </UiModal>
  </div>
</template>
