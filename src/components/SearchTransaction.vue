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
        
        <div class="date-filters">
            <v-date-input
                v-model="fromDate"
                label="From Date"
                prepend-inner-icon="$calendar"
                prepend-icon=""
                variant="outlined"
                clearable
                density="compact"
                class="date-field"
                @update:model-value="handleDateFilter"
                @click:clear="clearFromDate"
            ></v-date-input>
            
            <v-date-input
                v-model="toDate"
                label="To Date"
                prepend-inner-icon="$calendar"
                prepend-icon=""
                variant="outlined"
                clearable
                density="compact"
                class="date-field"
                @update:model-value="handleDateFilter"
                @click:clear="clearToDate"
            ></v-date-input>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { VDateInput } from 'vuetify/labs/VDateInput'

const searchQuery = ref('')
const selectedAccount = ref('')
const selectedCategory = ref('')
const fromDate = ref(null)
const toDate = ref(null)

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

const handleDateFilter = () => {
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

const clearFromDate = () => {
    fromDate.value = null
    emitFilters()
}

const clearToDate = () => {
    toDate.value = null
    emitFilters()
}

// Helper function to format date for comparison
const formatDateForComparison = (date) => {
    if (!date) return null
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// Emit all current filter values
const emitFilters = () => {
    emit('filter', {
        merchant: searchQuery.value || '',
        account: selectedAccount.value || '',
        category: selectedCategory.value || '',
        fromDate: formatDateForComparison(fromDate.value) || '',
        toDate: formatDateForComparison(toDate.value) || ''
    })
}

// Watch for changes in any filter to emit filter events
watch([searchQuery, selectedAccount, selectedCategory, fromDate, toDate], () => {
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
    margin-bottom: 16px;
}

.date-filters {
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

.date-field {
    flex: 1;
    min-width: 180px;
}

@media (max-width: 768px) {
    .search-filters,
    .date-filters {
        flex-direction: column;
        gap: 12px;
    }
    
    .search-field,
    .filter-field,
    .date-field {
        width: 100%;
        min-width: unset;
    }
}

@media (max-width: 480px) {
    .search-container {
        margin: 15px 0;
    }
    
    .search-filters,
    .date-filters {
        gap: 10px;
    }
}

/* Fix date picker visibility issues */
:deep(.v-date-picker) {
    background-color: white !important;
}

:deep(.v-date-picker .v-btn--variant-text) {
    color: #333 !important;
}

:deep(.v-date-picker .v-btn--active) {
    background-color: #1976d2 !important;
    color: white !important;
}

:deep(.v-date-picker .v-btn--selected) {
    background-color: #1976d2 !important;
    color: white !important;
}

:deep(.v-date-picker-month__day--selected) {
    background-color: #1976d2 !important;
    color: white !important;
}

:deep(.v-date-picker-month__day--today) {
    border: 2px solid #1976d2 !important;
    color: #1976d2 !important;
}

:deep(.v-date-picker-header) {
    background-color: white !important;
    color: #333 !important;
}

:deep(.v-date-picker-header .v-btn) {
    color: #333 !important;
}

:deep(.v-date-picker-month__day) {
    color: #333 !important;
}

:deep(.v-date-picker-month__weekday) {
    color: #666 !important;
}

/* Fix date input field text visibility */
:deep(.v-field__input) {
    color: #333 !important;
}

:deep(.v-field--active .v-field__input) {
    color: #333 !important;
}
</style>