<template>
  <div data-cy="comment-version-list">
    <ul
      class="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl"
    >
      <li
        v-for="version in props.versions"
        :key="version.id"
        class="relative flex justify-between items-center gap-x-6 p-3 hover:bg-slate-100 hover:cursor-pointer sm:px-6"
        :class="isSelected(version) && 'bg-slate-200'"
        @click="() => handleVersionClick(version)"
      >
        <div class="flex gap-x-4 items-center">
          <div class="min-w-0 flex-auto" data-cy="version-label">
            <p class="text-xs font-semibold mt-1.5 text-gray-900">Version {{ version.version }}</p>
          </div>
          <div class="hidden sm:flex sm:flex-col sm:items-start space-y-2">
            <p
              v-if="version.moderations !== null && version.moderations.length > 0 && version.moderations[0].timestamp"
              class="mt-1 text-xs leading-5 text-gray-500"
            >
              Last moderated <br />
              <time :datetime="version.moderations[0].timestamp">
                {{ `${formatTimestampToReadableDate(+version.moderations[0].timestamp)}` }}
              </time>
            </p>
            <p v-else class="mt-1 text-xs leading-5 text-gray-500">Not moderated yet</p>
            <div data-cy="action-badge">
              <span
                v-if="version.id === originalCommentVersion.id"
                class="inline-flex flex-shrink-0 rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
              >
                Original
              </span>

              <span
                v-else
                class="inline-flex flex-shrink-0 rounded-full bg-yellow-50 px-1.5 py-0.5 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20"
              >
                Modified
              </span>
            </div>
          </div>
        </div>
        <div>
          <font-awesome-icon :icon="faChevronRight" />
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { PropType } from 'vue'

import { formatTimestampToReadableDate } from '@/utils'
import type { ModerationCommentVersion } from '@/stores/comment-moderation'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

const props = defineProps({
  versions: {
    type: Array as PropType<ModerationCommentVersion[]>,
    required: true
  }
})

const emit = defineEmits(['versionClicked'])

const selected = ref<ModerationCommentVersion | null>(null)
const isSelected = computed(() => {
  return (commentVersion: ModerationCommentVersion) => commentVersion === selected.value
})
const originalCommentVersion = ref(props.versions[props.versions.length - 1])

onMounted(() => {
  selected.value = props.versions[0]
})

const handleVersionClick = (version: ModerationCommentVersion) => {
  selected.value = version
  emit('versionClicked', version)
}
</script>
