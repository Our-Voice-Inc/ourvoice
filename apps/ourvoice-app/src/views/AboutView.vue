<template>
  <!-- <div class="container flex flex-col-reverse lg:flex-row items-center gap-12 mt-14 lg:mt-28 fill">
    <div class="flex fill flex-1 flex-col items-center lg:items-start">
      <h1 class="text-btn-secondary-1 text-5xl md:text-6 lg:text-6xl text-center lg:text-left mb-6">
        <span class="text-ourvoice-primary-2">OurVoice</span> App
      </h1>
      <faq />
    </div>
  </div> -->
  <div class="p-4 md:p-12 lg:p-24 flex flex-col items-center">
    <div class="w-full flex flex-col md:grid md:grid-cols-5 gap-2">
      <BackButton />
      <div class="mt-4 md:mt-0 col-span-3 justify-self-center">
        <h1
          class="text-btn-secondary-1 text-4xl md:text-6xl text-center lg:text-left mb-6"
        >
          <span class="text-ourvoice-primary-2">OurVoice</span> App
        </h1>
      </div>
    </div>
    <!-- class used to scope element styling (see main.css) -->
    <div class="faq-md max-w-[800px]">
      <faq />
    </div>
  </div>
</template>

<script setup lang="ts">
import faq from '../../../../config/content/faq.md'
import BackButton from '@/components/common/BackButton.vue'
</script>

<style scoped>
.fill {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  width: 100%;
}
</style>
