<template>
    <div class="search-container">
        <v-text-field
            v-model="searchQuery"
            label="Search by merchant name..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            clearable
            @input="handleSearch"
            @click:clear="clearSearch"
            density="compact"
            class="search-field"
        ></v-text-field>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const searchQuery = ref('')

const emit = defineEmits(['search'])

const handleSearch = () => {
    emit('search', searchQuery.value)
}

const clearSearch = () => {
    searchQuery.value = ''
    emit('search', '')
}

// Watch for changes in searchQuery to emit search events
watch(searchQuery, (newValue) => {
    emit('search', newValue || '')
})
</script>

<style scoped>
.search-container {
    margin: 20px 0;
}

.search-field {
    max-width: 400px;
}

@media (max-width: 768px) {
    .search-field {
        max-width: 100%;
    }
}
</style>