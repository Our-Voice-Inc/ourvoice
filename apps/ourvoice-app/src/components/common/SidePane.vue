<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" class="relative z-30" :open="open" @close="open = false">
      <div class="fixed inset-0" />

      <div class="fixed inset-0 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
          <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <DialogPanel class="pointer-events-auto w-screen max-w-md">
              <div class="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                <div class="px-4 sm:px-6">
                  <div class="flex items-start justify-between">
                    <DialogTitle class="text-base font-semibold leading-6 text-gray-900"
                      >Moderation History</DialogTitle
                    >
                    <div class="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        class="rounded-md bg-white text-gray-400 hover:text-gray-500"
                        @click="open = false"
                        data-cy="side-pane-close-button"
                      >
                        <font-awesome-icon class="h-6 w-6" :icon="faXmark" />
                      </button>
                    </div>
                  </div>
                </div>
                <div class="relative mt-6 flex-1 px-4 sm:px-6">
                  <slot></slot>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot } from '@headlessui/vue'
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const emit = defineEmits(['side-pane-toggle'])
const open = ref(true)

watchEffect(() => {
  emit('side-pane-toggle', open.value)
})
</script>
