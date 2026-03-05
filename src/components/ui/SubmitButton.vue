<template>
  <button 
    class="w-full py-4 px-6 rounded-xl text-lg font-bold transition-all
           active:scale-98 disabled:opacity-30 disabled:cursor-not-allowed
           focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-button-color)]"
    :class="[
      variant === 'primary' 
        ? 'bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] hover:opacity-90' 
        : 'bg-gray-300 text-gray-500'
    ]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot>{{ text }}</slot>
  </button>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: 'Submit'
  },
  variant: {
    type: String,
    default: 'primary'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>