<template>
  <button 
    class="w-full aspect-square rounded-xl font-bold text-lg transition-all duration-200
           flex items-center justify-center shadow-sm active:scale-95
           focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-button-color)]"
    :class="[
      store.isSelected(number)
        ? 'bg-[var(--tg-theme-accent-text-color,#6ab2f2)] text-white border-2 border-white scale-102 shadow-md' 
        : store.canSelectMore
          ? 'bg-[var(--tg-theme-button-color,#40a7e3)] text-[var(--tg-theme-button-text-color,white)] hover:opacity-90'
          : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
    ]"
    @click="handleClick"
    :disabled="!store.isSelected(number) && !store.canSelectMore"
  >
    {{ number }}
  </button>
</template>

<script setup>
import { useGridStore } from '../../stores/gridStore'

const props = defineProps({
  number: {
    type: Number,
    required: true
  }
})

const store = useGridStore()

const handleClick = () => {
  if (store.isSelected(props.number) || store.canSelectMore) {
    store.toggleNumber(props.number)
  }
}
</script>