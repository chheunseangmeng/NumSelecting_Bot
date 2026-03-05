import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGridStore = defineStore('grid', () => {
  // State
  const selectedNumbers = ref([])
  const user = ref(null)
  const startParam = ref('')
  const MAX_SELECTION = 2  // Maximum 2 numbers can be selected
  
  // Getters
  const selectedCount = computed(() => selectedNumbers.value.length)
  
  const sortedNumbers = computed(() => {
    return [...selectedNumbers.value].sort((a, b) => a - b)
  })
  
  const isSelected = (number) => {
    return selectedNumbers.value.includes(number)
  }
  
  const canSelectMore = computed(() => {
    return selectedNumbers.value.length < MAX_SELECTION
  })
  
  // Actions
  function selectNumber(number) {
    if (!selectedNumbers.value.includes(number) && selectedNumbers.value.length < MAX_SELECTION) {
      selectedNumbers.value.push(number)
    }
  }
  
  function deselectNumber(number) {
    const index = selectedNumbers.value.indexOf(number)
    if (index > -1) {
      selectedNumbers.value.splice(index, 1)
    }
  }
  
  function toggleNumber(number) {
    if (selectedNumbers.value.includes(number)) {
      deselectNumber(number)
    } else if (selectedNumbers.value.length < MAX_SELECTION) {
      selectNumber(number)
    }
  }
  
  function clearSelection() {
    selectedNumbers.value = []
  }
  
  function setUser(telegramUser) {
    user.value = telegramUser
  }
  
  function setStartParam(param) {
    startParam.value = param
  }
  
  function saveToStorage() {
    try {
      localStorage.setItem('selectedNumbers', JSON.stringify(selectedNumbers.value))
    } catch (error) {
      console.warn('Unable to save selected numbers to localStorage:', error)
    }
  }
  
  function loadFromStorage() {
    try {
      const saved = localStorage.getItem('selectedNumbers')
      if (!saved) return
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        selectedNumbers.value = parsed
      }
    } catch (error) {
      console.warn('Unable to load selected numbers from localStorage:', error)
    }
  }
  
  return {
    // State
    selectedNumbers,
    user,
    startParam,
    MAX_SELECTION,
    
    // Getters
    selectedCount,
    sortedNumbers,
    isSelected,
    canSelectMore,
    
    // Actions
    selectNumber,
    deselectNumber,
    toggleNumber,
    clearSelection,
    setUser,
    setStartParam,
    saveToStorage,
    loadFromStorage
  }
})
