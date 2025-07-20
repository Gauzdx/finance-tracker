<template>
    <div class="search-container">
        <div class="search-filters">
            <v-text-field
                v-model="searchQuery"
                label="Search by merchant name..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                clearable
                @input="handleSearch"
                @click:clear="clearMerchantSearch"
                density="compact"
                class="search-field"
            ></v-text-field>
            
            <v-combobox
                v-model="selectedAccount"
                label="Filter by account..."
                :items="accountOptions"
                variant="outlined"
                clearable
                density="compact"
                class="filter-field"
                :custom-filter="accountFilter"
                hide-no-data
                @update:model-value="handleAccountFilter"
                @click:clear="clearAccountFilter"
            ></v-combobox>
            
            <v-combobox
                v-model="selectedCategory"
                label="Filter by category..."
                :items="categoryOptions"
                variant="outlined"
                clearable
                density="compact"
                class="filter-field"
                :custom-filter="categoryFilter"
                hide-no-data
                @update:model-value="handleCategoryFilter"
                @click:clear="clearCategoryFilter"
            ></v-combobox>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const searchQuery = ref('')
const selectedAccount = ref('')
const selectedCategory = ref('')

const props = defineProps({
    accounts: {
        type: Array,
        required: true
    },
    categories: {
        type: Array,
        required: true
    }
})

const emit = defineEmits(['filter'])

// Create options for dropdowns
const accountOptions = computed(() => 
    props.accounts.map(account => account.account_id).filter(Boolean)
)

const categoryOptions = computed(() => 
    props.categories.map(category => category.category_name).filter(Boolean)
)

// Custom filter functions
const accountFilter = (item, queryText) => {
    if (!queryText) return true
    return item.toLowerCase().includes(queryText.toLowerCase())
}

const categoryFilter = (item, queryText) => {
    if (!queryText) return true
    return item.toLowerCase().includes(queryText.toLowerCase())
}

// Handle filter changes
const handleSearch = () => {
    emitFilters()
}

const handleAccountFilter = () => {
    emitFilters()
}

const handleCategoryFilter = () => {
    emitFilters()
}

// Clear individual filters
const clearMerchantSearch = () => {
    searchQuery.value = ''
    emitFilters()
}

const clearAccountFilter = () => {
    selectedAccount.value = ''
    emitFilters()
}

const clearCategoryFilter = () => {
    selectedCategory.value = ''
    emitFilters()
}

// Emit all current filter values
const emitFilters = () => {
    emit('filter', {
        merchant: searchQuery.value || '',
        account: selectedAccount.value || '',
        category: selectedCategory.value || ''
    })
}

// Watch for changes in any filter to emit filter events
watch([searchQuery, selectedAccount, selectedCategory], () => {
    emitFilters()
})
</script>

<style scoped>
.search-container {
    margin: 20px 0;
}

.search-filters {
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
}

.search-field {
    flex: 2;
    min-width: 250px;
}

.filter-field {
    flex: 1;
    min-width: 200px;
}

@media (max-width: 768px) {
    .search-filters {
        flex-direction: column;
        gap: 12px;
    }
    
    .search-field,
    .filter-field {
        width: 100%;
        min-width: unset;
    }
}

@media (max-width: 480px) {
    .search-container {
        margin: 15px 0;
    }
    
    .search-filters {
        gap: 10px;
    }
}
</style>