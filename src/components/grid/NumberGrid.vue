<template>
  <div class="flex gap-2 justify-center max-w-md mx-auto">
    <div 
      v-for="col in 4" 
      :key="col" 
      class="flex-1 flex flex-col gap-2"
    >
      <GridCell
        v-for="row in 10"
        :key="`${col}-${row}`"
        :number="(col - 1) * 10 + row"
      />
    </div>
  </div>
</template>

<script setup>
import GridCell from './GridCell.vue'
</script>